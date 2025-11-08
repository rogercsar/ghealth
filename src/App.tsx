import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Tracking from './pages/Tracking'
import Exams from './pages/Exams'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { EnsureProfile } from './auth/EnsureProfile'
import Landing from './pages/Landing'
import Shell from './components/layout/Shell'
import './App.css'

export default function App() {
  const location = useLocation()
  const shellRoutes = ['/dashboard','/profile','/tracking','/exams']
  const isShellRoute = shellRoutes.some(p => location.pathname.startsWith(p))

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {isShellRoute ? (
          <Shell>
            <Routes>
              <Route path="/dashboard" element={<ProtectedRoute><EnsureProfile><Dashboard /></EnsureProfile></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/tracking" element={<ProtectedRoute><EnsureProfile><Tracking /></EnsureProfile></ProtectedRoute>} />
              <Route path="/exams" element={<ProtectedRoute><EnsureProfile><Exams /></EnsureProfile></ProtectedRoute>} />
            </Routes>
          </Shell>
        ) : (
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
    </div>
  )
}
