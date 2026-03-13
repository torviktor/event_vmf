import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

const DEFAULT_CHECKLIST = [
  { id: 1, title: 'Сайт-приглашение',            responsible: 'Веревкин Виктор', done: true  },
  { id: 2, title: 'Проход в институт',            responsible: 'Определяется',    done: false },
  { id: 3, title: 'Сувениры для преподавателей',  responsible: 'Определяется',    done: false },
  { id: 4, title: 'Подарки детям',                responsible: 'Определяется',    done: false },
  { id: 5, title: 'Ресторан',                     responsible: 'Определяется',    done: false },
  { id: 6, title: 'Сбор контактов и RSVP',        responsible: 'Определяется',    done: false },
  { id: 7, title: 'Бюджет и взносы',              responsible: 'Определяется',    done: false },
  { id: 8, title: 'Фотограф / видео',             responsible: 'Определяется',    done: false },
]

export default function Checklist() {
  const [items, setItems] = useState(DEFAULT_CHECKLIST)

  useEffect(() => {
    api.getInfo().then(info => {
      if (info.checklist) {
        try { setItems(JSON.parse(info.checklist)) } catch {}
      }
    }).catch(() => {})
  }, [])

  const done = items.filter(i => i.done).length

  return (
    <div className="section">
      <h2 className="section-title">Оргкомитет</h2>
      <p className="section-sub">
        Встреча выпускников ВМИРЭ им. А.С. Попова · Выпуск 2011 · 27 июня 2026
      </p>

      <div style={{display:'flex', gap:'1.5rem', marginBottom:'2rem', flexWrap:'wrap'}}>
        <div style={{background:'var(--navy)', color:'var(--white)', padding:'1rem 2rem', borderRadius:'8px', textAlign:'center'}}>
          <div style={{fontFamily:'Playfair Display,serif', fontSize:'2rem', color:'var(--gold)', lineHeight:1}}>{done}</div>
          <div style={{fontSize:'0.78rem', textTransform:'uppercase', letterSpacing:'0.12em', marginTop:'0.3rem', opacity:0.6}}>Выполнено</div>
        </div>
        <div style={{background:'var(--white)', border:'1px solid var(--border)', padding:'1rem 2rem', borderRadius:'8px', textAlign:'center'}}>
          <div style={{fontFamily:'Playfair Display,serif', fontSize:'2rem', color:'var(--text-muted)', lineHeight:1}}>{items.length - done}</div>
          <div style={{fontSize:'0.78rem', textTransform:'uppercase', letterSpacing:'0.12em', marginTop:'0.3rem', color:'var(--text-muted)'}}>В работе</div>
        </div>
      </div>

      {items.map(item => (
        <div key={item.id} className="checklist-item">
          <div className={`checklist-status ${item.done ? 'done' : 'pending'}`}
            style={{border: item.done ? 'none' : '2px solid var(--cream-dark)'}}>
            {item.done ? '✓' : ''}
          </div>
          <div className="checklist-content">
            <div className="checklist-title">{item.title}</div>
            <div className="checklist-responsible">
              Ответственный: <strong>{item.responsible}</strong>
            </div>
          </div>
          {item.done && (
            <div style={{padding:'0.3rem 0.9rem', background:'rgba(201,168,76,0.12)', color:'var(--gold)', borderRadius:'20px', fontSize:'0.78rem', fontWeight:700, whiteSpace:'nowrap', alignSelf:'flex-start'}}>
              Готово
            </div>
          )}
        </div>
      ))}

      <div style={{marginTop:'2rem', padding:'1.5rem 2rem', background:'var(--navy)', borderRadius:'10px', color:'var(--white)'}}>
        <div style={{fontSize:'0.78rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.6rem'}}>
          Принять участие в организации
        </div>
        <p style={{color:'rgba(255,255,255,0.7)', fontSize:'0.97rem', marginBottom:'1.2rem'}}>
          Если вы готовы взять на себя одно из направлений — оставьте пожелание при регистрации.
        </p>
        <Link to="/register"><button className="btn btn-gold">Зарегистрироваться и написать</button></Link>
      </div>
    </div>
  )
}
