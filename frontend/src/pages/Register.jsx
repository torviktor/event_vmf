import { useState } from 'react'
import { api } from '../api'

const initialForm = {
  name: '',
  phone: '',
  specialty: '',
  adults_count: 1,
  children: [],
  will_attend_institute: true,
  will_attend_restaurant: true,
  photo_email: '',
  message: '',
}

export default function Register() {
  const [form, setForm] = useState(initialForm)
  const [childCount, setChildCount] = useState(0)
  const [childData, setChildData] = useState([])
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  function set(field, value) { setForm(f => ({ ...f, [field]: value })) }

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
      const children = childData.filter(c => c.age !== '').map(c => ({ name: c.name || null, age: parseInt(c.age) }))
      await api.register({
        ...form,
        graduation_year: 2011,
        adults_count: parseInt(form.adults_count),
        children,
        message: [form.message, form.photo_email ? `Почта для фото: ${form.photo_email}` : ''].filter(Boolean).join(' | '),
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
        <div style={{fontSize:'3rem', marginBottom:'1rem', color:'var(--gold)'}}>✓</div>
        <h1 style={{color:'var(--navy)', marginBottom:'0.8rem'}}>Заявка принята</h1>
        <p style={{color:'var(--text-muted)', marginBottom:'2rem', maxWidth:'420px', margin:'0 auto 2rem', fontSize:'1.05rem'}}>
          Оргкомитет свяжется с вами для подтверждения участия.
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
      <p className="section-sub">Заполните форму — мы учтём вас при планировании. Выпуск 2011 года.</p>

      <div className="form-wrap">
        {status === 'error' && <div className="alert alert-error">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group form-full">
              <label>Фамилия, имя, отчество *</label>
              <input type="text" placeholder="Иванов Иван Иванович" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Телефон *</label>
              <input type="tel" placeholder="+7 999 000 00 00" value={form.phone} onChange={e => set('phone', e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Кафедра / специальность</label>
              <input type="text" placeholder="например, МКК, РТС, ИС..." value={form.specialty} onChange={e => set('specialty', e.target.value)} />
            </div>

            <div className="form-group form-full">
              <label>Участие в программе</label>
              <div className="checkbox-group mt-1">
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.will_attend_institute} onChange={e => set('will_attend_institute', e.target.checked)} />
                  Посещение института (утро, 10:00)
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" checked={form.will_attend_restaurant} onChange={e => set('will_attend_restaurant', e.target.checked)} />
                  Торжественный ужин (вечер, 18:00)
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Взрослых (включая вас)</label>
              <input type="number" min="1" max="6" value={form.adults_count} onChange={e => set('adults_count', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Детей</label>
              <input type="number" min="0" max="10" value={childCount} onChange={e => handleChildCountChange(parseInt(e.target.value) || 0)} />
            </div>

            {childCount > 0 && (
              <div className="form-group form-full">
                <label>Имя и возраст детей</label>
                <div className="children-list">
                  {childData.map((c, i) => (
                    <div className="child-row" key={i}>
                      <input placeholder={`Имя ребёнка ${i + 1}`} value={c.name} onChange={e => setChild(i, 'name', e.target.value)} />
                      <input type="number" placeholder="Возраст" min="0" max="17" style={{width:'110px', flex:'none'}} value={c.age} onChange={e => setChild(i, 'age', e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group form-full">
              <label>Почта для доступа к фотоальбому</label>
              <input type="email" placeholder="ivan@example.com" value={form.photo_email} onChange={e => set('photo_email', e.target.value)} />
              <span style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>Пришлём приглашение в альбом на Яндекс.Диске</span>
            </div>

            <div className="form-group form-full">
              <label>Пожелания и вопросы</label>
              <textarea placeholder="Хочу выступить с тостом, есть вопрос по расписанию..." value={form.message} onChange={e => set('message', e.target.value)} />
            </div>
          </div>

          <div style={{marginTop:'2rem', display:'flex', alignItems:'center', gap:'1.2rem', flexWrap:'wrap'}}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Отправка...' : 'Подтвердить участие'}
            </button>
            <span style={{fontSize:'0.88rem', color:'var(--text-muted)'}}>
              Данные используются только для организации встречи
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
