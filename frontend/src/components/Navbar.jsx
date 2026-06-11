import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const isAdmin = !!localStorage.getItem('admin_token')
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <nav>
      <Link to="/" onClick={close} style={{display:'flex', alignItems:'center', gap:'0.7rem', textDecoration:'none'}}>
        <img src="/images/logo.png" alt="ВМИРЭ" style={{height:'40px', width:'auto', objectFit:'contain'}} />
        <span className="nav-brand">ВМИРЭ · Выпуск 2011</span>
      </Link>

      <button
        className="nav-toggle"
        aria-label="Меню"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <span /><span /><span />
      </button>

      <ul className={`nav-links ${open ? 'open' : ''}`}>
        <li><Link to="/" onClick={close}>Главная</Link></li>
        <li><Link to="/program" onClick={close}>Программа</Link></li>
        <li><Link to="/restaurants" onClick={close}>Рестораны</Link></li>
        <li><Link to="/guests" onClick={close}>Участники</Link></li>
        <li><Link to="/register" onClick={close}>Регистрация</Link></li>
        <li><Link to="/checklist" onClick={close}>Оргкомитет</Link></li>
        {isAdmin
          ? <li><Link to="/admin" onClick={close}>Панель</Link></li>
          : <li><Link to="/admin" onClick={close}>Вход</Link></li>}
      </ul>
    </nav>
  )
}
