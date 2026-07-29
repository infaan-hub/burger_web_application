import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Home from './components/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Contact from './pages/Contact'
import Dashboard from './pages/Dashboard'
import Order from './pages/Order'
import MenuList from './pages/MenuList'
import Settings from './pages/Settings'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminMessages from './pages/AdminMessages'
import AdminOrders from './pages/AdminOrders'
import AdminMenuList from './pages/AdminMenuList'
import AdminUsers from './pages/AdminUsers'
import NotFound from './pages/NotFound'

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="bg-black min-h-screen">
      <Header isOpen={sidebarOpen} onToggle={() => setSidebarOpen((p) => !p)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {children}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/order" element={<Layout><Order /></Layout>} />
        <Route path="/order/:id" element={<Layout><Order /></Layout>} />
        <Route path="/menu-list" element={<Layout><MenuList /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/admin/messages" element={<Layout><AdminMessages /></Layout>} />
        <Route path="/admin/orders" element={<Layout><AdminOrders /></Layout>} />
        <Route path="/admin/menu-list" element={<Layout><AdminMenuList /></Layout>} />
        <Route path="/admin/users" element={<Layout><AdminUsers /></Layout>} />
        <Route path="/admin/settings" element={<Layout><Settings /></Layout>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
