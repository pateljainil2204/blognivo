import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading, isAuthor, isAdmin } = useAuth()

  if (loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">
          Loading...
        </p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" />

  if (requiredRole === 'author' && !isAuthor) {
    return <Navigate to="/" />
  }
  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/" />
  }

  return children
}