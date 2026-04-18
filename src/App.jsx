import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/layout/ErrorBoundary';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BlogPage from './pages/BlogPage';
import ProfilePage from './pages/ProfilePage';
import DashboardSwitcher from './pages/DashboardSwitcher';
import EditorPage from './pages/EditorPage';
import AdminDashboard from './pages/AdminDashboard';
import Blogs from './pages/Blogs';
import Feed from './pages/Feed';
import Saved from './pages/Saved';
import Liked from './pages/Liked';
import Following from './pages/Following';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-950 bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 text-white">
          <Navbar />
          <main className="flex-1 relative z-10">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/blog/:id" element={<BlogPage />} />
                <Route path="/profile/:id" element={<ProfilePage />} />
                <Route
                  path="/editor"
                  element={
                    <ProtectedRoute requiredRole="author">
                      <EditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/editor/:id"
                  element={
                    <ProtectedRoute requiredRole="author">
                      <EditorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardSwitcher />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/feed"
                  element={
                    <ProtectedRoute>
                      <Feed />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/saved"
                  element={
                    <ProtectedRoute>
                      <Saved />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/liked"
                  element={
                    <ProtectedRoute>
                      <Liked />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/following"
                  element={
                    <ProtectedRoute>
                      <Following />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Home />} />
              </Routes>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
        <Toaster position="bottom-right" />
      </AuthProvider>
    </BrowserRouter>
  );
}