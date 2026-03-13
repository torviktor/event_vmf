import { useState, useEffect } from 'react'
import { api } from '../api'

export default function Guests() {
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getStats().then(() => {}).catch(() => {})
    // Публичный список — только подтверждённые
    fetch('/api/guests/public').then(r => r.json()).then(setGuests).catch(() => setGuests([]))
    setLoading(false)
  }, [])

  return (
    <div className="section">
      <h2 className="section-title">Список участников</h2>
      <p className="section-sub">Подтверждённые участники встречи выпускников ВМИРЭ 2011</p>

      {loading && <div className="spinner" />}

      {!loading && guests.length === 0 && (
        <div style={{textAlign:'center', padding:'3rem', color:'var(--text-muted)', fontSize:'1.05rem'}}>
          Список участников пока формируется.<br/>
          <a href="/register" style={{color:'var(--gold)', fontWeight:700, marginTop:'0.8rem', display:'inline-block'}}>Зарегистрируйтесь первым →</a>
        </div>
      )}

      {guests.length > 0 && (
        <div style={{background:'var(--white)', border:'1px solid var(--border)', borderRadius:'12px', overflow:'hidden', boxShadow:'var(--shadow)'}}>
          {guests.map((name, i) => (
            <div key={i} style={{
              padding:'1rem 1.5rem',
              borderBottom: i < guests.length - 1 ? '1px solid var(--cream-dark)' : 'none',
              display:'flex',
              alignItems:'center',
              gap:'1rem',
              transition:'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background='var(--cream)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              <span style={{
                width:'32px', height:'32px', background:'var(--navy)', color:'var(--gold)',
                borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:'Playfair Display,serif', fontWeight:700, fontSize:'0.9rem', flexShrink:0
              }}>{i + 1}</span>
              <span style={{fontSize:'1.05rem', fontWeight:600}}>{name}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{marginTop:'1.5rem', textAlign:'center'}}>
        <a href="/register"><button className="btn btn-primary">Зарегистрироваться</button></a>
      </div>
    </div>
  )
}
