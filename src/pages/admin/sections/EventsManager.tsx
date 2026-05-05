import { useState } from 'react';
import { Plus, Edit3, Trash2, Save, Calendar, MapPin } from 'lucide-react';
import { useAdminData } from '../../../contexts/AdminDataContext';
import MediaUploadInput from '../../../components/MediaUploadInput';
import type { Event } from '../../../lib/supabase';

const DB_EVENTOS = '49a1de40c0454bcbbcc15340bd205dfb';

const EMPTY: Partial<Event> = {
  title: '', description: '', date: '', end_date: '', location: '',
  image_urls: [], video_url: '', agenda: '',
};

function fmt(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', { dateStyle: 'medium' });
}

/* ── Event Form ─────────────────────────────────────────── */
function EventForm({ initial, onSave, onCancel }: {
  initial: Partial<Event>;
  onSave: (d: Partial<Event>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Event>>(initial);
  const [imgInput, setImgInput] = useState('');
  const [tab, setTab] = useState<'basic' | 'media' | 'agenda'>('basic');

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  function addImage() {
    if (!imgInput.trim()) return;
    set('image_urls', [...(form.image_urls || []), imgInput.trim()]);
    setImgInput('');
  }

  return (
    <div className="bg-white border border-indigo-200 rounded-2xl shadow-md overflow-hidden mb-5">
      <div className="flex border-b border-gray-100 bg-gray-50">
        {(['basic', 'media', 'agenda'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-3 text-sm font-semibold transition ${tab === t
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
              : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'basic' ? 'Información' : t === 'media' ? 'Imágenes & Video' : 'Agenda'}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === 'basic' && (
          <div className="space-y-4">
            <div>
              <label className="label">Título *</label>
              <input className="input" value={form.title || ''} onChange={e => set('title', e.target.value)} placeholder="Nombre del evento" />
            </div>
            <div>
              <label className="label">Descripción *</label>
              <textarea className="input h-24 resize-none" value={form.description || ''} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Fecha de inicio *</label>
                <input className="input" type="datetime-local" value={form.date ? form.date.slice(0, 16) : ''} onChange={e => set('date', e.target.value)} />
              </div>
              <div>
                <label className="label">Fecha de fin</label>
                <input className="input" type="datetime-local" value={form.end_date ? form.end_date.slice(0, 16) : ''} onChange={e => set('end_date', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Ubicación</label>
              <input className="input" value={form.location || ''} onChange={e => set('location', e.target.value)} placeholder="Online — Zoom / Ciudad de México" />
            </div>
          </div>
        )}

        {tab === 'media' && (
          <div className="space-y-4">
            <MediaUploadInput
              label="Video (YouTube embed o archivo MP4)"
              mode="video"
              value={form.video_url || ''}
              onChange={v => set('video_url', v)}
              notionDatabaseId={DB_EVENTOS}
              placeholder="https://www.youtube.com/embed/..."
            />
            <div>
              <label className="label">Imágenes (URL o archivo)</label>
              <div className="flex gap-2 mb-3">
                <input className="input flex-1" value={imgInput} onChange={e => setImgInput(e.target.value)}
                  placeholder="https://..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())} />
                <button onClick={addImage} type="button" className="btn-secondary px-3 shrink-0">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {/* File upload for adding images */}
              <div className="mb-3">
                <MediaUploadInput
                  value=""
                  onChange={v => { if (v) set('image_urls', [...(form.image_urls || []), v]); }}
                  mode="image"
                  notionDatabaseId={DB_EVENTOS}
                  placeholder=""
                />
              </div>
              <div className="flex gap-2 flex-wrap mt-2">
                {(form.image_urls || []).map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                    <button onClick={() => set('image_urls', (form.image_urls || []).filter((_, j) => j !== i))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      ×
                    </button>
                  </div>
                ))}
                {!(form.image_urls || []).length && (
                  <p className="text-sm text-gray-400">Aún no hay imágenes.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'agenda' && (
          <div>
            <label className="label">Agenda del evento (una línea por bloque de tiempo)</label>
            <textarea
              className="input h-48 resize-none font-mono text-xs"
              value={form.agenda || ''}
              onChange={e => set('agenda', e.target.value)}
              placeholder={"18:00 — Bienvenida y presentaciones\n18:15 — Talk 1: Introducción\n19:00 — Q&A\n19:30 — Cierre"}
            />
            <p className="text-xs text-gray-400 mt-2">Cada línea aparecerá como un punto de la agenda en el detalle del evento.</p>
          </div>
        )}

        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
          <button onClick={() => onSave(form)} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> Guardar evento
          </button>
          <button onClick={onCancel} className="btn-secondary">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

/* ── Events Manager ─────────────────────────────────────── */
export default function EventsManager() {
  const { events, saveEvent, deleteEvent } = useAdminData();
  const [editing, setEditing] = useState<Partial<Event> | null>(null);
  const [search, setSearch] = useState('');

  const filtered = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.location || '').toLowerCase().includes(search.toLowerCase())
  );

  function handleSave(data: Partial<Event>) {
    if (!data.title?.trim()) { alert('El título es obligatorio'); return; }
    if (!data.date) { alert('La fecha de inicio es obligatoria'); return; }
    saveEvent(data);
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar este evento permanentemente?')) return;
    deleteEvent(id);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gestión de Eventos</h2>
          <p className="text-sm text-gray-500 mt-0.5">{events.length} eventos en total</p>
        </div>
        <button onClick={() => setEditing(EMPTY)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo evento
        </button>
      </div>

      {editing && (
        <EventForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título o ubicación…"
            className="w-full bg-white px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" />
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            {events.length === 0 ? 'Aún no hay eventos. ¡Crea el primero!' : 'Sin resultados para tu búsqueda.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(ev => (
              <div key={ev.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition">
                {ev.image_urls[0] ? (
                  <img src={ev.image_urls[0]} alt="" className="w-14 h-14 object-cover rounded-xl shrink-0" />
                ) : (
                  <div className="w-14 h-14 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-xl shrink-0 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{ev.title}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmt(ev.date)}</span>
                    {ev.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</span>}
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${
                      new Date(ev.date) >= new Date() ? 'bg-sky-50 text-sky-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {new Date(ev.date) >= new Date() ? 'Próximo' : 'Finalizado'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => setEditing(ev)}
                    className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(ev.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
