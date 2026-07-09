import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, Play, FileText, Package, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Bolt Database } from '../lib/supabase';
import type { Order, OrderItem, Product } from '../types/database';

interface OrderWithItems extends Order {
  order_items: (OrderItem & { products: Product })[];
}

export function PurchasesPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  async function fetchOrders() {
    const { data } = await Bolt Database
      .from('orders')
      .select(`*, order_items(*, products(*))`)
      .eq('user_id', user!.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    setOrders((data as OrderWithItems[]) || []);
    setLoading(false);
  }

  function toggleOrder(orderId: string) {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Inicia sesion para ver tus compras</p>
          <Link
            to="/"
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Mis Compras</h1>
          <p className="text-slate-600 mt-1">Historial de productos adquiridos</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl p-6">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-4" />
                <div className="h-20 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Sin compras aun
            </h3>
            <p className="text-slate-600 mb-6">
              Explora nuestros productos y realiza tu primera compra
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isExpanded = expandedOrders.has(order.id);
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleOrder(order.id)}
                    className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-900">
                          Pedido #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          ${Number(order.total_amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.order_items.length} productos
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 p-6">
                      <div className="space-y-4">
                        {order.order_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl"
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                              <img
                                src={
                                  item.products.thumbnail_url ||
                                  getDefaultThumbnail(item.products.type)
                                }
                                alt={item.products.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {item.products.type === 'video' ? (
                                  <Play
                                    className="w-4 h-4 text-rose-500"
                                    fill="currentColor"
                                  />
                                ) : (
                                  <FileText className="w-4 h-4 text-blue-500" />
                                )}
                                <span className="text-xs font-medium text-slate-500 uppercase">
                                  {item.products.type}
                                </span>
                              </div>
                              <h4 className="font-medium text-slate-900">
                                {item.products.title}
                              </h4>
                              <p className="text-sm text-slate-500 mt-1">
                                ${Number(item.price_at_purchase).toFixed(2)}
                              </p>
                            </div>
                            <a
                              href={item.products.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Descargar
                            </a>
                          </div>
                        ))}
                      </div>

                      {order.affiliate_code_used && (
                        <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                          <p className="text-xs text-emerald-700">
                            Codigo de afiliado usado: <strong>{order.affiliate_code_used}</strong>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function getDefaultThumbnail(type: 'video' | 'pdf'): string {
  return type === 'video'
    ? 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=200'
    : 'https://images.pexels.com/photos/4065181/pexels-photo-4065181.jpeg?auto=compress&cs=tinysrgb&w=200';
}
