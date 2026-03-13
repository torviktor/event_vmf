import { useState, useEffect } from 'react'
import { api } from '../api'

export default function Vote() {
  const [poll, setPoll] = useState(null)
  const [voted, setVoted] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPoll().then(p => { setPoll(p); setLoading(false) }).catch(() => setLoading(false))
    const v = localStorage.getItem('voted_poll')
    if (v) setVoted(parseInt(v))
  }, [])

  async function vote(optionId) {
    if (voted) return
    try {
      await api.castVote(optionId)
      setVoted(optionId)
      localStorage.setItem('voted_poll', String(optionId))
      // refresh poll
      const updated = await api.getPoll()
      setPoll(updated)
    } catch {}
  }

  const totalVotes = poll ? poll.options.reduce((s, o) => s + o.votes, 0) : 0

  return (
    <div className="section">
      <h2 className="section-title">Голосование за дату</h2>
      <p className="section-sub">Выберите удобный вариант — победит большинство</p>

      {loading && <div className="spinner" />}

      {!loading && !poll && (
        <div className="vote-card text-center" style={{padding:'3rem'}}>
          <div style={{fontSize:'3rem', marginBottom:'1rem'}}>🗓️</div>
          <h3 style={{color:'var(--navy)', marginBottom:'0.5rem', fontFamily:'Playfair Display,serif'}}>Опрос ещё не создан</h3>
          <p style={{color:'var(--text-muted)'}}>Оргкомитет скоро предложит варианты дат</p>
        </div>
      )}

      {!loading && poll && (
        <div className="vote-card">
          <h3 style={{marginBottom:'1.5rem', color:'var(--navy)', fontFamily:'Playfair Display,serif', fontSize:'1.3rem'}}>
            {poll.title}
          </h3>

          {poll.options.map(opt => {
            const pct = totalVotes ? Math.round((opt.votes / totalVotes) * 100) : 0
            const isChosen = voted === opt.id
            return (
              <div
                key={opt.id}
                className={`vote-option${isChosen ? ' voted' : ''}`}
                onClick={() => vote(opt.id)}
                style={{cursor: voted ? 'default' : 'pointer'}}
              >
                <div style={{fontSize:'1.2rem', minWidth:'1.5rem'}}>
                  {isChosen ? '✓' : '○'}
                </div>
                <div className="vote-bar-wrap">
                  <div className="vote-label">{opt.label}</div>
                  {totalVotes > 0 && (
                    <div className="vote-bar-bg">
                      <div className="vote-bar-fill" style={{width:`${pct}%`}} />
                    </div>
                  )}
                </div>
                <div className="vote-count">{opt.votes}</div>
                {totalVotes > 0 && (
                  <div style={{fontSize:'0.8rem', color:'var(--text-muted)', minWidth:'2.5rem', textAlign:'right'}}>
                    {pct}%
                  </div>
                )}
              </div>
            )
          })}

          <div style={{marginTop:'1rem', fontSize:'0.82rem', color:'var(--text-muted)', textAlign:'right'}}>
            Всего голосов: <strong>{totalVotes}</strong>
            {voted && <span style={{marginLeft:'1rem', color:'var(--gold)', fontWeight:600}}>✓ Ваш голос учтён</span>}
          </div>
        </div>
      )}
    </div>
  )
}
