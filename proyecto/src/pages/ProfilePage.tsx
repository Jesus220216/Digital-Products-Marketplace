import { useState } from 'react';
import { User, Mail, Link2, DollarSign, Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function ProfilePage() {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Inicia sesion para ver tu perfil</p>
      </div>
    );
  }

  async function handleSave() {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Mi Perfil</h1>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informacion Personal
            </h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg">
                <Mail className="w-5 h-5 text-slate-400" />
                <span className="text-slate-700">{profile.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Tu nombre"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Guardando...' : saved ? 'Guardado!' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

        {profile.is_affiliate && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6">
            <div className="p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Informacion de Afiliado
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Codigo de Afiliado
                </label>
                <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <Link2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-mono font-semibold text-emerald-700">
                    {profile.affiliate_code}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Balance Disponible
                </label>
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700">Comisiones pendientes</span>
                  <span className="font-bold text-2xl text-emerald-600">
                    ${Number(profile.affiliate_balance).toFixed(2)}
                  </span>
                </div>
              </div>

              <Link
                to="/afiliado"
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span className="font-medium text-slate-700">Ir al Panel de Afiliado</span>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-6">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Seguridad
            </h2>
          </div>
          <div className="p-6">
            <Link
              to="/mis-compras"
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="font-medium text-slate-700">Ver historial de compras</span>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
