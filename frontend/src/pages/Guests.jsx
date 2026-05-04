import { useState, useEffect } from 'react'
import { api } from '../api'

function formatRub(n) {
  if (n == null || isNaN(n)) return '—'
  return new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₽'
}

function PaidMark({ paid, dim }) {
  if (dim) {
    return <span style={{color:'var(--text-muted)', fontSize:'1.1rem'}}>—</span>
  }
  return paid
    ? <span style={{color:'#1e8449', fontWeight:700, fontSize:'1.15rem'}} title="Оплачено">✓</span>
    : <span style={{color:'var(--text-muted)', fontSize:'1.1rem'}} title="Не оплачено">—</span>
}

export default function Guests() {
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getPublicGuests().catch(() => []),
      api.getPaymentsSummary().catch(() => null),
    ]).then(([list, sum]) => {
      setRows(Array.isArray(list) ? list : [])
      setSummary(sum)
      setLoading(false)
    })
  }, [])

  const photo = summary?.photographer
  const rest = summary?.restaurant
  const kidsRule = rest?.kids_rule || 'free'
  const restDepositKnown = rest?.per_person != null

  return (
    <div className="section">
      <h2 className="section-title">Список участников</h2>
      <p className="section-sub">Подтверждённые участники встречи выпускников ВМИРЭ 2011</p>

      {loading && <div className="spinner" />}

      {!loading && (
        <>
          {/* Плашки-счётчики оплат */}
          {summary && (
            <div style={{display:'flex', gap:'0.8rem', marginBottom:'1.5rem', flexWrap:'wrap'}}>
              <div style={{flex:'1 1 280px', background:'var(--white)', border:'1px solid var(--border)', borderRadius:'10px', padding:'1rem 1.3rem', boxShadow:'var(--shadow)'}}>
                <div style={{fontSize:'0.78rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', fontWeight:700, marginBottom:'0.4rem'}}>Фотограф</div>
                <div style={{fontFamily:'Playfair Display,serif', fontSize:'1.25rem', color:'var(--navy)'}}>
                  {photo?.paid_count ?? 0}/{(photo?.paid_count ?? 0) + (photo?.unpaid_count ?? 0)} оплатили
                </div>
                <div style={{fontSize:'0.92rem', color:'var(--text-muted)', marginTop:'0.25rem'}}>
                  {formatRub(photo?.total_collected)} из {formatRub(photo?.total_expected)}
                </div>
              </div>

              <div style={{flex:'1 1 280px', background:'var(--white)', border:'1px solid var(--border)', borderRadius:'10px', padding:'1rem 1.3rem', boxShadow:'var(--shadow)'}}>
                <div style={{fontSize:'0.78rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', fontWeight:700, marginBottom:'0.4rem'}}>Ресторан</div>
                {restDepositKnown ? (
                  <>
                    <div style={{fontFamily:'Playfair Display,serif', fontSize:'1.25rem', color:'var(--navy)'}}>
                      {rest.paid_count}/{rest.paid_count + rest.unpaid_count} оплатили
                    </div>
                    <div style={{fontSize:'0.92rem', color:'var(--text-muted)', marginTop:'0.25rem'}}>
                      {formatRub(rest.total_collected)} из {formatRub(rest.total_expected)} · {formatRub(rest.per_person)} с человека
                    </div>
                  </>
                ) : (
                  <div style={{fontSize:'0.95rem', color:'var(--text-muted)', fontStyle:'italic'}}>
                    Ожидает уточнения суммы
                  </div>
                )}
              </div>
            </div>
          )}

          {rows.length === 0 && (
            <div style={{textAlign:'center', padding:'3rem', color:'var(--text-muted)', fontSize:'1.05rem'}}>
              Список участников пока формируется.<br/>
              <a href="/register" style={{color:'var(--gold)', fontWeight:700, marginTop:'0.8rem', display:'inline-block'}}>Зарегистрируйтесь первым →</a>
            </div>
          )}

          {rows.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th style={{width:'48px'}}>#</th>
                    <th>ФИО</th>
                    <th style={{width:'90px', textAlign:'center'}}>Фото</th>
                    <th style={{width:'110px', textAlign:'center'}}>Ресторан</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const isSecondary = r.is_child || r.is_spouse
                    const restDim = r.is_child && kidsRule === 'free'
                    const label = r.is_child ? '(ребёнок)' : (r.is_spouse ? '(супруга)' : null)
                    return (
                      <tr key={i}>
                        <td style={{color:'var(--text-muted)'}}>{i + 1}</td>
                        <td>
                          <strong style={{color: isSecondary ? 'var(--text-muted)' : 'inherit', fontWeight: isSecondary ? 500 : 700, fontStyle: isSecondary ? 'italic' : 'normal'}}>
                            {r.name}
                          </strong>
                          {label && (
                            <span style={{marginLeft:'0.5rem', fontSize:'0.82rem', color:'var(--text-muted)', fontStyle:'italic'}}>
                              {label}
                            </span>
                          )}
                        </td>
                        <td style={{textAlign:'center'}}>
                          <PaidMark paid={r.paid_photographer} dim={r.is_child} />
                        </td>
                        <td style={{textAlign:'center'}}>
                          <PaidMark paid={r.paid_restaurant} dim={restDim} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div style={{marginTop:'1.5rem', textAlign:'center'}}>
            <a href="/register"><button className="btn btn-primary">Зарегистрироваться</button></a>
          </div>
        </>
      )}
    </div>
  )
}
