import { useEffect, useState } from 'react'
import { api } from '../api'

const TIMELINE = [
  { time: '10:00', icon: '🚌', title: 'Сбор у института', desc: 'Встречаемся у главного входа' },
  { time: '10:15', icon: '🏛️', title: 'Экскурсия', desc: 'Обход аудиторий, плаца, музея. Семьи и дети приветствуются' },
  { time: '11:30', icon: '👨‍🏫', title: 'Встреча с преподавателями', desc: 'Неформальное общение с руководством кафедр' },
  { time: '13:00', icon: '🏁', title: 'Свободное время', desc: 'Прогулка, обед, отдых. Семьи могут уйти раньше' },
  { time: '17:30', icon: '🚕', title: 'Выдвигаемся в ресторан', desc: 'Сбор группы для переезда' },
  { time: '18:00', icon: '🥂', title: 'Торжественный ужин', desc: 'Ведущий, тосты, фото. Детский уголок с аниматором' },
  { time: '22:00', icon: '🌙', title: 'Завершение', desc: 'До следующей встречи!' },
]

export default function Program() {
  const [info, setInfo] = useState({})

  useEffect(() => {
    api.getInfo().then(setInfo).catch(() => {})
  }, [])

  return (
    <div className="section">
      <h2 className="section-title">Программа встречи</h2>
      <p className="section-sub">
        Дата: <strong>{info.event_date || 'уточняется'}</strong> · {info.city || ''}
      </p>

      {/* Timeline */}
      <div style={{position:'relative', marginTop:'2rem'}}>
        <div style={{
          position:'absolute', left:'28px', top:'8px', bottom:'8px',
          width:'2px', background:'linear-gradient(to bottom, var(--gold), var(--cream-dark))'
        }} />
        {TIMELINE.map((item, i) => (
          <div key={i} style={{display:'flex', gap:'1.5rem', marginBottom:'2rem', position:'relative'}}>
            <div style={{
              width:'58px', height:'58px', flexShrink:0,
              background:'var(--navy)', borderRadius:'50%',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'1.4rem', boxShadow:'0 0 0 4px var(--cream)',
              position:'relative', zIndex:1
            }}>
              {item.icon}
            </div>
            <div style={{paddingTop:'0.5rem'}}>
              <div style={{fontSize:'0.75rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--gold)', fontWeight:600, marginBottom:'0.2rem'}}>
                {item.time}
              </div>
              <h3 style={{color:'var(--navy)', marginBottom:'0.3rem', fontSize:'1.1rem', fontFamily:'Playfair Display,serif'}}>{item.title}</h3>
              <p style={{color:'var(--text-muted)', fontSize:'0.92rem'}}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info blocks */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px,1fr))', gap:'1rem', marginTop:'1rem'}}>
        <div className="program-card">
          <span className="program-card-icon">🎁</span>
          <h3>Подарки</h3>
          <p>Планируем коллективный подарок преподавателям. Для выпускников — памятные сувениры с эмблемой института. Для детей — игрушки-кораблики.</p>
        </div>
        <div className="program-card">
          <span className="program-card-icon">📋</span>
          <h3>Пропуска</h3>
          <p>Для посещения института необходим паспорт. Оргкомитет заранее согласует списки с руководством.</p>
        </div>
        <div className="program-card">
          <span className="program-card-icon">🌧️</span>
          <h3>План Б</h3>
          <p>На случай плохой погоды прогулочная часть переносится. Ресторан в любом случае состоится.</p>
        </div>
      </div>

      <div style={{marginTop:'2rem', background:'var(--navy)', color:'var(--white)', padding:'1.5rem 2rem', borderRadius:'10px'}}>
        <div style={{display:'flex', gap:'3rem', flexWrap:'wrap'}}>
          <div>
            <div style={{fontSize:'0.72rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.3rem'}}>Ресторан</div>
            <div style={{fontFamily:'Playfair Display,serif', fontSize:'1.2rem'}}>{info.restaurant_name || 'Уточняется'}</div>
          </div>
          <div>
            <div style={{fontSize:'0.72rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.3rem'}}>Бюджет</div>
            <div style={{fontFamily:'Playfair Display,serif', fontSize:'1.2rem'}}>{info.budget_per_person || '10 000 – 15 000 ₽'} / чел.</div>
          </div>
          <div>
            <div style={{fontSize:'0.72rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.3rem'}}>Вопросы</div>
            <div style={{fontFamily:'Playfair Display,serif', fontSize:'1.2rem'}}>{info.organizer_phone || info.organizer_name || 'Оргкомитет'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
