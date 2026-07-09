import { Play, FileText, ShoppingCart, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/database';
import { useCart } from '../hooks/useCart';

interface ProductCardProps {
  product: Product;
  affiliateCode?: string | null;
}

export function ProductCard({ product, affiliateCode }: ProductCardProps) {
  const { addItem, items } = useCart();
  const inCart = items.some((item) => item.product.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) {
      addItem(product);
    }
  };

  const productLink = affiliateCode
    ? `/producto/${product.id}?ref=${affiliateCode}`
    : `/producto/${product.id}`;

  const thumbnail = product.thumbnail_url || getDefaultThumbnail(product.type);

  return (
    <Link to={productLink} className="group">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
          <img
            src={thumbnail}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                product.type === 'video'
                  ? 'bg-rose-500 text-white'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {product.type === 'video' ? (
                <>
                  <Play className="w-3 h-3 mr-1" fill="white" />
                  Video
                </>
              ) : (
                <>
                  <FileText className="w-3 h-3 mr-1" />
                  PDF
                </>
              )}
            </span>
          </div>
          <div className="absolute bottom-3 right-3">
            <span className="text-2xl font-bold text-white drop-shadow-lg">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-semibold text-slate-900 text-lg mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
            {product.title}
          </h3>
          <p className="text-slate-500 text-sm line-clamp-2 mb-4">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-slate-400">
              {product.type === 'video' ? (
                <>
                  <Play className="w-3 h-3 mr-1" />
                  Contenido en video
                </>
              ) : (
                <>
                  <FileText className="w-3 h-3 mr-1" />
                  Documento PDF
                </>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={inCart}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                inCart
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-900 text-white hover:bg-emerald-600'
              }`}
            >
              {inCart ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  En carrito
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Agregar
                </>
              )}
            </button>
          </div>

          {product.affiliate_commission_pct > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <span className="text-xs text-emerald-600 font-medium">
                {product.affiliate_commission_pct}% comision para afiliados
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function getDefaultThumbnail(type: 'video' | 'pdf'): string {
  return type === 'video'
    ? 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800'
    : 'https://images.pexels.com/photos/4065181/pexels-photo-4065181.jpeg?auto=compress&cs=tinysrgb&w=800';
}
