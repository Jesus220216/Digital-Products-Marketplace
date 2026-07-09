import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Lock, Check, Play, FileText, Loader2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Bolt Database } from '../lib/supabase';

export function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const affiliateCode = searchParams.get('ref');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    }
  }, [user, navigate]);

  if (!user || items.length === 0) {
    if (success) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Compra Exitosa!
            </h1>
            <p className="text-slate-600 mb-6">
              Tu pedido ha sido procesado correctamente. Ya tienes acceso a tus productos.
            </p>
            <div className="space-y-3">
              <Link
                to="/mis-compras"
                className="block w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Ver mis compras
              </Link>
              <Link
                to="/"
                className="block w-full py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (!user) return null;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Tu carrito esta vacio</p>
          <Link
            to="/"
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: order, error: orderError } = await Bolt Database
        .from('orders')
        .insert({
          user_id: user!.id,
          total_amount: total,
          status: 'completed',
          affiliate_code_used: affiliateCode || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        price_at_purchase: item.product.price,
        commission_amount:
          (item.product.price * item.product.affiliate_commission_pct) / 100,
      }));

      const { error: itemsError } = await Bolt Database
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      if (affiliateCode) {
        const { data: affiliate } = await Bolt Database
          .from('profiles')
          .select('id')
          .eq('affiliate_code', affiliateCode)
          .maybeSingle();

        if (affiliate) {
          const totalCommission = orderItems.reduce(
            (sum, item) => sum + item.commission_amount,
            0
          );

          await supabase.rpc('increment_affiliate_balance', {
            affiliate_id: affiliate.id,
            amount: totalCommission,
          });
        }
      }

      setSuccess(true);
      clearCart();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Ha ocurrido un error. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <Link
          to="/carrito"
          className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al carrito
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Informacion de Pago
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Numero de Tarjeta
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(
                          e.target.value
                            .replace(/\D/g, '')
                            .replace(/(.{4})/g, '$1 ')
                            .trim()
                            .slice(0, 19)
                        )
                      }
                      placeholder="1234 5678 9012 3456"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre en la Tarjeta
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                    placeholder="JUAN PEREZ"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Fecha de Expiracion
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) =>
                        setCardExpiry(
                          e.target.value
                            .replace(/\D/g, '')
                            .replace(/(\d{2})(\d)/, '$1/$2')
                            .slice(0, 5)
                        )
                      }
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) =>
                        setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))
                      }
                      placeholder="123"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Pagar ${total.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-center text-slate-500">
                  Este es un entorno de demostracion. No se procesaran pagos reales.
                </p>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-slate-900 mb-4">Resumen</h3>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded bg-slate-100 flex-shrink-0 overflow-hidden">
                      <img
                        src={
                          item.product.thumbnail_url ||
                          getDefaultThumbnail(item.product.type)
                        }
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 line-clamp-1">
                        {item.product.title}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        {item.product.type === 'video' ? (
                          <Play className="w-3 h-3" />
                        ) : (
                          <FileText className="w-3 h-3" />
                        )}
                        x{item.quantity}
                      </div>
                    </div>
                    <p className="text-sm font-medium">
                      ${(Number(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Impuestos</span>
                  <span>Incluidos</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {affiliateCode && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                  <p className="text-xs text-emerald-700">
                    Codigo de afiliado: <strong>{affiliateCode}</strong>
                  </p>
                </div>
              )}

              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">
                  <strong>Cliente:</strong> {profile?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDefaultThumbnail(type: 'video' | 'pdf'): string {
  return type === 'video'
    ? 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=200'
    : 'https://images.pexels.com/photos/4065181/pexels-photo-4065181.jpeg?auto=compress&cs=tinysrgb&w=200';
}
