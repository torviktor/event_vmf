import { useState, useEffect } from 'react'
import { api } from '../api'

const DEFAULT_CHECKLIST = [
  { id: 1, title: 'Сайт-приглашение',                    responsible: 'Веревкин Виктор',  done: true  },
  { id: 2, title: 'Проход в институт',                   responsible: 'Определяется',      done: false },
  { id: 3, title: 'Сувениры для преподавателей',         responsible: 'Определяется',      done: false },
  { id: 4, title: 'Подарки детям',                       responsible: 'Определяется',      done: false },
  { id: 5, title: 'Ресторан',                            responsible: 'Определяется',      done: false },
  { id: 6, title: 'Сбор контактов и RSVP',               responsible: 'Определяется',      done: false },
  { id: 7, title: 'Бюджет и взносы',                     responsible: 'Определяется',      done: false },
  { id: 8, title: 'Фотограф / видео',                    responsible: 'Определяется',      done: false },
]

export default function Admin() {
  const [token, setToken]         = useState(localStorage.getItem('admin_token') || '')
  const [password, setPassword]   = useState('')
  const [loginError, setLoginError] = useState('')
  const [tab, setTab]             = useState('guests')

  const [guests, setGuests]       = useState([])
  const [stats, setStats]         = useState(null)
  const [guestsLoading, setGuestsLoading] = useState(false)

  const [info, setInfo]           = useState({})
  const [infoEdits, setInfoEdits] = useState({})
  const [infoSaving, setInfoSaving] = useState('')

  // Checklist stored in info as JSON under key "checklist"
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST)
  const [checklistSaving, setChecklistSaving] = useState(false)
  const [checklistMsg, setChecklistMsg] = useState('')

  const [pollTitle, setPollTitle]   = useState('')
  const [pollOptions, setPollOptions] = useState('14 июня (суббота)\n21 июня (суббота)\n28 июня (суббота)')
  const [pollMsg, setPollMsg]       = useState('')

  // Payments
  const [paymentsSummary, setPaymentsSummary] = useState(null)
  const [restaurantDepositInput, setRestaurantDepositInput] = useState('')
  const [kidsRuleInput, setKidsRuleInput] = useState('free')
  const [paymentSettingsSaving, setPaymentSettingsSaving] = useState(false)
  const [paymentSettingsMsg, setPaymentSettingsMsg] = useState('')

  // Spouse name editing (по ID гостя)
  const [spouseEdits, setSpouseEdits] = useState({})    // { [id]: "имя" }
  const [spouseSavingId, setSpouseSavingId] = useState(null)

  // Payment requisites (info-keys + QR)
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [reqsEdits, setReqsEdits] = useState({})
  const [reqsSaving, setReqsSaving] = useState(false)
  const [reqsMsg, setReqsMsg] = useState('')
  const [qrFile, setQrFile] = useState(null)
  const [qrUploading, setQrUploading] = useState(false)
  const [qrMsg, setQrMsg] = useState('')
  const [qrCacheBust, setQrCacheBust] = useState(0)

  async function login() {
    try {
      const res = await api.login(password)
      localStorage.setItem('admin_token', res.token)
      setToken(res.token)
      setLoginError('')
    } catch { setLoginError('Неверный пароль') }
  }

  function logout() { localStorage.removeItem('admin_token'); setToken('') }

  async function loadGuests() {
    setGuestsLoading(true)
    try {
      const [g, s] = await Promise.all([api.getGuests(), api.getStats()])
      setGuests(g); setStats(s)
    } catch {}
    setGuestsLoading(false)
  }

  async function loadInfo() {
    try {
      const i = await api.getInfo()
      setInfo(i)
      setInfoEdits(i)
      setRestaurantDepositInput(i.restaurant_deposit || '')
      setKidsRuleInput(i.restaurant_kids_rule || 'free')
      if (i.checklist) {
        try { setChecklist(JSON.parse(i.checklist)) } catch {}
      }
    } catch {}
  }

  async function loadPaymentsSummary() {
    try { setPaymentsSummary(await api.getPaymentsSummary()) } catch {}
  }

  async function loadPaymentInfo() {
    try {
      const p = await api.getPaymentInfo()
      setPaymentInfo(p)
      setReqsEdits({
        recipient_name:  p.recipient_name  || '',
        recipient_phone: p.recipient_phone || '',
        recipient_bank:  p.recipient_bank  || '',
        amount_label:    p.amount_label    || '',
        comment:         p.comment         || '',
      })
    } catch {}
  }

  useEffect(() => { if (token) { loadGuests(); loadInfo(); loadPaymentsSummary(); loadPaymentInfo() } }, [token])

  async function togglePayment(guestId, category, currentPaid) {
    const next = !currentPaid
    // оптимистично
    setGuests(prev => prev.map(g => g.id === guestId
      ? { ...g, [category === 'photographer' ? 'paid_photographer' : 'paid_restaurant']: next }
      : g))
    try {
      await api.setPayment(guestId, category, next)
      loadPaymentsSummary()
    } catch (e) {
      // откат
      setGuests(prev => prev.map(g => g.id === guestId
        ? { ...g, [category === 'photographer' ? 'paid_photographer' : 'paid_restaurant']: currentPaid }
        : g))
      alert('Не удалось сохранить: ' + (e.message || 'ошибка'))
    }
  }

  async function saveSpouseName(guestId) {
    // Берём то, что реально показано в инпуте: либо отредактированное, либо текущее значение из БД.
    const edited = spouseEdits[guestId]
    const dbValue = (guests.find(g => g.id === guestId)?.spouse_name) || ''
    const value = (edited !== undefined ? edited : dbValue).trim()
    setSpouseSavingId(guestId)
    try {
      await api.setSpouseName(guestId, value)
      setGuests(prev => prev.map(g => g.id === guestId ? { ...g, spouse_name: value || null } : g))
      setSpouseEdits(prev => { const next = { ...prev }; delete next[guestId]; return next })
    } catch (e) {
      alert('Не удалось сохранить имя супруга/супруги: ' + (e.message || ''))
    }
    setSpouseSavingId(null)
  }

  async function saveReqs() {
    setReqsSaving(true); setReqsMsg('')
    try {
      await api.updatePaymentInfo(reqsEdits)
      await loadPaymentInfo()
      setReqsMsg('✓ Сохранено')
      setTimeout(() => setReqsMsg(''), 2000)
    } catch (e) {
      setReqsMsg('Ошибка: ' + (e.message || ''))
    }
    setReqsSaving(false)
  }

  async function uploadQr() {
    if (!qrFile) return
    setQrUploading(true); setQrMsg('')
    try {
      await api.uploadPaymentQr(qrFile)
      await loadPaymentInfo()
      setQrFile(null)
      setQrCacheBust(Date.now())
      setQrMsg('✓ Загружено')
      setTimeout(() => setQrMsg(''), 2000)
    } catch (e) {
      setQrMsg('Ошибка: ' + (e.message || ''))
    }
    setQrUploading(false)
  }

  async function savePaymentSettings() {
    setPaymentSettingsSaving(true); setPaymentSettingsMsg('')
    try {
      await api.setInfo('restaurant_deposit', restaurantDepositInput.trim())
      await api.setInfo('restaurant_kids_rule', kidsRuleInput)
      await loadInfo()
      await loadPaymentsSummary()
      setPaymentSettingsMsg('✓ Сохранено')
      setTimeout(() => setPaymentSettingsMsg(''), 2000)
    } catch (e) {
      setPaymentSettingsMsg('Ошибка: ' + (e.message || ''))
    }
    setPaymentSettingsSaving(false)
  }

  async function toggleConfirm(id) { await api.confirmGuest(id); loadGuests() }
  async function deleteGuest(id) {
    if (!confirm('Удалить участника?')) return
    await api.deleteGuest(id); loadGuests()
  }

  async function saveInfo(key) {
    setInfoSaving(key)
    try { await api.setInfo(key, infoEdits[key] ?? info[key]); await loadInfo() } catch {}
    setInfoSaving('')
  }

  async function saveChecklist() {
    setChecklistSaving(true); setChecklistMsg('')
    try {
      await api.setInfo('checklist', JSON.stringify(checklist))
      setChecklistMsg('✓ Сохранено')
      setTimeout(() => setChecklistMsg(''), 2000)
    } catch { setChecklistMsg('Ошибка сохранения') }
    setChecklistSaving(false)
  }

  function setResponsible(id, value) {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, responsible: value } : item))
  }

  function toggleDone(id) {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item))
  }

  const photoEmails = guests
    .map(g => {
      const match = g.message && g.message.match(/Почта для фото: ([^\s|]+)/)
      return match ? { name: g.name, email: match[1] } : null
    })
    .filter(Boolean)

  const INFO_FIELDS = [
    { key: 'institute_time',   label: 'Время в институте' },
    { key: 'restaurant_time',  label: 'Время в ресторане' },
    { key: 'restaurant_name',  label: 'Название ресторана' },
    { key: 'budget_per_person',label: 'Бюджет на человека' },
    { key: 'welcome_text',     label: 'Приветственный текст', textarea: true },
  ]

  if (!token) {
    return (
      <div className="section" style={{maxWidth:'420px'}}>
        <h2 className="section-title">Панель организатора</h2>
        <div className="form-wrap">
          {loginError && <div className="alert alert-error">{loginError}</div>}
          <div className="form-group" style={{marginBottom:'1rem'}}>
            <label>Пароль администратора</label>
            <input type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()} />
          </div>
          <button className="btn btn-primary" onClick={login}>Войти</button>
        </div>
      </div>
    )
  }

  return (
    <div className="section" style={{maxWidth:'1100px'}}>
      <div className="flex justify-between items-center mb-2" style={{flexWrap:'wrap', gap:'1rem'}}>
        <h2 className="section-title" style={{marginBottom:0}}>Панель организатора</h2>
        <button className="btn btn-outline btn-sm" onClick={logout}>Выйти</button>
      </div>

      {stats && (
        <div style={{display:'flex', gap:'0.8rem', marginBottom:'1.5rem', flexWrap:'wrap'}}>
          {[
            ['Всего участников', stats.total_guests],
            ['Взрослых', stats.total_adults],
            ['Детей', stats.total_children],
            ['На экскурсию', stats.institute],
          ].map(([label, val]) => (
            <div key={label} style={{background:'var(--navy)', color:'var(--white)', padding:'0.9rem 1.5rem', borderRadius:'8px', textAlign:'center'}}>
              <div style={{fontFamily:'Playfair Display,serif', fontSize:'1.7rem', color:'var(--gold)', lineHeight:1}}>{val}</div>
              <div style={{fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'0.2rem', opacity:0.6}}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{display:'flex', gap:'0.5rem', marginBottom:'1.5rem', borderBottom:'2px solid var(--border)'}}>
        {[
          ['guests',    'Участники'],
          ['payments',  'Оплаты'],
          ['photos',    'Доступ к фото'],
          ['checklist', 'Оргкомитет'],
          ['info',      'Настройки'],
          ['poll',      'Голосование'],
        ].map(([t, label]) => (
          <button key={t} className="btn btn-sm"
            style={{background: tab===t ? 'var(--navy)' : 'transparent', color: tab===t ? 'var(--white)' : 'var(--text-muted)', border:'none', borderRadius:'6px 6px 0 0', paddingBottom:'0.75rem'}}
            onClick={() => setTab(t)}>{label}
          </button>
        ))}
      </div>

      {/* Guests */}
      {tab === 'guests' && (
        <>
          <div style={{marginBottom:'1rem', display:'flex', justifyContent:'flex-end', gap:'0.8rem'}}>
            <button className="btn btn-gold btn-sm" onClick={loadGuests}>Обновить</button>
            <a href="/api/export/guests.csv" download>
              <button className="btn btn-primary btn-sm">Скачать CSV (Excel)</button>
            </a>
          </div>
          {guestsLoading ? <div className="spinner" /> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>#</th><th>ФИО</th><th>Телефон</th><th>Кафедра</th><th>Состав</th><th>Программа</th><th>Статус</th><th>Действия</th></tr>
                </thead>
                <tbody>
                  {guests.length === 0 && (
                    <tr><td colSpan="8" className="text-center" style={{color:'var(--text-muted)', padding:'2rem'}}>Заявок пока нет</td></tr>
                  )}
                  {guests.map((g, i) => (
                    <tr key={g.id}>
                      <td style={{color:'var(--text-muted)'}}>{i+1}</td>
                      <td>
                        <strong>{g.name}</strong>
                        {g.message && <div style={{fontSize:'0.82rem', color:'var(--text-muted)', marginTop:'0.2rem', fontStyle:'italic'}}>"{g.message}"</div>}
                      </td>
                      <td>{g.phone}</td>
                      <td style={{color:'var(--text-muted)', fontSize:'0.9rem'}}>{g.specialty || '—'}</td>
                      <td style={{fontSize:'0.9rem'}}>
                        {g.adults_count} взр.
                        {g.adults_count >= 2 && (
                          <div style={{display:'flex', gap:'0.3rem', alignItems:'center', marginTop:'0.3rem', flexWrap:'wrap'}}>
                            <input
                              type="text"
                              placeholder="Имя супруга/супруги"
                              value={spouseEdits[g.id] !== undefined ? spouseEdits[g.id] : (g.spouse_name || '')}
                              onChange={e => setSpouseEdits(prev => ({...prev, [g.id]: e.target.value}))}
                              style={{flex:'1 1 140px', minWidth:'120px', border:'1px solid var(--cream-dark)', borderRadius:'4px', padding:'0.3rem 0.5rem', fontFamily:'Raleway,sans-serif', fontSize:'0.82rem', background:'var(--cream)', outline:'none'}}
                            />
                            <button
                              className="btn btn-sm btn-gold"
                              style={{padding:'0.25rem 0.6rem', fontSize:'0.72rem'}}
                              disabled={spouseSavingId === g.id}
                              onClick={() => saveSpouseName(g.id)}
                            >
                              {spouseSavingId === g.id ? '...' : 'OK'}
                            </button>
                          </div>
                        )}
                        {g.children.map((c,ci) => (
                          <div key={ci} style={{color:'var(--text-muted)', fontSize:'0.82rem'}}>{c.name||`Ребёнок ${ci+1}`}, {c.age||'?'} л.</div>
                        ))}
                      </td>
                      <td style={{fontSize:'0.85rem'}}>
                        {g.will_attend_institute && <div>Институт</div>}
                        {g.will_attend_restaurant && <div>Ресторан</div>}
                      </td>
                      <td>
                        <span className={`badge ${g.is_confirmed ? 'badge-green' : 'badge-gray'}`}>
                          {g.is_confirmed ? '✓ Подтверждён' : 'Ожидает'}
                        </span>
                      </td>
                      <td>
                        <div style={{display:'flex', gap:'0.4rem', flexDirection:'column'}}>
                          <button className="btn btn-sm btn-gold" onClick={() => toggleConfirm(g.id)}>{g.is_confirmed ? 'Снять' : 'Подтв.'}</button>
                          <button className="btn btn-sm btn-danger" onClick={() => deleteGuest(g.id)}>Удалить</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Payments */}
      {tab === 'payments' && (
        <div>
          <p style={{color:'var(--text-muted)', marginBottom:'1.2rem'}}>
            Учёт оплат по двум категориям: фотограф (фикс. 24&nbsp;000&nbsp;₽ всего, 1&nbsp;500&nbsp;₽ со взрослого) и ресторан (депозит задаёт админ).
          </p>

          {/* Настройки сумм */}
          <div className="form-wrap" style={{marginBottom:'1.5rem'}}>
            <div className="form-grid">
              <div className="form-group">
                <label>Сумма депозита ресторана, ₽</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  placeholder="Например, 80000"
                  value={restaurantDepositInput}
                  onChange={e => setRestaurantDepositInput(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Дети за ресторан</label>
                <select value={kidsRuleInput} onChange={e => setKidsRuleInput(e.target.value)}>
                  <option value="free">Бесплатно</option>
                  <option value="half">Половина</option>
                  <option value="full">Как взрослые</option>
                </select>
              </div>
            </div>
            <div style={{marginTop:'1rem', display:'flex', alignItems:'center', gap:'1rem'}}>
              <button className="btn btn-primary" onClick={savePaymentSettings} disabled={paymentSettingsSaving}>
                {paymentSettingsSaving ? 'Сохранение...' : 'Сохранить'}
              </button>
              {paymentSettingsMsg && (
                <span style={{color: paymentSettingsMsg.startsWith('✓') ? '#155724' : '#721c24', fontWeight:600}}>
                  {paymentSettingsMsg}
                </span>
              )}
            </div>
          </div>

          {/* Таблица оплат */}
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>ФИО</th>
                  <th>Дети</th>
                  <th style={{textAlign:'center', width:'100px'}}>Фото</th>
                  <th style={{textAlign:'center', width:'120px'}}>Ресторан</th>
                </tr>
              </thead>
              <tbody>
                {guests.length === 0 && (
                  <tr><td colSpan="5" className="text-center" style={{color:'var(--text-muted)', padding:'2rem'}}>Заявок пока нет</td></tr>
                )}
                {guests.map((g, i) => {
                  const rows = []
                  rows.push(
                    <tr key={`r-${g.id}`}>
                      <td style={{color:'var(--text-muted)'}}>{i+1}</td>
                      <td>
                        <strong>{g.name}</strong>
                        {!g.is_confirmed && (
                          <div style={{fontSize:'0.78rem', color:'var(--text-muted)', fontStyle:'italic'}}>не подтверждён</div>
                        )}
                      </td>
                      <td style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>
                        {(g.children && g.children.length) ? g.children.map((c,ci) => (
                          <div key={ci}>{c.name||`Ребёнок ${ci+1}`}{c.age ? `, ${c.age} л.` : ''}</div>
                        )) : '—'}
                      </td>
                      <td style={{textAlign:'center'}}>
                        <input
                          type="checkbox"
                          checked={!!g.paid_photographer}
                          onChange={() => togglePayment(g.id, 'photographer', !!g.paid_photographer)}
                          style={{width:'20px', height:'20px', cursor:'pointer'}}
                        />
                      </td>
                      <td style={{textAlign:'center'}}>
                        <input
                          type="checkbox"
                          checked={!!g.paid_restaurant}
                          onChange={() => togglePayment(g.id, 'restaurant', !!g.paid_restaurant)}
                          disabled={!g.will_attend_restaurant}
                          title={!g.will_attend_restaurant ? 'Не идёт в ресторан' : ''}
                          style={{width:'20px', height:'20px', cursor: g.will_attend_restaurant ? 'pointer' : 'not-allowed'}}
                        />
                      </td>
                    </tr>
                  )
                  if ((g.adults_count || 0) >= 2) {
                    const spouseLabel = (g.spouse_name && g.spouse_name.trim()) || 'Супруга'
                    rows.push(
                      <tr key={`s-${g.id}`} style={{background:'rgba(0,0,0,0.015)'}}>
                        <td></td>
                        <td style={{paddingLeft:'1.6rem'}}>
                          <span style={{color:'var(--text-muted)', fontStyle:'italic'}}>{spouseLabel}</span>
                          <span style={{marginLeft:'0.5rem', fontSize:'0.78rem', color:'var(--text-muted)'}}>(супруга)</span>
                        </td>
                        <td></td>
                        <td style={{textAlign:'center', color: g.paid_photographer ? '#1e8449' : 'var(--text-muted)', fontWeight: g.paid_photographer ? 700 : 400}}>
                          {g.paid_photographer ? '✓' : '—'}
                        </td>
                        <td style={{textAlign:'center', color: (g.paid_restaurant && g.will_attend_restaurant) ? '#1e8449' : 'var(--text-muted)', fontWeight: (g.paid_restaurant && g.will_attend_restaurant) ? 700 : 400}}>
                          {g.will_attend_restaurant ? (g.paid_restaurant ? '✓' : '—') : '—'}
                        </td>
                      </tr>
                    )
                  }
                  return rows
                })}
              </tbody>
            </table>
          </div>

          {/* Итоги */}
          {paymentsSummary && (
            <div style={{marginTop:'1.5rem', display:'flex', gap:'0.8rem', flexWrap:'wrap'}}>
              <div style={{flex:'1 1 280px', background:'var(--white)', border:'1px solid var(--border)', borderRadius:'10px', padding:'1rem 1.3rem'}}>
                <div style={{fontSize:'0.78rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', fontWeight:700, marginBottom:'0.4rem'}}>Фотограф собрано</div>
                <div style={{fontFamily:'Playfair Display,serif', fontSize:'1.3rem', color:'var(--navy)'}}>
                  {new Intl.NumberFormat('ru-RU').format(paymentsSummary.photographer.total_collected)} ₽
                  <span style={{color:'var(--text-muted)', fontFamily:'Raleway,sans-serif', fontSize:'0.95rem', fontWeight:400}}>
                    {' '}из {new Intl.NumberFormat('ru-RU').format(paymentsSummary.photographer.total_expected)} ₽
                  </span>
                </div>
                <div style={{fontSize:'0.85rem', color:'var(--text-muted)', marginTop:'0.2rem'}}>
                  {paymentsSummary.photographer.paid_count} оплатили · {paymentsSummary.photographer.unpaid_count} ждём
                </div>
              </div>
              <div style={{flex:'1 1 280px', background:'var(--white)', border:'1px solid var(--border)', borderRadius:'10px', padding:'1rem 1.3rem'}}>
                <div style={{fontSize:'0.78rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', fontWeight:700, marginBottom:'0.4rem'}}>Ресторан собрано</div>
                {paymentsSummary.restaurant.per_person != null ? (
                  <>
                    <div style={{fontFamily:'Playfair Display,serif', fontSize:'1.3rem', color:'var(--navy)'}}>
                      {new Intl.NumberFormat('ru-RU').format(paymentsSummary.restaurant.total_collected)} ₽
                      <span style={{color:'var(--text-muted)', fontFamily:'Raleway,sans-serif', fontSize:'0.95rem', fontWeight:400}}>
                        {' '}из {new Intl.NumberFormat('ru-RU').format(paymentsSummary.restaurant.total_expected)} ₽
                      </span>
                    </div>
                    <div style={{fontSize:'0.85rem', color:'var(--text-muted)', marginTop:'0.2rem'}}>
                      {paymentsSummary.restaurant.paid_count} оплатили · {paymentsSummary.restaurant.unpaid_count} ждём · {new Intl.NumberFormat('ru-RU').format(paymentsSummary.restaurant.per_person)} ₽ с человека
                    </div>
                  </>
                ) : (
                  <div style={{fontSize:'0.95rem', color:'var(--text-muted)', fontStyle:'italic'}}>
                    Сумма депозита не задана
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Реквизиты для перевода */}
          <div style={{marginTop:'2rem'}}>
            <h3 style={{fontFamily:'Playfair Display,serif', color:'var(--navy)', marginBottom:'1rem'}}>Реквизиты для перевода</h3>

            <div className="form-wrap" style={{marginBottom:'1.5rem'}}>
              <div className="form-grid">
                {[
                  ['recipient_name',  'Получатель'],
                  ['recipient_bank',  'Банк'],
                  ['recipient_phone', 'Телефон'],
                  ['amount_label',    'Сумма'],
                ].map(([k, label]) => (
                  <div className="form-group" key={k}>
                    <label>{label}</label>
                    <input type="text"
                      value={reqsEdits[k] ?? ''}
                      onChange={e => setReqsEdits(prev => ({...prev, [k]: e.target.value}))} />
                  </div>
                ))}
                <div className="form-group form-full">
                  <label>Комментарий</label>
                  <input type="text"
                    value={reqsEdits.comment ?? ''}
                    onChange={e => setReqsEdits(prev => ({...prev, comment: e.target.value}))} />
                </div>
              </div>
              <div style={{marginTop:'1rem', display:'flex', alignItems:'center', gap:'1rem'}}>
                <button className="btn btn-primary" onClick={saveReqs} disabled={reqsSaving}>
                  {reqsSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
                {reqsMsg && (
                  <span style={{color: reqsMsg.startsWith('✓') ? '#155724' : '#721c24', fontWeight:600}}>{reqsMsg}</span>
                )}
              </div>
            </div>

            <div className="form-wrap">
              <div style={{fontWeight:700, fontSize:'0.95rem', marginBottom:'0.8rem', color:'var(--navy)'}}>QR-код</div>
              <div style={{display:'flex', gap:'1.5rem', flexWrap:'wrap', alignItems:'center'}}>
                {paymentInfo?.qr_url ? (
                  <img
                    src={qrCacheBust ? `${paymentInfo.qr_url}?v=${qrCacheBust}` : paymentInfo.qr_url}
                    alt="Текущий QR"
                    style={{width:'140px', height:'140px', borderRadius:'6px', border:'1px solid var(--cream-dark)'}}
                  />
                ) : (
                  <div style={{width:'140px', height:'140px', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--cream)', border:'1px dashed var(--cream-dark)', borderRadius:'6px', color:'var(--text-muted)', fontSize:'0.85rem', textAlign:'center', padding:'0 0.5rem'}}>
                    QR ещё не загружен
                  </div>
                )}
                <div style={{flex:'1 1 240px', display:'flex', flexDirection:'column', gap:'0.6rem'}}>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={e => setQrFile(e.target.files?.[0] || null)}
                  />
                  <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                    <button className="btn btn-primary btn-sm" onClick={uploadQr} disabled={!qrFile || qrUploading}>
                      {qrUploading ? 'Загрузка...' : 'Загрузить'}
                    </button>
                    {qrMsg && (
                      <span style={{color: qrMsg.startsWith('✓') ? '#155724' : '#721c24', fontWeight:600, fontSize:'0.9rem'}}>{qrMsg}</span>
                    )}
                  </div>
                  <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>PNG или JPEG, до 2 МБ.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo emails */}
      {tab === 'photos' && (
        <>
          <p style={{color:'var(--text-muted)', marginBottom:'1.5rem'}}>Участники, оставившие почту для доступа к фотоальбому.</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>#</th><th>ФИО</th><th>Почта</th></tr></thead>
              <tbody>
                {photoEmails.length === 0 && (
                  <tr><td colSpan="3" className="text-center" style={{color:'var(--text-muted)', padding:'2rem'}}>Почт пока нет</td></tr>
                )}
                {photoEmails.map((p,i) => (
                  <tr key={i}>
                    <td style={{color:'var(--text-muted)'}}>{i+1}</td>
                    <td style={{fontWeight:600}}>{p.name}</td>
                    <td><a href={`mailto:${p.email}`} style={{color:'var(--gold)'}}>{p.email}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {photoEmails.length > 0 && (
            <div style={{marginTop:'1rem', padding:'1rem 1.5rem', background:'var(--white)', border:'1px solid var(--border)', borderRadius:'8px', fontSize:'0.9rem'}}>
              Всего: <strong>{photoEmails.length}</strong> · <a href={`mailto:?bcc=${photoEmails.map(p=>p.email).join(',')}`} style={{color:'var(--gold)', fontWeight:700}}>Написать всем</a>
            </div>
          )}
        </>
      )}

      {/* Checklist editor */}
      {tab === 'checklist' && (
        <div>
          <p style={{color:'var(--text-muted)', marginBottom:'1.5rem'}}>
            Редактируйте ответственных и отмечайте выполненные пункты. Изменения сразу отражаются на странице Оргкомитет.
          </p>
          {checklist.map(item => (
            <div key={item.id} className="checklist-item">
              <div
                className={`checklist-status ${item.done ? 'done' : 'pending'}`}
                style={{cursor:'pointer', border: item.done ? 'none' : '2px solid var(--cream-dark)'}}
                onClick={() => toggleDone(item.id)}
                title="Нажмите чтобы отметить выполненным"
              >
                {item.done ? '✓' : ''}
              </div>
              <div className="checklist-content">
                <div className="checklist-title">{item.title}</div>
                <div style={{display:'flex', alignItems:'center', gap:'0.6rem', marginTop:'0.4rem'}}>
                  <span style={{fontSize:'0.85rem', color:'var(--text-muted)', whiteSpace:'nowrap'}}>Ответственный:</span>
                  <input
                    type="text"
                    value={item.responsible}
                    onChange={e => setResponsible(item.id, e.target.value)}
                    style={{
                      flex:1, border:'1.5px solid var(--cream-dark)', borderRadius:'6px',
                      padding:'0.4rem 0.8rem', fontFamily:'Raleway,sans-serif', fontSize:'0.95rem',
                      background:'var(--cream)', outline:'none', maxWidth:'300px'
                    }}
                    onFocus={e => e.target.style.borderColor='var(--gold)'}
                    onBlur={e => e.target.style.borderColor='var(--cream-dark)'}
                  />
                </div>
              </div>
              {item.done && (
                <div style={{padding:'0.3rem 0.9rem', background:'rgba(201,168,76,0.12)', color:'var(--gold)', borderRadius:'20px', fontSize:'0.78rem', fontWeight:700, whiteSpace:'nowrap', alignSelf:'flex-start'}}>
                  Готово
                </div>
              )}
            </div>
          ))}
          <div style={{marginTop:'1.2rem', display:'flex', alignItems:'center', gap:'1rem'}}>
            <button className="btn btn-primary" onClick={saveChecklist} disabled={checklistSaving}>
              {checklistSaving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
            {checklistMsg && <span style={{color: checklistMsg.startsWith('✓') ? '#155724' : '#721c24', fontWeight:600}}>{checklistMsg}</span>}
          </div>
        </div>
      )}

      {/* Info */}
      {tab === 'info' && (
        <div className="form-wrap">
          <p style={{color:'var(--text-muted)', marginBottom:'1.5rem'}}>Данные отображаются на сайте для всех посетителей.</p>
          {INFO_FIELDS.map(({ key, label, textarea }) => (
            <div className="form-group" key={key} style={{marginBottom:'1rem'}}>
              <label>{label}</label>
              <div style={{display:'flex', gap:'0.6rem'}}>
                {textarea
                  ? <textarea value={infoEdits[key]??''} onChange={e => setInfoEdits(p=>({...p,[key]:e.target.value}))} style={{flex:1}} />
                  : <input type="text" value={infoEdits[key]??''} onChange={e => setInfoEdits(p=>({...p,[key]:e.target.value}))} style={{flex:1}} />
                }
                <button className="btn btn-primary btn-sm" style={{whiteSpace:'nowrap', alignSelf:'flex-start'}}
                  onClick={() => saveInfo(key)} disabled={infoSaving===key}>
                  {infoSaving===key ? '...' : 'Сохранить'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Poll */}
      {tab === 'poll' && (
        <div className="form-wrap" style={{maxWidth:'500px'}}>
          <h3 style={{marginBottom:'1.2rem', color:'var(--navy)', fontFamily:'Playfair Display,serif'}}>Создать опрос по дате</h3>
          {pollMsg && <div className={`alert ${pollMsg.startsWith('✓') ? 'alert-success' : 'alert-error'}`}>{pollMsg}</div>}
          <div className="form-group" style={{marginBottom:'1rem'}}>
            <label>Заголовок опроса</label>
            <input type="text" placeholder="Когда вам удобно встретиться?" value={pollTitle} onChange={e=>setPollTitle(e.target.value)} />
          </div>
          <div className="form-group" style={{marginBottom:'1.5rem'}}>
            <label>Варианты дат (каждый с новой строки)</label>
            <textarea value={pollOptions} onChange={e=>setPollOptions(e.target.value)} style={{minHeight:'120px'}} />
          </div>
          <button className="btn btn-primary" onClick={async () => {
            const options = pollOptions.split('\n').map(s=>s.trim()).filter(Boolean)
            if (!pollTitle || options.length < 2) { setPollMsg('Введите заголовок и минимум 2 варианта'); return }
            try { await api.createPoll({title:pollTitle, options}); setPollMsg('✓ Опрос создан') }
            catch(e) { setPollMsg('Ошибка: '+e.message) }
          }}>Опубликовать опрос</button>
        </div>
      )}
    </div>
  )
}
