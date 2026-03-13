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
      if (i.checklist) {
        try { setChecklist(JSON.parse(i.checklist)) } catch {}
      }
    } catch {}
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
