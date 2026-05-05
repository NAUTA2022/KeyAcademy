import { useState } from 'react';
import { Save, RefreshCw, Eye, Loader2 } from 'lucide-react';
import { DEFAULT_HOME } from '../../../lib/contentStore';
import { useAdminData } from '../../../contexts/AdminDataContext';
import MediaUploadInput from '../../../components/MediaUploadInput';
import type { HomeConfig } from '../../../lib/courseTypes';

const DB_CONFIG_HOME = 'e4250891ddad48e5ae77669158698277';

const COLORS = [
  'from-amber-400 to-orange-500',
  'from-sky-400 to-cyan-500',
  'from-indigo-400 to-violet-500',
  'from-green-400 to-emerald-500',
  'from-pink-400 to-rose-500',
];

export default function HomeEditor() {
  const { homeConfig, saveHomeConfig, syncing } = useAdminData();
  const [content, setContent] = useState<HomeConfig>(homeConfig);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  // Keep local state in sync when context data changes (e.g. after initial Notion sync)
  // Only sync on mount; after that the admin's edits take precedence
  // (handled by the provider: homeConfig changes only on refresh)

  function updateHero(key: keyof HomeConfig['hero'], val: string) {
    setContent(c => ({ ...c, hero: { ...c.hero, [key]: val } }));
    setSaved(false);
  }

  function updateFeature(i: number, key: string, val: string) {
    setContent(c => ({
      ...c,
      features: c.features.map((f, idx) => idx === i ? { ...f, [key]: val } : f),
    }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    saveHomeConfig(content);  // syncs to Notion in background
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    if (!confirm('¿Restaurar el contenido por defecto?')) return;
    setContent(DEFAULT_HOME);
    saveHomeConfig(DEFAULT_HOME);
    setSaved(true);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Editor de Home</h2>
          <p className="text-sm text-gray-500 mt-0.5">Los cambios se guardan en Notion y se reflejan en la página principal</p>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition">
            <Eye className="w-4 h-4" /> Preview
          </a>
          <button onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition">
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? '¡Guardado!' : 'Guardar'}
          </button>
        </div>
      </div>

      {syncing && (
        <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando datos desde Notion…
        </div>
      )}

      {/* Logo */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">Logo / Navbar</h3>
        <MediaUploadInput
          label="Imagen del logo (opcional)"
          value={content.logoUrl ?? ''}
          onChange={v => { setContent(c => ({ ...c, logoUrl: v })); setSaved(false); }}
          mode="image"
          notionDatabaseId={DB_CONFIG_HOME}
          placeholder="https://..."
        />
        <p className="text-xs text-gray-400 mt-2">Si no se define, se muestra el texto "Key Lab Academy".</p>
      </div>

      {/* Hero section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">
          Sección Hero (Banner principal)
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Badge / Etiqueta</label>
            <input value={content.hero.badge} onChange={e => updateHero('badge', e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Título principal</label>
            <input value={content.hero.title} onChange={e => updateHero('title', e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition font-bold" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Subtítulo / Descripción</label>
            <textarea value={content.hero.subtitle} onChange={e => updateHero('subtitle', e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Botón principal (texto)</label>
              <input value={content.hero.btn1} onChange={e => updateHero('btn1', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Botón secundario (texto)</label>
              <input value={content.hero.btn2} onChange={e => updateHero('btn2', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">
          Sección de Características (3 columnas bajo el hero)
        </h3>
        <div className="space-y-5">
          {content.features.map((f, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">Característica {i + 1}</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Título</label>
                  <input value={f.title} onChange={e => updateFeature(i, 'title', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Descripción</label>
                  <textarea value={f.description} onChange={e => updateFeature(i, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Ícono (nombre)</label>
                  <input value={f.icon} onChange={e => updateFeature(i, 'icon', e.target.value)}
                    placeholder="zap, users, book, star…"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Color del ícono</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => updateFeature(i, 'color', c)}
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c} transition-all ${f.color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          ✅ Cambios guardados en Notion. Recarga la Home para verlos.
        </div>
      )}
    </div>
  );
}
