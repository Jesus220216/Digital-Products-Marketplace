import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Play, FileText, ShoppingCart, Check, Share2, ArrowLeft, Clock, Tag, Users } from 'lucide-react';
import { Bolt Database } from '../lib/supabase';
import { useCart } from '../hooks/useCart';
import type { Product } from '../types/database';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const affiliateCode = searchParams.get('ref');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem, items } = useCart();
  const inCart = items.some((item) => item.product.id === id);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  async function fetchProduct() {
    const { data } = await Bolt Database
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle();
    setProduct(data);
    setLoading(false);
  }

  function handleAddToCart() {
    if (product && !inCart) {
      addItem(product);
    }
  }

  function handleShare() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-5xl mx-auto px-4 animate-pulse">
          <div className="bg-slate-200 h-8 w-32 rounded mb-8" />
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-slate-200 aspect-video" />
            <div className="p-8 space-y-4">
              <div className="bg-slate-200 h-8 w-3/4 rounded" />
              <div className="bg-slate-200 h-4 w-1/2 rounded" />
              <div className="bg-slate-200 h-20 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Producto no encontrado</h1>
          <Link to="/" className="text-emerald-600 hover:text-emerald-700">
            Volver al catalogo
          </Link>
        </div>
      </div>
    );
  }

  const thumbnail = product.thumbnail_url || getDefaultThumbnail(product.type);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <Link
          to="/"
          className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al catalogo
        </Link>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="relative aspect-video overflow-hidden bg-slate-900">
            <img
              src={thumbnail}
              alt={product.title}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              {product.type === 'video' ? (
                <div className="p-6 bg-white/20 backdrop-blur rounded-full">
                  <Play className="w-12 h-12 text-white" fill="white" />
                </div>
              ) : (
                <div className="p-6 bg-white/20 backdrop-blur rounded-full">
                  <FileText className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
            <div className="absolute top-4 left-4">
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                  product.type === 'video'
                    ? 'bg-rose-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}
              >
                {product.type === 'video' ? (
                  <>
                    <Play className="w-4 h-4 mr-2" fill="white" />
                    Video
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">{product.title}</h1>
                <p className="text-slate-600 text-lg leading-relaxed mb-6">
                  {product.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center p-4 bg-slate-50 rounded-xl">
                    <Clock className="w-5 h-5 text-slate-400 mr-3" />
                    <div>
                      <p className="text-xs text-slate-500">Acceso</p>
                      <p className="font-medium text-slate-900">Ilimitado</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-slate-50 rounded-xl">
                    <Users className="w-5 h-5 text-slate-400 mr-3" />
                    <div>
                      <p className="text-xs text-slate-500">Tipo</p>
                      <p className="font-medium text-slate-900">
                        {product.type === 'video' ? 'Video HD' : 'Documento PDF'}
                      </p>
                    </div>
                  </div>
                </div>

                {product.affiliate_commission_pct > 0 && (
                  <div className="flex items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <Tag className="w-5 h-5 text-emerald-600 mr-3" />
                    <div>
                      <p className="text-sm text-emerald-700">
                        <span className="font-semibold">{product.affiliate_commission_pct}% de comision</span> para afiliados
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:w-80">
                <div className="bg-slate-50 rounded-2xl p-6 sticky top-24">
                  <div className="text-center mb-6">
                    <p className="text-sm text-slate-500 mb-1">Precio</p>
                    <p className="text-4xl font-bold text-slate-900">
                      ${Number(product.price).toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">Unico pago</p>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={inCart}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center ${
                      inCart
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/25'
                    }`}
                  >
                    {inCart ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Agregado al carrito
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Agregar al carrito
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleShare}
                    className="w-full mt-3 py-3 px-6 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-white transition-colors flex items-center justify-center"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir producto
                  </button>

                  {affiliateCode && (
                    <p className="text-xs text-center text-slate-500 mt-4">
                      Referido por: {affiliateCode}
                    </p>
                  )}
                </div>
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
    ? 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800'
    : 'https://images.pexels.com/photos/4065181/pexels-photo-4065181.jpeg?auto=compress&cs=tinysrgb&w=800';
}
