import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import Admin from './pages/Admin'
import Cart from './pages/Cart'
import Jobs from './pages/Jobs'
import Login from './pages/Login'
import Menu from './pages/Menu'
import Track from './pages/Track'
import Auth from './pages/Auth'

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/login" element={<Login />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/track" element={<Track />} />
      <Route path="/auth" element={<Auth />} />
    </Routes>
  )
}
