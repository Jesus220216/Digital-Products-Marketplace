import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, SortAsc, ChevronRight, Video, FileText, Sparkles, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Bolt Database } from '../lib/supabase';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types/database';

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'video' | 'pdf'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [searchParams] = useSearchParams();
  const affiliateCode = searchParams.get('ref');

  useEffect(() => {
    fetchProducts();
  }, [filter, sortBy]);

  async function fetchProducts() {
    setLoading(true);
    let query = Bolt Database
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (filter !== 'all') {
      query = query.eq('type', filter);
    }

    switch (sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data } = await query;
    setProducts(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/7688460/pexels-photo-7688460.jpeg?auto=compress&cs=tinysrgb&w=1920')] opacity-10 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Productos digitales premium
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Aprende, Crece y
              <span className="text-emerald-400"> Monetiza</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Descubre nuestra coleccion de videos y documentos digitales.
              Contenido de calidad para profesionales y emprendedores.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="#productos"
                className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/25"
              >
                Ver Productos
              </Link>
              <Link
                to="/afiliados"
                className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
              >
                Programa de Afiliados
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
              <div className="p-3 bg-emerald-600 rounded-xl text-white mr-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Comisiones Altas</h3>
                <p className="text-slate-600 text-sm">
                  Gana hasta 40% de comision por cada venta referida.
                </p>
              </div>
            </div>
            <div className="flex items-start p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
              <div className="p-3 bg-blue-600 rounded-xl text-white mr-4">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Comunidad Activa</h3>
                <p className="text-slate-600 text-sm">
                  Miles de afiliados ya estan generando ingresos pasivos.
                </p>
              </div>
            </div>
            <div className="flex items-start p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
              <div className="p-3 bg-amber-600 rounded-xl text-white mr-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Pagos Rapidos</h3>
                <p className="text-slate-600 text-sm">
                  Retira tus comisiones en cualquier momento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="productos" className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Todos los Productos</h2>
              <p className="text-slate-600 mt-1">Explora nuestra coleccion completa</p>
            </div>

            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as typeof filter)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="all">Todos</option>
                  <option value="video">Videos</option>
                  <option value="pdf">PDFs</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="newest">Mas recientes</option>
                  <option value="price_asc">Menor precio</option>
                  <option value="price_desc">Mayor precio</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <Link
              to="/"
              className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
            >
              Todos
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-400 self-center" />
            <Link
              to="/videos"
              className="flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-rose-50 text-rose-600"
            >
              <Video className="w-4 h-4 mr-2" />
              Videos
            </Link>
            <Link
              to="/pdfs"
              className="flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-600"
            >
              <FileText className="w-4 h-4 mr-2" />
              PDFs
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 rounded-2xl aspect-[4/3]" />
                  <div className="mt-4 space-y-2">
                    <div className="bg-slate-200 h-5 rounded w-3/4" />
                    <div className="bg-slate-200 h-4 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-slate-400 mb-4">
                <Filter className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-slate-600">No hay productos disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  affiliateCode={affiliateCode}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
