import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

// Поминутного расписания нет: время в институте плавающее, привязано к выпуску курсантов.
// Поэтому пункты сформулированы ориентировочно, без фиктивных таймштампов.
const SATURDAY = [
  {
    time: '~12:00',
    title: 'Институт (ВВМИУ)',
    desc: 'Сбор после выпуска курсантов — точное время зависит от выпуска (минимум до 12:00). Свободное перемещение по территории: плац, казарма, возложение цветов к мемориалу, музей. Встреча с преподавателями — по возможности, если получится по графику выпуска.',
  },
  {
    time: '14:00 – 15:00',
    title: 'Выход из института, переезд в Петергоф',
    desc: 'Ориентировочное окно завершения институтской части и сбора у Алекс Хауса.',
  },
  {
    time: 'с 15:00',
    title: 'Банкет в «Алекс Хаус» (Петергоф)',
    desc: 'Обед, общение, тосты, общая фотография. Ориентировочно до 22:00, уйти можно раньше.',
  },
]

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
      <p className="section-sub">27 июня 2026 · Санкт-Петербург — Петергоф · ВМИРЭ им. А.С. Попова, выпуск 2011</p>

      <div style={{position:'relative', marginTop:'1.5rem'}}>
        <div style={{position:'absolute', left:'28px', top:'8px', bottom:'8px', width:'2px', background:'linear-gradient(to bottom, var(--gold), var(--cream-dark))'}} />
        {SATURDAY.map((item, i) => (
          <div key={i} style={{display:'flex', gap:'1.8rem', marginBottom:'2.2rem', position:'relative'}}>
            <div style={{minWidth:'58px', height:'58px', flexShrink:0, background:'var(--navy)', borderRadius:'29px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 0 4px var(--cream)', position:'relative', zIndex:1, padding:'0 0.7rem'}}>
              <span style={{fontFamily:'Playfair Display,serif', fontWeight:700, color:'var(--gold)', fontSize:'0.78rem', letterSpacing:'0.03em', whiteSpace:'nowrap'}}>
                {item.time}
              </span>
            </div>
            <div style={{paddingTop:'0.6rem'}}>
              <h3 style={{color:'var(--navy)', marginBottom:'0.35rem', fontSize:'1.2rem', fontFamily:'Playfair Display,serif'}}>{item.title}</h3>
              <p style={{color:'var(--text-muted)', fontSize:'0.97rem'}}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{background:'rgba(201,168,76,0.08)', border:'1px solid var(--cream-dark)', borderRadius:'8px', padding:'1rem 1.3rem', marginTop:'0.5rem', fontSize:'0.92rem', color:'var(--text-muted)'}}>
        <strong style={{color:'var(--navy)'}}>Точного поминутного расписания нет.</strong> Институтская часть привязана к выпуску курсантов — времена ориентировочные, могут сдвинуться. Банкет в Алекс Хаус начинается по факту сбора, ориентировочно с 15:00.
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
          <p>Программа в институте и банкет проводятся в любом случае. Времена могут сдвинуться по факту выпуска курсантов.</p>
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
            <div style={{fontFamily:'Playfair Display,serif', fontSize:'1.3rem'}}>от 4 500 ₽ / чел.</div>
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
