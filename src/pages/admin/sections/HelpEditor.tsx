import { useState, useRef } from 'react';
import { Plus, Trash2, Save, GripVertical, ChevronDown, Loader2 } from 'lucide-react';
import { useAdminData } from '../../../contexts/AdminDataContext';
import type { FAQ } from '../../../lib/courseTypes';
import type { HelpContent } from '../../../lib/contentStore';

export default function HelpEditor() {
  const { helpContent, saveHelpContent, syncing } = useAdminData();
  const [content, setContent] = useState<HelpContent>(helpContent);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  // Drag state
  const dragIdx     = useRef<number | null>(null);
  const dragOverIdx = useRef<number | null>(null);

  function markDirty() { setSaved(false); }

  function updateContact(key: keyof HelpContent['contact'], val: string) {
    setContent(c => ({ ...c, contact: { ...c.contact, [key]: val } }));
    markDirty();
  }

  function updateFaq(id: string, key: 'q' | 'a', val: string) {
    setContent(c => ({
      ...c,
      faqs: c.faqs.map(f => f.id === id ? { ...f, [key]: val } : f),
    }));
    markDirty();
  }

  function addFaq() {
    const newFaq: FAQ = {
      id: crypto.randomUUID(),
      q: 'Nueva pregunta',
      a: 'Respuesta aquí…',
      orden: content.faqs.length + 1,
    };
    setContent(c => ({ ...c, faqs: [...c.faqs, newFaq] }));
    setOpenIdx(content.faqs.length);
    markDirty();
  }

  function removeFaq(id: string) {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    const idx = content.faqs.findIndex(f => f.id === id);
    setContent(c => ({ ...c, faqs: c.faqs.filter(f => f.id !== id).map((f, i) => ({ ...f, orden: i + 1 })) }));
    if (openIdx === idx) setOpenIdx(null);
    markDirty();
  }

  // ── Drag-and-drop reorder ──────────────────────────────────────

  function onDragStart(i: number) {
    dragIdx.current = i;
  }

  function onDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    dragOverIdx.current = i;
  }

  function onDrop() {
    const from = dragIdx.current;
    const to   = dragOverIdx.current;
    if (from === null || to === null || from === to) return;

    setContent(c => {
      const faqs = [...c.faqs];
      const [moved] = faqs.splice(from, 1);
      faqs.splice(to, 0, moved);
      const reordered = faqs.map((f, i) => ({ ...f, orden: i + 1 }));
      // Adjust openIdx
      if (openIdx === from) setOpenIdx(to);
      return { ...c, faqs: reordered };
    });

    dragIdx.current     = null;
    dragOverIdx.current = null;
    markDirty();
  }

  async function handleSave() {
    setSaving(true);
    saveHelpContent(content);
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Editor de Help</h2>
          <p className="text-sm text-gray-500 mt-0.5">FAQ y datos de contacto — sincronizado con Notion</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? '¡Guardado!' : 'Guardar'}
        </button>
      </div>

      {syncing && (
        <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando desde Notion…
        </div>
      )}

      {/* Contact info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4 pb-3 border-b border-gray-100">Datos de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {([
            { key: 'email'    as const, label: 'Correo electrónico', placeholder: 'hola@keylab.academy' },
            { key: 'telegram' as const, label: 'Telegram',           placeholder: '@keylabacademy' },
            { key: 'docs'     as const, label: 'Docs URL',           placeholder: 'docs.keylab.academy' },
          ]).map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
              <input value={content.contact[key]} onChange={e => updateContact(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">
            Preguntas Frecuentes ({content.faqs.length})
            <span className="ml-2 text-xs text-gray-400 font-normal">arrastra para reordenar</span>
          </h3>
          <button onClick={addFaq}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition">
            <Plus className="w-3.5 h-3.5" /> Agregar pregunta
          </button>
        </div>

        <div className="space-y-2">
          {content.faqs.map((faq, i) => (
            <div
              key={faq.id}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={e => onDragOver(e, i)}
              onDrop={onDrop}
              className="border border-gray-100 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
            >
              {/* Header */}
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50">
                <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="flex-1 text-left text-sm font-semibold text-gray-800 flex items-center justify-between">
                  <span className="truncate">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-2 ${openIdx === i ? 'rotate-180' : ''}`} />
                </button>
                <button onClick={() => removeFaq(faq.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Editors */}
              {openIdx === i && (
                <div className="p-4 space-y-3" onMouseDown={e => e.stopPropagation()}>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Pregunta</label>
                    <input value={faq.q} onChange={e => updateFaq(faq.id, 'q', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Respuesta</label>
                    <textarea value={faq.a} onChange={e => updateFaq(faq.id, 'a', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none" />
                  </div>
                </div>
              )}
            </div>
          ))}

          {content.faqs.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">Aún no hay preguntas frecuentes. ¡Agrega la primera!</p>
          )}
        </div>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          ✅ Cambios guardados en Notion. Recarga la página de Help para verlos.
        </div>
      )}
    </div>
  );
}
