import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Link2, Copy, Check, TrendingUp, Users, ShoppingCart, Calendar, Download, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { OrderItem, AffiliateWithdrawal, Product } from '../types/database';

interface CommissionItem {
  id: string;
  product_title: string;
  product_type: 'video' | 'pdf';
  amount: number;
  created_at: string;
}

export function AffiliateDashboardPage() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingBalance: 0,
    totalReferrals: 0,
    thisMonthEarnings: 0,
  });
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<AffiliateWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  useEffect(() => {
    if (user && profile?.is_affiliate) {
      fetchData();
    }
  }, [user, profile]);

  async function fetchData() {
    const affiliateCode = profile!.affiliate_code;

    const { data: orders } = await supabase
      .from('orders')
      .select(`id, created_at, order_items(id, product_id, commission_amount, created_at, products(title, type))`)
      .eq('affiliate_code_used', affiliateCode)
      .eq('status', 'completed');

    const commissionItems: CommissionItem[] = [];
    let totalEarnings = 0;
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    let thisMonthEarnings = 0;

    if (orders) {
      orders.forEach((order) => {
        order.order_items.forEach((item) => {
          const product = item.products as Product;
          commissionItems.push({
            id: item.id,
            product_title: product.title,
            product_type: product.type,
            amount: Number(item.commission_amount),
            created_at: item.created_at,
          });
          totalEarnings += Number(item.commission_amount);
          if (new Date(item.created_at) >= thisMonth) {
            thisMonthEarnings += Number(item.commission_amount);
          }
        });
      });
    }

    const { data: withdrawalData } = await supabase
      .from('affiliate_withdrawals')
      .select('*')
      .eq('affiliate_id', user!.id)
      .order('created_at', { ascending: false });

    const totalWithdrawn = (withdrawalData || [])
      .filter((w) => w.status === 'completed')
      .reduce((sum, w) => sum + Number(w.amount), 0);

    setStats({
      totalEarnings,
      pendingBalance: Number(profile!.affiliate_balance),
      totalReferrals: commissionItems.length,
      thisMonthEarnings,
    });

    setCommissions(commissionItems.slice(0, 10));
    setWithdrawals(withdrawalData || []);
    setLoading(false);
  }

  async function handleCopyLink() {
    const link = `${window.location.origin}/?ref=${profile!.affiliate_code}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);

    if (amount <= 0 || amount > stats.pendingBalance) {
      alert('Monto invalido');
      return;
    }

    if (amount < 10) {
      alert('El minimo de retiro es $10');
      return;
    }

    setWithdrawLoading(true);

    const { error } = await supabase.from('affiliate_withdrawals').insert({
      affiliate_id: user!.id,
      amount,
    });

    if (error) {
      alert('Error al solicitar retiro');
    } else {
      await supabase
        .from('profiles')
        .update({ affiliate_balance: stats.pendingBalance - amount })
        .eq('id', user!.id);

      setShowWithdrawModal(false);
      setWithdrawAmount('');
      fetchData();
    }

    setWithdrawLoading(false);
  }

  if (!profile?.is_affiliate) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No estas registrado como afiliado</p>
          <Link
            to="/afiliados"
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Unirse al programa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Panel de Afiliado</h1>
          <p className="text-slate-600 mt-1">Gestiona tu enlace, comisiones y retiros</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-emerald-200 text-sm">Tu enlace de afiliado</p>
              <p className="font-mono text-lg truncate max-w-md">
                {window.location.origin}/?ref={profile.affiliate_code}
              </p>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-200">
            <Users className="w-4 h-4" />
            Comparte este enlace para generar comisiones
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm">Balance Disponible</span>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ${stats.pendingBalance.toFixed(2)}
            </p>
            {stats.pendingBalance >= 10 && (
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Solicitar retiro
              </button>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm">Ganancias Totales</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ${stats.totalEarnings.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm">Este Mes</span>
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ${stats.thisMonthEarnings.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm">Ventas Referidas</span>
              <ShoppingCart className="w-5 h-5 text-rose-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats.totalReferrals}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Comisiones Recientes</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-6 text-center text-slate-500">Cargando...</div>
              ) : commissions.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  Sin comisiones aun. Comparte tu enlace!
                </div>
              ) : (
                commissions.map((commission) => (
                  <div key={commission.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{commission.product_title}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(commission.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <span className="font-semibold text-emerald-600">
                      +${commission.amount.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Historial de Retiros</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {withdrawals.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  Sin retiros solicitados
                </div>
              ) : (
                withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        ${Number(withdrawal.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(withdrawal.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        withdrawal.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : withdrawal.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {withdrawal.status === 'completed'
                        ? 'Completado'
                        : withdrawal.status === 'rejected'
                          ? 'Rechazado'
                          : 'Pendiente'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowWithdrawModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Solicitar Retiro</h3>
                <button onClick={() => setShowWithdrawModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleWithdraw} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Monto a retirar
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      min="10"
                      max={stats.pendingBalance}
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Balance disponible: ${stats.pendingBalance.toFixed(2)} | Minimo: $10.00
                </p>
                <button
                  type="submit"
                  disabled={withdrawLoading}
                  className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {withdrawLoading ? 'Procesando...' : 'Solicitar Retiro'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}