import { useState } from 'react'
import { api } from '../api'

const initialForm = {
  name: '',
  phone: '',
  graduation_year: '',
  specialty: '',
  adults_count: 1,
  children: [],
  will_attend_institute: true,
  will_attend_restaurant: true,
  dietary_notes: '',
  message: '',
}

export default function Register() {
  const [form, setForm] = useState(initialForm)
  const [childCount, setChildCount] = useState(0)
  const [childData, setChildData] = useState([]) // [{name, age}]
  const [status, setStatus] = useState(null) // 'ok' | 'error' | null
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleChildCountChange(n) {
    const count = Math.max(0, Math.min(10, n))
    setChildCount(count)
    setChildData(prev => {
      const arr = [...prev]
      while (arr.length < count) arr.push({ name: '', age: '' })
      return arr.slice(0, count)
    })
  }

  function setChild(i, field, value) {
    setChildData(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      setStatus('error'); setErrorMsg('Заполните имя и телефон'); return
    }
    setLoading(true); setStatus(null)
    try {
      const children = childData
        .filter(c => c.age !== '')
        .map(c => ({ name: c.name || null, age: parseInt(c.age) }))
      await api.register({
        ...form,
        graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
        adults_count: parseInt(form.adults_count),
        children,
      })
      setStatus('ok')
      setForm(initialForm)
      setChildCount(0)
      setChildData([])
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Ошибка при отправке')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'ok') {
    return (
      <div className="section text-center">
        <div style={{fontSize:'4rem', marginBottom:'1rem'}}>🎉</div>
        <h1 style={{color:'var(--navy)', marginBottom:'0.8rem', fontFamily:'Playfair Display,serif'}}>Спасибо!</h1>
        <p style={{color:'var(--text-muted)', marginBottom:'2rem', maxWidth:'420px', margin:'0 auto 2rem'}}>
          Ваша заявка принята. Оргкомитет свяжется с вами для подтверждения.
        </p>
        <button className="btn btn-primary" onClick={() => setStatus(null)}>
          Зарегистрировать ещё одного участника
        </button>
      </div>
    )
  }

  return (
    <div className="section">
      <h2 className="section-title">Регистрация</h2>
      <p className="section-sub">Заполните форму — мы учтём вас при планировании</p>

      <div className="form-wrap">
        {status === 'error' && <div className="alert alert-error">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group form-full">
              <label>ФИО *</label>
              <input
                type="text"
                placeholder="Иванов Иван Иванович"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Телефон *</label>
              <input
                type="tel"
                placeholder="+7 999 000 00 00"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Год выпуска</label>
              <input
                type="number"
                placeholder="например, 2000"
                min="1950" max="2025"
                value={form.graduation_year}
                onChange={e => set('graduation_year', e.target.value)}
              />
            </div>

            <div className="form-group form-full">
              <label>Специальность / кафедра</label>
              <input
                type="text"
                placeholder="например, Кораблестроение, каф. МКК"
                value={form.specialty}
                onChange={e => set('specialty', e.target.value)}
              />
            </div>

            {/* Attendance */}
            <div className="form-group form-full">
              <label>Участие в программе</label>
              <div className="checkbox-group mt-1">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.will_attend_institute}
                    onChange={e => set('will_attend_institute', e.target.checked)}
                  />
                  🏫 Посещение института (утро)
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.will_attend_restaurant}
                    onChange={e => set('will_attend_restaurant', e.target.checked)}
                  />
                  🥂 Ресторан (вечер)
                </label>
              </div>
            </div>

            {/* Adults */}
            <div className="form-group">
              <label>Взрослых (включая вас)</label>
              <input
                type="number" min="1" max="6"
                value={form.adults_count}
                onChange={e => set('adults_count', e.target.value)}
              />
            </div>

            {/* Children */}
            <div className="form-group">
              <label>Детей</label>
              <input
                type="number" min="0" max="10"
                value={childCount}
                onChange={e => handleChildCountChange(parseInt(e.target.value) || 0)}
              />
            </div>

            {childCount > 0 && (
              <div className="form-group form-full">
                <label>Данные детей (имя и возраст)</label>
                <div className="children-list">
                  {childData.map((c, i) => (
                    <div className="child-row" key={i}>
                      <input
                        placeholder={`Имя ребёнка ${i + 1}`}
                        value={c.name}
                        onChange={e => setChild(i, 'name', e.target.value)}
                      />
                      <input
                        type="number" placeholder="Возраст" min="0" max="17"
                        style={{width:'100px', flex:'none'}}
                        value={c.age}
                        onChange={e => setChild(i, 'age', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group form-full">
              <label>Пищевые ограничения / аллергии</label>
              <input
                type="text"
                placeholder="Вегетарианство, аллергия на орехи, и т.п."
                value={form.dietary_notes}
                onChange={e => set('dietary_notes', e.target.value)}
              />
            </div>

            <div className="form-group form-full">
              <label>Пожелания и вопросы</label>
              <textarea
                placeholder="Хочу выступить с тостом, есть вопрос по расписанию..."
                value={form.message}
                onChange={e => set('message', e.target.value)}
              />
            </div>
          </div>

          <div style={{marginTop:'1.8rem', display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap'}}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? '⏳ Отправка...' : '✓ Зарегистрироваться'}
            </button>
            <span style={{fontSize:'0.82rem', color:'var(--text-muted)'}}>
              Ваши данные используются только для организации встречи
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
