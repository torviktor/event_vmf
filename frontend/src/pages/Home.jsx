import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

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
        <div className="hero-anchor">⚓</div>
        <div className="hero-year">25</div>
        <div className="hero-content">
          <p className="hero-eyebrow">Встреча выпускников · {info.city || '…'}</p>
          <h1>Снова вместе</h1>
          <div className="hero-divider" />
          <p className="hero-subtitle">
            {info.welcome_text || 'Приглашаем вас и ваши семьи на встречу выпускников.'}
          </p>
          <Link to="/register">
            <button className="hero-cta">
              ✦ Подтвердить участие
            </button>
          </Link>
        </div>
      </div>

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
        <p className="section-sub">Предварительный план — уточняется</p>

        <div className="program-grid">
          <div className="program-card">
            <span className="program-card-icon">🏫</span>
            <div className="program-card-time">{info.institute_time || '10:00 – 13:00'}</div>
            <h3>Институт</h3>
            <p>Экскурсия по корпусам и плацу. Встреча с преподавателями и руководством кафедр. Дети приветствуются!</p>
          </div>
          <div className="program-card">
            <span className="program-card-icon">🚶</span>
            <div className="program-card-time">День</div>
            <h3>Прогулка</h3>
            <p>Свободное время: набережная, фонтаны, прогулка по городу. Для тех, кто хочет подышать воздухом после встречи.</p>
          </div>
          <div className="program-card">
            <span className="program-card-icon">🥂</span>
            <div className="program-card-time">{info.restaurant_time || '18:00 – 22:00'}</div>
            <h3>{info.restaurant_name || 'Ресторан'}</h3>
            <p>Торжественный ужин с ведущим, тостами и фотографиями. Уголок с играми для детей.</p>
          </div>
        </div>

        <div style={{marginTop: '2.5rem', padding: '1.5rem 2rem', background: 'var(--navy)', borderRadius: '10px', color: 'var(--white)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
            <div>
              <div style={{fontSize:'0.75rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.4rem'}}>Дата мероприятия</div>
              <div style={{fontFamily:'Playfair Display, serif', fontSize:'1.5rem'}}>{info.event_date || 'Голосуем за дату!'}</div>
            </div>
            <div>
              <div style={{fontSize:'0.75rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.4rem'}}>Бюджет на человека</div>
              <div style={{fontFamily:'Playfair Display, serif', fontSize:'1.5rem'}}>{info.budget_per_person || '10 000 – 15 000 ₽'}</div>
            </div>
            <div style={{display:'flex', gap:'0.8rem', flexWrap:'wrap'}}>
              <Link to="/register"><button className="btn btn-gold">Записаться</button></Link>
              <Link to="/vote"><button className="btn btn-outline" style={{color:'var(--gold)', borderColor:'var(--gold)'}}>Голосовать</button></Link>
            </div>
          </div>
        </div>

        <div style={{marginTop:'2.5rem'}}>
          <h2 className="section-title">Что взять с собой</h2>
          <p className="section-sub">Советы для комфортного дня</p>
          <div className="program-grid">
            <div className="program-card">
              <span className="program-card-icon">📄</span>
              <h3>Документы</h3>
              <p>Уточните заранее правила пропускного режима в институт — возможно, понадобится паспорт.</p>
            </div>
            <div className="program-card">
              <span className="program-card-icon">📸</span>
              <h3>Старые фото</h3>
              <p>Принесите фотографии со времён учёбы — сделаем общую ретро-галерею на вечере.</p>
            </div>
            <div className="program-card">
              <span className="program-card-icon">👶</span>
              <h3>Для детей</h3>
              <p>На вечернем мероприятии будет детский уголок. Возьмите любимую игрушку на случай усталости.</p>
            </div>
          </div>
        </div>

        {info.organizer_name && (
          <div style={{marginTop:'2rem', padding:'1.2rem 1.5rem', background:'var(--white)', borderRadius:'8px', border:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
            <div>
              <div style={{fontSize:'0.75rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'0.2rem'}}>Оргкомитет</div>
              <strong>{info.organizer_name}</strong>
              {info.organizer_phone && <span style={{marginLeft:'1rem', color:'var(--text-muted)'}}>{info.organizer_phone}</span>}
            </div>
            <Link to="/register"><button className="btn btn-primary btn-sm">Зарегистрироваться →</button></Link>
          </div>
        )}
      </div>
    </>
  )
}
