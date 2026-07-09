import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Play, FileText, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Product, ProductInsert, ProductUpdate } from '../types/database';
import { Link } from 'react-router-dom';

export function AdminPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState<ProductUpdate>({});
  const [addForm, setAddForm] = useState<ProductInsert>({
    title: '',
    description: '',
    type: 'video',
    price: 0,
    file_url: '',
    thumbnail_url: '',
    affiliate_commission_pct: 10,
    is_active: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setEditForm({
      title: product.title,
      description: product.description,
      price: product.price,
      affiliate_commission_pct: product.affiliate_commission_pct,
      is_active: product.is_active,
      thumbnail_url: product.thumbnail_url,
      file_url: product.file_url,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);

    const { error } = await supabase
      .from('products')
      .update(editForm)
      .eq('id', editingId);

    if (error) {
      alert('Error al guardar');
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...editForm } : p))
      );
      setEditingId(null);
      setEditForm({});
    }
    setSaving(false);
  }

  async function deleteProduct(id: string) {
    if (!confirm('Eliminar este producto?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert('Error al eliminar');
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  }

  async function addProduct() {
    setSaving(true);

    const { data, error } = await supabase
      .from('products')
      .insert(addForm)
      .select()
      .single();

    if (error) {
      alert('Error al crear producto');
    } else {
      setProducts((prev) => [data, ...prev]);
      setShowAddModal(false);
      setAddForm({
        title: '',
        description: '',
        type: 'video',
        price: 0,
        file_url: '',
        thumbnail_url: '',
        affiliate_commission_pct: 10,
        is_active: true,
      });
    }
    setSaving(false);
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Inicia sesion para acceder al admin</p>
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
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Panel de Administracion</h1>
            <p className="text-slate-600 mt-1">Gestiona los productos digitales</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Comision
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      {editingId === product.id ? (
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden">
                            <img
                              src={product.thumbnail_url || getDefaultThumbnail(product.type)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{product.title}</p>
                            <p className="text-xs text-slate-500 truncate max-w-xs">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          product.type === 'video'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {product.type === 'video' ? (
                          <>
                            <Play className="w-3 h-3 mr-1" fill="currentColor" />
                            Video
                          </>
                        ) : (
                          <>
                            <FileText className="w-3 h-3 mr-1" />
                            PDF
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === product.id ? (
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                          className="w-24 px-3 py-2 border border-slate-200 rounded-lg"
                          step="0.01"
                        />
                      ) : (
                        <span className="font-medium">${Number(product.price).toFixed(2)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === product.id ? (
                        <input
                          type="number"
                          value={editForm.affiliate_commission_pct}
                          onChange={(e) =>
                            setEditForm({ ...editForm, affiliate_commission_pct: parseFloat(e.target.value) })
                          }
                          className="w-20 px-3 py-2 border border-slate-200 rounded-lg"
                          step="0.1"
                          min="0"
                          max="100"
                        />
                      ) : (
                        <span className="text-slate-600">{product.affiliate_commission_pct}%</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === product.id ? (
                        <select
                          value={editForm.is_active ? 'true' : 'false'}
                          onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'true' })}
                          className="px-3 py-2 border border-slate-200 rounded-lg"
                        >
                          <option value="true">Activo</option>
                          <option value="false">Inactivo</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            product.is_active
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {product.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingId === product.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={saving}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          >
                            {saving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(product)}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
                <h3 className="font-semibold text-slate-900">Nuevo Producto</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Titulo
                  </label>
                  <input
                    type="text"
                    value={addForm.title}
                    onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Nombre del producto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Descripcion
                  </label>
                  <textarea
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Descripcion del producto"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Tipo
                    </label>
                    <select
                      value={addForm.type}
                      onChange={(e) => setAddForm({ ...addForm, type: e.target.value as 'video' | 'pdf' })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Precio
                    </label>
                    <input
                      type="number"
                      value={addForm.price}
                      onChange={(e) => setAddForm({ ...addForm, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Comision de Afiliado (%)
                  </label>
                  <input
                    type="number"
                    value={addForm.affiliate_commission_pct}
                    onChange={(e) =>
                      setAddForm({ ...addForm, affiliate_commission_pct: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    URL del Archivo
                  </label>
                  <input
                    type="url"
                    value={addForm.file_url}
                    onChange={(e) => setAddForm({ ...addForm, file_url: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    URL de Miniatura (opcional)
                  </label>
                  <input
                    type="url"
                    value={addForm.thumbnail_url || ''}
                    onChange={(e) => setAddForm({ ...addForm, thumbnail_url: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={addForm.is_active}
                    onChange={(e) => setAddForm({ ...addForm, is_active: e.target.checked })}
                    className="w-4 h-4 border-slate-300 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="is_active" className="text-sm text-slate-700">
                    Producto activo
                  </label>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addProduct}
                  disabled={saving || !addForm.title || !addForm.file_url}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Crear Producto
                    </>
                  )}
                </button>
              </div>
            </div>
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
