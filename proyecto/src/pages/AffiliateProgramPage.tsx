import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Users, TrendingUp, Gift, ArrowRight, Check, Star, Copy } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export function AffiliateProgramPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleBecomeAffiliate() {
    if (!user) return;

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ is_affiliate: true })
      .eq('id', user.id);

    if (error) {
      alert('Error al registrarse como afiliado');
    }
    setLoading(false);
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/7688460/pexels-photo-7688460.jpeg?auto=compress&cs=tinysrgb&w=1920')] opacity-10 bg-cover bg-center" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6">
              <Gift className="w-4 h-4 mr-2" />
              Programa de Afiliados
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Gana dinero promoviendo
              <span className="text-emerald-400"> productos digitales</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Unete a nuestro programa de afiliados y obtiene comisiones por cada venta que generes.
              Es simple, rapido y sin inversion.
            </p>
            {!profile?.is_affiliate ? (
              <button
                onClick={handleBecomeAffiliate}
                disabled={loading || !user}
                className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/25 disabled:opacity-50"
              >
                {loading ? 'Registrando...' : user ? 'Convertirse en Afiliado' : 'Inicia sesion para unirte'}
              </button>
            ) : (
              <Link
                to="/afiliado"
                className="inline-flex items-center px-8 py-4 bg-white text-emerald-900 font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
              >
                Ir a mi Panel
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Comisiones Atractivas
              </h3>
              <p className="text-slate-600">
                Gana hasta 40% de comision por cada venta referida. Los pagos se procesan automaticamente.
              </p>
            </div>
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Sin Limite de Referidos
              </h3>
              <p className="text-slate-600">
                Promociona todos los productos que quieras. No hay limite en la cantidad de ventas que puedes generar.
              </p>
            </div>
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Pagos Mensuales
              </h3>
              <p className="text-slate-600">
                Recibe tus comisiones cada mes directamente a tu cuenta. Minimo de retiro: $10 USD.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Como funciona
          </h2>
          <div className="space-y-8">
            {[
              { step: 1, title: 'Registrate como afiliado', desc: 'Crea tu cuenta y activa el programa de afiliados en un clic.' },
              { step: 2, title: 'Obten tu enlace unico', desc: 'Recibiras un codigo de afiliado personalizado para compartir.' },
              { step: 3, title: 'Comparte y gana', desc: 'Promociona productos y gana comisiones por cada venta generada.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
            Lo que dicen nuestros afiliados
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: 'Maria Garcia', role: 'Blogger', text: 'En solo 3 meses he generado mas de $500 en comisiones. El sistema es super facil de usar.' },
              { name: 'Carlos Rodriguez', role: 'YouTuber', text: 'Excelente programa. Los productos son de calidad y mis seguidores los aman.' },
              { name: 'Ana Martinez', role: 'Influencer', text: 'Los pagos son puntuales y el soporte es muy bueno. Muy recomendado.' },
              { name: 'Luis Perez', role: 'Emprendedor', text: 'Una forma genia de generar ingresos pasivos. Ya llevo 50 referidos exitosos.' },
            ].map((testimonial, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-slate-700 mb-4">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Listo para empezar a ganar?
          </h2>
          <p className="text-slate-300 mb-8">
            Unete a cientos de afiliados que ya estan generando ingresos con nosotros.
          </p>
          {profile?.is_affiliate ? (
            <Link
              to="/afiliado"
              className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors"
            >
              Ir a mi Panel de Afiliado
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          ) : (
            <button
              onClick={handleBecomeAffiliate}
              disabled={loading || !user}
              className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Registrando...' : user ? 'Comenzar Ahora' : 'Inicia Sesion para Comenzar'}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}