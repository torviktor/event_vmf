import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

const TIMELINE = [
  { time: '10:00', title: 'Сбор у института', desc: 'Встречаемся у главного входа. Паспорт обязателен — проход согласован заранее.' },
  { time: '10:15', title: 'Экскурсия по институту', desc: 'Посещение аудиторий, плаца, музея. Семьи приглашаются.' },
  { time: '11:30', title: 'Встреча с преподавателями', desc: 'Неформальное общение с руководством кафедр.' },
  { time: '13:00', title: 'Свободное время', desc: 'Прогулка по городу, набережная, обед. Семьи могут отправиться домой.' },
  { time: '17:30', title: 'Выдвижение в ресторан', desc: 'Общий сбор перед торжественным ужином.' },
  { time: '18:00', title: 'Торжественный ужин', desc: 'Ведущий, тосты, общая фотография. Детский уголок в ресторане.' },
  { time: '22:00', title: 'Завершение', desc: 'До следующей встречи.' },
]

export default function Program() {
  const [info, setInfo] = useState({})
  useEffect(() => { api.getInfo().then(setInfo).catch(() => {}) }, [])

  return (
    <div className="section">
      <h2 className="section-title">Программа встречи</h2>
      <p className="section-sub">27 июня 2026 года · Санкт-Петербург · ВМИРЭ им. А.С. Попова, выпуск 2011</p>

      <div style={{position:'relative', marginTop:'2.5rem'}}>
        <div style={{position:'absolute', left:'28px', top:'8px', bottom:'8px', width:'2px', background:'linear-gradient(to bottom, var(--gold), var(--cream-dark))'}} />
        {TIMELINE.map((item, i) => (
          <div key={i} style={{display:'flex', gap:'1.8rem', marginBottom:'2.2rem', position:'relative'}}>
            <div style={{width:'58px', height:'58px', flexShrink:0, background:'var(--navy)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 0 4px var(--cream)', position:'relative', zIndex:1}}>
              <span style={{fontFamily:'Playfair Display,serif', fontWeight:700, color:'var(--gold)', fontSize:'0.75rem', letterSpacing:'0.05em'}}>{item.time.split(':')[0]}<sup style={{fontSize:'0.55rem'}}>00</sup></span>
            </div>
            <div style={{paddingTop:'0.6rem'}}>
              <h3 style={{color:'var(--navy)', marginBottom:'0.35rem', fontSize:'1.2rem', fontFamily:'Playfair Display,serif'}}>{item.title}</h3>
              <p style={{color:'var(--text-muted)', fontSize:'0.97rem'}}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px,1fr))', gap:'1.2rem', marginTop:'1rem'}}>
        <div className="program-card">
          <span className="program-card-icon">▪</span>
          <h3>Памятные подарки</h3>
          <p>Планируется коллективный подарок преподавателям. Для выпускников и семей — памятные сувениры с символикой института.</p>
        </div>
        <div className="program-card">
          <span className="program-card-icon">▪</span>
          <h3>Пропускной режим</h3>
          <p>Проход в институт организован. Паспорт обязателен. Список участников согласовывается заблаговременно.</p>
        </div>
        <div className="program-card">
          <span className="program-card-icon">▪</span>
          <h3>Резервный план</h3>
          <p>В случае неблагоприятной погоды прогулочная часть переносится. Программа в институте и ужин проводятся в любом случае.</p>
        </div>
      </div>

      <div style={{marginTop:'2rem', background:'var(--navy)', color:'var(--white)', padding:'1.8rem 2.2rem', borderRadius:'10px'}}>
        <div style={{display:'flex', gap:'3rem', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:'0.75rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.3rem'}}>Ресторан</div>
            <div style={{fontFamily:'Playfair Display,serif', fontSize:'1.3rem'}}>{info.restaurant_name || 'Уточняется'}</div>
          </div>
          <div>
            <div style={{fontSize:'0.75rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.3rem'}}>Бюджет</div>
            <div style={{fontFamily:'Playfair Display,serif', fontSize:'1.3rem'}}>{info.budget_per_person || '10 000 – 15 000 ₽'} / чел.</div>
          </div>
          <div>
            <div style={{fontSize:'0.75rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.3rem'}}>Вопросы</div>
            <div style={{fontFamily:'Playfair Display,serif', fontSize:'1.3rem'}}>{info.organizer_phone || info.organizer_name || 'Оргкомитет'}</div>
          </div>
          <Link to="/register"><button className="btn btn-gold">Зарегистрироваться</button></Link>
        </div>
      </div>
    </div>
  )
}
