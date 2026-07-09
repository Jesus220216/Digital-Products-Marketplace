import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { AuthModal } from './AuthModal';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { user, profile, signOut } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Productos' },
    { to: '/videos', label: 'Videos' },
    { to: '/pdfs', label: 'PDFs' },
    ...(user ? [{ to: '/mis-compras', label: 'Mis Compras' }] : []),
    ...(profile?.is_affiliate ? [{ to: '/afiliado', label: 'Panel Afiliado' }] : []),
  ];

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-slate-900">
                Digital<span className="text-emerald-600">Store</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'text-emerald-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <Link
                to="/carrito"
                className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 text-slate-600 hover:text-slate-900 transition-colors">
                    <User className="w-6 h-6" />
                    <span className="hidden sm:block text-sm font-medium">
                      {profile?.full_name || 'Usuario'}
                    </span>
                  </button>
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      to="/perfil"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Mi Perfil
                    </Link>
                    <Link
                      to="/admin"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Link>
                    <button
                      onClick={signOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesion
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Iniciar Sesion
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Registrarse
                  </button>
                </div>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                    location.pathname === link.to
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
}
