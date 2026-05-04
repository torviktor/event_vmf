import { Link } from 'react-router-dom'

export default function Navbar() {
  const isAdmin = !!localStorage.getItem('admin_token')
  return (
    <nav>
      <Link to="/" style={{display:'flex', alignItems:'center', gap:'0.7rem', textDecoration:'none'}}>
        <img src="/images/logo.png" alt="ВМИРЭ" style={{height:'40px', width:'auto', objectFit:'contain'}} />
        <span className="nav-brand">ВМИРЭ · Выпуск 2011</span>
      </Link>
      <ul className="nav-links">
        <li><Link to="/">Главная</Link></li>
        <li><Link to="/program">Программа</Link></li>
        <li><Link to="/restaurants">Рестораны</Link></li>
        <li><Link to="/guests">Участники</Link></li>
        <li><Link to="/register">Регистрация</Link></li>
        <li><Link to="/checklist">Оргкомитет</Link></li>
        {isAdmin
          ? <li><Link to="/admin">Панель</Link></li>
          : <li><Link to="/admin">Вход</Link></li>}
      </ul>
    </nav>
  )
}
