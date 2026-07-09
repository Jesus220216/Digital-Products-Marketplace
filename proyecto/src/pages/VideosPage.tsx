import { useState, useEffect } from 'react';
import { SortAsc, Play } from 'lucide-react';
import { Bolt Database } from '../lib/supabase';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types/database';

export function VideosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');

  useEffect(() => {
    fetchProducts();
  }, [sortBy]);

  async function fetchProducts() {
    setLoading(true);
    let query = Bolt Database
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('type', 'video');

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
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-rose-100 text-rose-600 rounded-full text-sm font-medium mb-4">
            <Play className="w-4 h-4 mr-2" fill="currentColor" />
            Catalogo de Videos
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Videos de Alta Calidad
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Aprende de los expertos con nuestra coleccion de videos en HD.
            Cursos, tutoriales y masterclass disponibles para descargar.
          </p>
        </div>

        <div className="flex items-center justify-between mb-8">
          <p className="text-slate-600">
            {products.length} videos disponibles
          </p>
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
              <Play className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-slate-600">No hay videos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
