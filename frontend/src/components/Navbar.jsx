import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const loc = useLocation()
  const isAdmin = !!localStorage.getItem('admin_token')

  return (
    <nav>
      <div className="nav-brand">⚓ Встреча выпускников</div>
      <ul className="nav-links">
        <li><Link to="/">Главная</Link></li>
        <li><Link to="/program">Программа</Link></li>
        <li><Link to="/register">Регистрация</Link></li>
        <li><Link to="/vote">Голосование</Link></li>
        {isAdmin
          ? <li><Link to="/admin">Панель</Link></li>
          : <li><Link to="/admin">Вход</Link></li>
        }
      </ul>
    </nav>
  )
}
