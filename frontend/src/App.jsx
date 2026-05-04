import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Register from './pages/Register'
import Program from './pages/Program'
import Vote from './pages/Vote'
import Admin from './pages/Admin'
import Guests from './pages/Guests'
import Checklist from './pages/Checklist'
import Restaurants from './pages/Restaurants'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/program" element={<Program />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/restaurants" element={<Restaurants />} />
      </Routes>
      <footer>
        <strong>Встреча выпускников ВМИРЭ им. А.С. Попова · Выпуск 2011</strong><br/>
        Разработка <a href="https://t.me/TORVIKTOR" target="_blank" rel="noopener noreferrer" style={{color:'var(--gold)'}}>t.me/TORVIKTOR</a>
      </footer>
    </>
  )
}
