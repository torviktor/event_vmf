import { Link } from 'react-router-dom'

export default function Navbar() {
  const isAdmin = !!localStorage.getItem('admin_token')
  return (
    <nav>
      <div className="nav-brand">⚓ ВМИРЭ · Выпуск 2011</div>
      <ul className="nav-links">
        <li><Link to="/">Главная</Link></li>
        <li><Link to="/program">Программа</Link></li>
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
