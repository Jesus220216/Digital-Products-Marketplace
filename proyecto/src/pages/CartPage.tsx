import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Minus, Plus, ShoppingBag, Play, FileText } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

export function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [affiliateCode, setAffiliateCode] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  function handleCheckout() {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    navigate('/checkout' + (affiliateCode ? `?ref=${affiliateCode}` : ''));
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Tu carrito esta vacio</h1>
            <p className="text-slate-600 mb-8">
              Explora nuestra coleccion de productos digitales
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ver productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-slate-600 hover:text-slate-900 mr-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="
