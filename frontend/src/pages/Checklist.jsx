import { Link } from 'react-router-dom'

const ITEMS = [
  {
    title: 'Сайт-приглашение',
    responsible: 'Веревкин Виктор',
    done: true,
    desc: 'Разработка и запуск сайта для организации встречи.',
  },
  {
    title: 'Проход в институт',
    responsible: 'Определяется',
    done: false,
    desc: 'Согласование списков с руководством института, организация пропусков. Паспорт обязателен.',
  },
  {
    title: 'Сувениры для преподавателей',
    responsible: 'Определяется',
    done: false,
    desc: 'Коллективный подарок от выпуска преподавателям и руководству кафедр.',
  },
  {
    title: 'Подарки детям',
    responsible: 'Определяется',
    done: false,
    desc: 'Памятные подарки для детей участников (игрушки с символикой, именные сувениры).',
  },
  {
    title: 'Ресторан',
    responsible: 'Определяется',
    done: false,
    desc: 'Выбор заведения с детским уголком, согласование меню и программы вечера. Бронь на 27 июня 2026.',
  },
  {
    title: 'Сбор контактов и RSVP',
    responsible: 'Оргкомитет',
    done: false,
    desc: 'Сбор подтверждений участия, формирование итоговых списков.',
  },
  {
    title: 'Бюджет и взносы',
    responsible: 'Определяется',
    done: false,
    desc: 'Сбор взносов, учёт расходов, распределение бюджета по статьям.',
  },
  {
    title: 'Фотограф / видео',
    responsible: 'Определяется',
    done: false,
    desc: 'Организация профессиональной съёмки на вечернем мероприятии.',
  },
]

export default function Checklist() {
  const done = ITEMS.filter(i => i.done).length

  return (
    <div className="section">
      <h2 className="section-title">Оргкомитет</h2>
      <p className="section-sub">
        Встреча выпускников ВМИРЭ им. А.С. Попова · Выпуск 2011 · 27 июня 2026
      </p>

      <div style={{
        display:'flex', gap:'1.5rem', marginBottom:'2rem', flexWrap:'wrap'
      }}>
        <div style={{background:'var(--navy)', color:'var(--white)', padding:'1rem 2rem', borderRadius:'8px', textAlign:'center'}}>
          <div style={{fontFamily:'Playfair Display,serif', fontSize:'2rem', color:'var(--gold)', lineHeight:1}}>{done}</div>
          <div style={{fontSize:'0.78rem', textTransform:'uppercase', letterSpacing:'0.12em', marginTop:'0.3rem', opacity:0.6}}>Выполнено</div>
        </div>
        <div style={{background:'var(--white)', border:'1px solid var(--border)', padding:'1rem 2rem', borderRadius:'8px', textAlign:'center'}}>
          <div style={{fontFamily:'Playfair Display,serif', fontSize:'2rem', color:'var(--text-muted)', lineHeight:1}}>{ITEMS.length - done}</div>
          <div style={{fontSize:'0.78rem', textTransform:'uppercase', letterSpacing:'0.12em', marginTop:'0.3rem', color:'var(--text-muted)'}}>В работе</div>
        </div>
      </div>

      <div>
        {ITEMS.map((item, i) => (
          <div key={i} className="checklist-item">
            <div className={`checklist-status ${item.done ? 'done' : 'pending'}`} style={{border: item.done ? 'none' : '2px solid var(--cream-dark)'}}>
              {item.done ? '✓' : ''}
            </div>
            <div className="checklist-content">
              <div className="checklist-title" style={{textDecoration: item.done ? 'none' : 'none'}}>
                {item.title}
              </div>
              <div className="checklist-responsible">
                Ответственный: <strong>{item.responsible}</strong>
              </div>
              <div style={{fontSize:'0.9rem', color:'var(--text-muted)', marginTop:'0.3rem'}}>{item.desc}</div>
            </div>
            {item.done && (
              <div style={{
                padding:'0.3rem 0.9rem', background:'rgba(201,168,76,0.12)', color:'var(--gold)',
                borderRadius:'20px', fontSize:'0.78rem', fontWeight:700, letterSpacing:'0.08em',
                whiteSpace:'nowrap', alignSelf:'flex-start'
              }}>Готово</div>
            )}
          </div>
        ))}
      </div>

      <div style={{marginTop:'2rem', padding:'1.5rem 2rem', background:'var(--navy)', borderRadius:'10px', color:'var(--white)'}}>
        <div style={{fontSize:'0.78rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.6rem'}}>Принять участие в организации</div>
        <p style={{color:'rgba(255,255,255,0.7)', fontSize:'0.97rem', marginBottom:'1.2rem'}}>
          Если вы готовы взять на себя одно из направлений — напишите организаторам или оставьте пожелание при регистрации.
        </p>
        <Link to="/register"><button className="btn btn-gold">Зарегистрироваться и написать</button></Link>
      </div>
    </div>
  )
}
