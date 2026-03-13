import { useState, useEffect } from 'react'
import { api } from '../api'

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [tab, setTab] = useState('guests')

  const [guests, setGuests] = useState([])
  const [stats, setStats] = useState(null)
  const [guestsLoading, setGuestsLoading] = useState(false)

  const [info, setInfo] = useState({})
  const [infoEdits, setInfoEdits] = useState({})
  const [infoSaving, setInfoSaving] = useState('')

  const [pollTitle, setPollTitle] = useState('')
  const [pollOptions, setPollOptions] = useState('14 июня (суббота)\n21 июня (суббота)\n28 июня (суббота)')
  const [pollMsg, setPollMsg] = useState('')

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
    try { const i = await api.getInfo(); setInfo(i); setInfoEdits(i) } catch {}
  }

  useEffect(() => { if (token) { loadGuests(); loadInfo() } }, [token])

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

  async function createPoll() {
    const options = pollOptions.split('\n').map(s => s.trim()).filter(Boolean)
    if (!pollTitle || options.length < 2) { setPollMsg('Введите заголовок и минимум 2 варианта'); return }
    try { await api.createPoll({ title: pollTitle, options }); setPollMsg('✓ Опрос создан') }
    catch (e) { setPollMsg('Ошибка: ' + e.message) }
  }

  // Извлечь почты из поля message
  const photoEmails = guests
    .map(g => {
      const match = g.message && g.message.match(/Почта для фото: ([^\s|]+)/)
      return match ? { name: g.name, email: match[1] } : null
    })
    .filter(Boolean)

  const INFO_FIELDS = [
    { key: 'event_date', label: 'Дата мероприятия' },
    { key: 'city', label: 'Город' },
    { key: 'institute_time', label: 'Время в институте' },
    { key: 'restaurant_time', label: 'Время в ресторане' },
    { key: 'restaurant_name', label: 'Название ресторана' },
    { key: 'budget_per_person', label: 'Бюджет на человека' },
    { key: 'organizer_name', label: 'Имя организатора' },
    { key: 'organizer_phone', label: 'Телефон организатора' },
    { key: 'welcome_text', label: 'Приветственный текст', textarea: true },
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
          {[['Участников', stats.total_guests], ['Взрослых', stats.total_adults], ['Детей', stats.total_children], ['На экскурсию', stats.institute], ['В ресторан', stats.restaurant]].map(([label, val]) => (
            <div key={label} style={{background:'var(--navy)', color:'var(--white)', padding:'0.9rem 1.5rem', borderRadius:'8px', textAlign:'center'}}>
              <div style={{fontFamily:'Playfair Display,serif', fontSize:'1.7rem', color:'var(--gold)', lineHeight:1}}>{val}</div>
              <div style={{fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'0.2rem', opacity:0.6}}>{label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{display:'flex', gap:'0.5rem', marginBottom:'1.5rem', borderBottom:'2px solid var(--border)'}}>
        {[['guests','Участники'], ['photos','Доступ к фото'], ['info','Настройки'], ['poll','Голосование']].map(([t, label]) => (
          <button key={t} className="btn btn-sm"
            style={{background: tab === t ? 'var(--navy)' : 'transparent', color: tab === t ? 'var(--white)' : 'var(--text-muted)', border:'none', borderRadius:'6px 6px 0 0', paddingBottom:'0.75rem'}}
            onClick={() => setTab(t)}>{label}</button>
        ))}
      </div>

      {/* Guests tab */}
      {tab === 'guests' && (
        <>
          <div style={{marginBottom:'1rem', display:'flex', justifyContent:'flex-end'}}>
            <button className="btn btn-gold btn-sm" onClick={loadGuests}>Обновить</button>
          </div>
          {guestsLoading ? <div className="spinner" /> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>ФИО</th><th>Телефон</th><th>Кафедра</th><th>Состав</th><th>Программа</th><th>Статус</th><th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.length === 0 && (
                    <tr><td colSpan="8" className="text-center" style={{color:'var(--text-muted)', padding:'2rem'}}>Заявок пока нет</td></tr>
                  )}
                  {guests.map((g, i) => (
                    <tr key={g.id}>
                      <td style={{color:'var(--text-muted)', fontSize:'0.85rem'}}>{i + 1}</td>
                      <td>
                        <strong style={{fontSize:'1rem'}}>{g.name}</strong>
                        {g.message && <div style={{fontSize:'0.82rem', color:'var(--text-muted)', marginTop:'0.2rem', fontStyle:'italic'}}>"{g.message}"</div>}
                      </td>
                      <td style={{fontSize:'0.95rem'}}>{g.phone}</td>
                      <td style={{fontSize:'0.9rem', color:'var(--text-muted)'}}>{g.specialty || '—'}</td>
                      <td style={{fontSize:'0.9rem'}}>
                        {g.adults_count} взр.
                        {g.children.length > 0 && g.children.map((c, ci) => (
                          <div key={ci} style={{color:'var(--text-muted)', fontSize:'0.82rem'}}>{c.name || `Ребёнок ${ci+1}`}, {c.age} л.</div>
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
                          <button className="btn btn-sm btn-gold" onClick={() => toggleConfirm(g.id)}>
                            {g.is_confirmed ? 'Снять' : 'Подтв.'}
                          </button>
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

      {/* Photo emails tab */}
      {tab === 'photos' && (
        <>
          <p style={{color:'var(--text-muted)', marginBottom:'1.5rem', fontSize:'0.97rem'}}>
            Участники, оставившие почту для доступа к фотоальбому на Яндекс.Диске.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>ФИО</th><th>Почта</th></tr>
              </thead>
              <tbody>
                {photoEmails.length === 0 && (
                  <tr><td colSpan="3" className="text-center" style={{color:'var(--text-muted)', padding:'2rem'}}>Почт пока нет</td></tr>
                )}
                {photoEmails.map((p, i) => (
                  <tr key={i}>
                    <td style={{color:'var(--text-muted)'}}>{i + 1}</td>
                    <td style={{fontWeight:600}}>{p.name}</td>
                    <td><a href={`mailto:${p.email}`} style={{color:'var(--gold)'}}>{p.email}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {photoEmails.length > 0 && (
            <div style={{marginTop:'1rem', padding:'1rem 1.5rem', background:'var(--white)', border:'1px solid var(--border)', borderRadius:'8px', fontSize:'0.9rem', color:'var(--text-muted)'}}>
              Всего почт: <strong style={{color:'var(--navy)'}}>{photoEmails.length}</strong>
              {' · '}
              <a href={`mailto:?bcc=${photoEmails.map(p=>p.email).join(',')}`} style={{color:'var(--gold)', fontWeight:700}}>
                Написать всем
              </a>
            </div>
          )}
        </>
      )}

      {/* Info tab */}
      {tab === 'info' && (
        <div className="form-wrap">
          <p style={{color:'var(--text-muted)', fontSize:'0.97rem', marginBottom:'1.5rem'}}>Эти данные отображаются на сайте для всех посетителей.</p>
          {INFO_FIELDS.map(({ key, label, textarea }) => (
            <div className="form-group" key={key} style={{marginBottom:'1rem'}}>
              <label>{label}</label>
              <div style={{display:'flex', gap:'0.6rem'}}>
                {textarea
                  ? <textarea value={infoEdits[key] ?? ''} onChange={e => setInfoEdits(p => ({...p, [key]: e.target.value}))} style={{flex:1}} />
                  : <input type="text" value={infoEdits[key] ?? ''} onChange={e => setInfoEdits(p => ({...p, [key]: e.target.value}))} style={{flex:1}} />
                }
                <button className="btn btn-primary btn-sm" style={{whiteSpace:'nowrap', alignSelf:'flex-start'}}
                  onClick={() => saveInfo(key)} disabled={infoSaving === key}>
                  {infoSaving === key ? '...' : 'Сохранить'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Poll tab */}
      {tab === 'poll' && (
        <div className="form-wrap" style={{maxWidth:'500px'}}>
          <h3 style={{marginBottom:'1.2rem', color:'var(--navy)', fontFamily:'Playfair Display,serif'}}>Создать опрос по дате</h3>
          {pollMsg && <div className={`alert ${pollMsg.startsWith('✓') ? 'alert-success' : 'alert-error'}`}>{pollMsg}</div>}
          <div className="form-group" style={{marginBottom:'1rem'}}>
            <label>Заголовок опроса</label>
            <input type="text" placeholder="Когда вам удобно встретиться?" value={pollTitle} onChange={e => setPollTitle(e.target.value)} />
          </div>
          <div className="form-group" style={{marginBottom:'1.5rem'}}>
            <label>Варианты дат (каждый с новой строки)</label>
            <textarea value={pollOptions} onChange={e => setPollOptions(e.target.value)} style={{minHeight:'120px'}} />
          </div>
          <button className="btn btn-primary" onClick={createPoll}>Опубликовать опрос</button>
        </div>
      )}
    </div>
  )
}
