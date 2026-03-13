import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

function Countdown() {
  const target = new Date('2026-06-27T10:00:00')
  const [diff, setDiff] = useState(target - new Date())

  useEffect(() => {
    const t = setInterval(() => setDiff(target - new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const total = Math.max(0, diff)
  const days    = Math.floor(total / 86400000)
  const hours   = Math.floor((total % 86400000) / 3600000)
  const minutes = Math.floor((total % 3600000) / 60000)
  const seconds = Math.floor((total % 60000) / 1000)

  return (
    <div style={{
      background: 'var(--navy)',
      borderBottom: '3px solid var(--gold)',
      padding: '2.5rem 2rem',
      textAlign: 'center',
    }}>
      <div style={{fontSize:'0.78rem', letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'1.2rem', fontWeight:600}}>
        До встречи осталось
      </div>
      <div style={{display:'flex', justifyContent:'center', gap:'0', flexWrap:'wrap'}}>
        {[
          [days,    'дней'],
          [hours,   'часов'],
          [minutes, 'минут'],
          [seconds, 'секунд'],
        ].map(([val, label], i, arr) => (
          <div key={label} style={{display:'flex', alignItems:'stretch'}}>
            <div style={{padding:'0 2rem', textAlign:'center', minWidth:'100px'}}>
              <div style={{
                fontFamily:'Playfair Display, serif',
                fontSize:'clamp(3rem, 8vw, 5rem)',
                fontWeight:700,
                color:'var(--white)',
                lineHeight:1,
                minWidth:'2ch',
                display:'inline-block',
              }}>
                {String(val).padStart(2,'0')}
              </div>
              <div style={{fontSize:'0.75rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', marginTop:'0.5rem', fontWeight:600}}>
                {label}
              </div>
            </div>
            {i < arr.length - 1 && (
              <div style={{color:'var(--gold)', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:300, alignSelf:'center', opacity:0.5, marginTop:'-0.5rem'}}>:</div>
            )}
          </div>
        ))}
      </div>
      <div style={{marginTop:'1.2rem', fontSize:'0.88rem', color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em'}}>
        27 июня 2026 · Санкт-Петербург · ВМИРЭ им. А.С. Попова
      </div>
    </div>
  )
}


export default function Home() {
  const [stats, setStats] = useState(null)
  const [info, setInfo] = useState({})

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {})
    api.getInfo().then(setInfo).catch(() => {})
  }, [])

  return (
    <>
      <div className="hero">
        <div className="hero-anniversary">
          <span className="hero-anniversary-number">15</span>
          <span className="hero-anniversary-text">лет со дня выпуска</span>
        </div>
        <div className="hero-anchor">⚓</div>
        <div className="hero-content">
          <p className="hero-eyebrow">Встреча выпускников · Санкт-Петербург</p>
          <h1>Снова вместе</h1>
          <div className="hero-divider" />
          <p className="hero-subtitle">
            Уважаемые выпускники, сослуживцы! Приглашаем вас на встречу выпускников ВМИРЭ им. А.С. Попова 2011 года.
          </p>
          <Link to="/register">
            <button className="hero-cta">Подтвердить участие</button>
          </Link>
        </div>
      </div>

      <Countdown />

      {stats && (
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-number">{stats.total_guests}</span>
            <span className="stat-label">Участников</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.total_adults}</span>
            <span className="stat-label">Взрослых</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.total_children}</span>
            <span className="stat-label">Детей</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.restaurant}</span>
            <span className="stat-label">В ресторан</span>
          </div>
        </div>
      )}

      <div className="section">
        <h2 className="section-title">Программа дня</h2>
        <p className="section-sub">27 июня 2026 года, Санкт-Петербург</p>

        <div className="program-grid">
          <div className="program-card">
            <span className="program-card-icon">▪</span>
            <div className="program-card-time">{info.institute_time || '10:00 – 13:00'}</div>
            <h3>Институт</h3>
            <p>Экскурсия по корпусам, плацу и музею. Встреча с преподавателями и руководством кафедр. Семьи и дети приветствуются.</p>
          </div>
          <div className="program-card">
            <span className="program-card-icon">▪</span>
            <div className="program-card-time">День</div>
            <h3>Прогулка</h3>
            <p>Свободное время: набережная Невы, фонтаны, прогулка по городу. Для тех, кто хочет продолжить общение перед вечером.</p>
          </div>
          <div className="program-card">
            <span className="program-card-icon">▪</span>
            <div className="program-card-time">{info.restaurant_time || '18:00 – 22:00'}</div>
            <h3>{info.restaurant_name || 'Торжественный ужин'}</h3>
            <p>Ужин с ведущим, тостами и общей фотографией. Для семей с детьми предусмотрен детский уголок в ресторане.</p>
          </div>
        </div>

        <div style={{marginTop:'2.5rem', padding:'1.8rem 2.2rem', background:'var(--navy)', borderRadius:'10px', color:'var(--white)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1.2rem'}}>
            <div>
              <div style={{fontSize:'0.78rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.4rem'}}>Дата мероприятия</div>
              <div style={{fontFamily:'Playfair Display, serif', fontSize:'1.6rem'}}>27 июня 2026 года</div>
            </div>
            <div>
              <div style={{fontSize:'0.78rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.4rem'}}>Бюджет на человека</div>
              <div style={{fontFamily:'Playfair Display, serif', fontSize:'1.6rem'}}>{info.budget_per_person || '10 000 – 15 000 ₽'}</div>
            </div>
            <div style={{display:'flex', gap:'0.8rem', flexWrap:'wrap'}}>
              <Link to="/register"><button className="btn btn-gold">Записаться</button></Link>
              <Link to="/guests"><button className="btn btn-outline" style={{color:'var(--gold)', borderColor:'var(--gold)'}}>Список участников</button></Link>
            </div>
          </div>
        </div>

        <div style={{marginTop:'2.5rem'}}>
          <h2 className="section-title">Полезная информация</h2>
          <div className="program-grid">
            <div className="program-card">
              <span className="program-card-icon">▪</span>
              <h3>Пропуск в институт</h3>
              <p>Проход организован заранее. Паспорт обязателен — без него пропуск не выдаётся. Оргкомитет заблаговременно согласует список участников с руководством.</p>
            </div>
            <div className="program-card">
              <span className="program-card-icon">▪</span>
              <h3>Фотоальбом встречи</h3>
              <p>Общий архив фотографий со встречи — на Яндекс.Диске. Для получения доступа оставьте свою почту при регистрации или запросите доступ по кнопке ниже.</p>
              <div style={{marginTop:'1rem', display:'flex', gap:'0.7rem', flexWrap:'wrap'}}>
                <a href="https://disk.yandex.ru/d/RZxLk3bCQzz62g" target="_blank" rel="noopener noreferrer">
                  <button className="btn btn-primary btn-sm">Открыть альбом</button>
                </a>
                <Link to="/register">
                  <button className="btn btn-outline btn-sm">Запросить доступ</button>
                </Link>
              </div>
            </div>
            <div className="program-card">
              <span className="program-card-icon">▪</span>
              <h3>Семьи с детьми</h3>
              <p>Ресторан выбирается с учётом наличия детского уголка. Просим при регистрации указать количество и возраст детей — это важно для планирования.</p>
            </div>
          </div>
        </div>

        {info.organizer_name && (
          <div style={{marginTop:'2rem', padding:'1.3rem 1.8rem', background:'var(--white)', borderRadius:'8px', border:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
            <div>
              <div style={{fontSize:'0.78rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'0.2rem'}}>Оргкомитет</div>
              <strong style={{fontSize:'1.05rem'}}>{info.organizer_name}</strong>
              {info.organizer_phone && <span style={{marginLeft:'1.2rem', color:'var(--text-muted)'}}>{info.organizer_phone}</span>}
            </div>
            <div style={{display:'flex', gap:'0.8rem'}}>
              <Link to="/register"><button className="btn btn-primary btn-sm">Зарегистрироваться</button></Link>
              <Link to="/checklist"><button className="btn btn-outline btn-sm">Оргкомитет</button></Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
