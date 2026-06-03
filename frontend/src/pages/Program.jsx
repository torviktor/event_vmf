import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

const SATURDAY = [
  { time: '10:00', title: 'Сбор у института (ВВМИУ)',
    desc: 'Главный вход. Паспорт обязателен — проход согласован заранее, списки переданы.' },
  { time: '10:30', title: 'Выпуск курсантов, проход по списку',
    desc: 'Торжественное построение, наблюдаем выпуск нового поколения.' },
  { time: '11:30', title: 'Экскурсия по институту',
    desc: 'Аудитории, плац, музей. Семьи приглашаются.' },
  { time: '12:30', title: 'Встреча с преподавателями',
    desc: 'Неформальное общение с руководством кафедр.' },
  { time: '14:00', title: 'Сбор в ресторане «Алекс Хаус» (Петергоф)',
    desc: 'Обед, общение, первые тосты. Банкет открыт с 14:00.' },
  { time: '17:00', title: 'Пауза',
    desc: 'Семьи с малышами могут увезти детей на сон, остальные отдыхают; зал работает.' },
  { time: '18:30', title: 'Основная вечерняя часть банкета',
    desc: 'Тосты, общая фотография, музыка, общение.' },
  { time: '22:00', title: 'Завершение',
    desc: 'До следующей встречи.' },
]

const SUNDAY = {
  date: '28 июня (воскресенье)',
  title: 'Неформальная часть',
  desc: 'Фонтаны Нижнего парка Петергофа, прогулка по парку, возвращение в Петербург на «Метеоре». Дальше — разъезд.',
}

const BUDGET_LINES = [
  { label: 'Еда (банкетное меню)', value: '4 500 ₽ со взрослого' },
  { label: 'Алкоголь — по желанию', value: 'лёгкое +1 500 ₽ · крепкое +2 500 ₽' },
  { label: 'Подарочный фонд', value: '2 500 ₽ с офицера-выпускника' },
  { label: 'Дети', value: 'детское меню, оплачивает семья отдельно' },
  { label: 'Сбор', value: 'СБП (реквизиты в чате), основной взнос до 15 июня' },
]

export default function Program() {
  const [info, setInfo] = useState({})
  useEffect(() => { api.getInfo().then(setInfo).catch(() => {}) }, [])

  return (
    <div className="section">
      <h2 className="section-title">Программа встречи</h2>
      <p className="section-sub">27–28 июня 2026 · Санкт-Петербург — Петергоф · ВМИРЭ им. А.С. Попова, выпуск 2011</p>

      <h3 style={{fontFamily:'Playfair Display,serif', color:'var(--navy)', marginTop:'2rem', marginBottom:'0.5rem'}}>
        27 июня (суббота)
      </h3>

      <div style={{position:'relative', marginTop:'1rem'}}>
        <div style={{position:'absolute', left:'28px', top:'8px', bottom:'8px', width:'2px', background:'linear-gradient(to bottom, var(--gold), var(--cream-dark))'}} />
        {SATURDAY.map((item, i) => (
          <div key={i} style={{display:'flex', gap:'1.8rem', marginBottom:'2.2rem', position:'relative'}}>
            <div style={{width:'58px', height:'58px', flexShrink:0, background:'var(--navy)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 0 4px var(--cream)', position:'relative', zIndex:1}}>
              <span style={{fontFamily:'Playfair Display,serif', fontWeight:700, color:'var(--gold)', fontSize:'0.75rem', letterSpacing:'0.05em'}}>
                {item.time.split(':')[0]}<sup style={{fontSize:'0.55rem'}}>{item.time.split(':')[1]}</sup>
              </span>
            </div>
            <div style={{paddingTop:'0.6rem'}}>
              <h3 style={{color:'var(--navy)', marginBottom:'0.35rem', fontSize:'1.2rem', fontFamily:'Playfair Display,serif'}}>{item.title}</h3>
              <p style={{color:'var(--text-muted)', fontSize:'0.97rem'}}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{fontFamily:'Playfair Display,serif', color:'var(--navy)', marginTop:'2.5rem', marginBottom:'0.5rem'}}>
        {SUNDAY.date}
      </h3>
      <div style={{background:'var(--white)', border:'1px solid var(--border)', borderRadius:'10px', padding:'1.5rem 1.8rem', boxShadow:'var(--shadow)', marginTop:'0.6rem'}}>
        <div style={{fontFamily:'Playfair Display,serif', color:'var(--navy)', fontSize:'1.15rem', marginBottom:'0.4rem'}}>{SUNDAY.title}</div>
        <p style={{color:'var(--text-muted)', fontSize:'0.97rem', margin:0}}>{SUNDAY.desc}</p>
      </div>

      <h3 style={{fontFamily:'Playfair Display,serif', color:'var(--navy)', marginTop:'2.5rem', marginBottom:'0.5rem'}}>
        Бюджет
      </h3>
      <div style={{background:'var(--white)', border:'1px solid var(--border)', borderRadius:'10px', padding:'1.5rem 1.8rem', boxShadow:'var(--shadow)', marginTop:'0.6rem'}}>
        <div style={{display:'grid', gridTemplateColumns:'minmax(160px, auto) 1fr', columnGap:'1.5rem', rowGap:'0.7rem'}}>
          {BUDGET_LINES.map(line => (
            <div key={line.label} style={{display:'contents'}}>
              <div style={{color:'var(--text-muted)', fontSize:'0.95rem'}}>{line.label}</div>
              <div style={{color:'var(--navy)', fontWeight:600, fontSize:'0.97rem'}}>{line.value}</div>
            </div>
          ))}
        </div>
        <div style={{marginTop:'1rem', fontSize:'0.85rem', color:'var(--text-muted)', fontStyle:'italic'}}>
          Суммы ориентировочные. Учёт оплат по фамилиям — на странице «Участники».
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px,1fr))', gap:'1.2rem', marginTop:'2rem'}}>
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
          <p>В случае неблагоприятной погоды воскресная прогулочная часть переносится. Программа в институте и банкет проводятся в любом случае.</p>
        </div>
      </div>

      <div style={{marginTop:'2rem', background:'var(--navy)', color:'var(--white)', padding:'1.8rem 2.2rem', borderRadius:'10px'}}>
        <div style={{display:'flex', gap:'3rem', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:'0.75rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.3rem'}}>Ресторан</div>
            <div style={{fontFamily:'Playfair Display,serif', fontSize:'1.3rem'}}>Алекс Хаус, Петергоф</div>
          </div>
          <div>
            <div style={{fontSize:'0.75rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.3rem'}}>Основной взнос</div>
            <div style={{fontFamily:'Playfair Display,serif', fontSize:'1.3rem'}}>от 7 000 ₽ / чел.</div>
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
