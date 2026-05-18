import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(s => s.auth.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return children
}
