import { useState } from 'react';
import { Calendar, MapPin, Clock, Users, ArrowRight, Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useActiveAccount } from 'thirdweb/react';
import { supabase } from '../lib/supabase';
import { sendRegistrationEmail } from '../lib/email';
import { getEvents } from '../lib/contentStore';
import { getDisplayUrl } from '../lib/notionDB';
import type { Event } from '../lib/supabase';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

/* ── Image carousel ─────────────────────────────────────────── */
function ImageCarousel({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  if (!images.length) return null;
  return (
    <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
      <img src={getDisplayUrl(images[idx])} alt="" className="w-full h-56 sm:h-64 object-cover" />
      {images.length > 1 && (
        <>
          <button onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setIdx((i) => (i + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-3' : 'bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Registration modal ─────────────────────────────────────── */
function RegisterModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const account = useActiveAccount();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const supabaseConfigured = Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Only write to Supabase if it's configured — skip silently otherwise
      if (supabaseConfigured) {
        const { error: dbErr } = await supabase.from('registrations').insert({
          event_id: event.id,
          user_email: email,
          user_name: name,
          wallet_address: account?.address,
        });
        if (dbErr && !dbErr.message.includes('duplicate')) throw dbErr;
      }

      await sendRegistrationEmail({
        toEmail: email,
        toName: name,
        eventTitle: event.title,
        eventDate: `${formatDate(event.date)} · ${formatTime(event.date)}`,
        eventLocation: event.location || 'Online',
        agenda: event.agenda,
      });

      setSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ocurrió un error';
      setError(msg.includes('duplicate') ? 'Ya estás registrado en este evento.' : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition">
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">¡Reserva confirmada!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Te enviamos la agenda a <strong>{email}</strong>. Pronto recibirás los datos de acceso.
            </p>
            <button onClick={onClose}
              className="mt-5 px-6 py-2 bg-sky-500 text-white rounded-full text-sm font-semibold hover:bg-sky-600 transition">
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Reservar mi lugar</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 line-clamp-2">{event.title}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Nombre completo</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Correo electrónico</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400 transition" />
              </div>

              {account && (
                <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  Wallet: {account.address.slice(0, 6)}…{account.address.slice(-4)}
                </div>
              )}

              {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-sky-400 to-indigo-500 text-white font-semibold rounded-xl text-sm hover:opacity-90 transition disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? 'Enviando…' : 'Reservar mi lugar →'}
              </button>

              <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                Recibirás la agenda por correo y los datos de acceso antes del evento.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Event detail drawer ────────────────────────────────────── */
function EventDetail({ event, onClose, onRegister }: { event: Event; onClose: () => void; onRegister: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-2xl p-5 sm:p-7">
        <button onClick={onClose} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white mb-5 transition">
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>

        {event.video_url ? (
          <div className="rounded-xl overflow-hidden mb-5 bg-black">
            {getDisplayUrl(event.video_url).match(/\.(mp4|webm|ogg)(\?|$)/i) ? (
              <video src={getDisplayUrl(event.video_url)} controls className="w-full max-h-64" />
            ) : (
              <div className="aspect-video">
                <iframe src={getDisplayUrl(event.video_url)} className="w-full h-full" allowFullScreen title={event.title} />
              </div>
            )}
          </div>
        ) : (
          <ImageCarousel images={event.image_urls} />
        )}

        <div className="mt-5 space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{event.title}</h2>

          <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-sky-500" />{formatDate(event.date)}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-sky-500" />{formatTime(event.date)}{event.end_date ? ` — ${formatTime(event.end_date)}` : ''}</span>
            {event.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-sky-500" />{event.location}</span>}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{event.description}</p>

          {event.agenda && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Agenda</h4>
              <div className="space-y-2">
                {event.agenda.split('\n').map((line, i) => (
                  <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{line}</p>
                ))}
              </div>
            </div>
          )}

          <button onClick={onRegister}
            className="w-full py-3.5 bg-gradient-to-r from-sky-400 to-indigo-500 text-white font-bold rounded-xl text-sm hover:opacity-90 transition shadow-md shadow-sky-200/50">
            Reservar mi lugar →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Event card ─────────────────────────────────────────────── */
function EventCard({ event, onSelect }: { event: Event; onSelect: () => void }) {
  const image = event.image_urls[0];
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow group">
      <div className="relative overflow-hidden h-44 sm:h-48 bg-gradient-to-br from-sky-400 to-indigo-600">
        {image && <img src={getDisplayUrl(image)} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
        {event.video_url && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
              <Play className="w-4 h-4 text-gray-800 ml-0.5" fill="currentColor" />
            </div>
          </div>
        )}
        {event.image_urls.length > 1 && (
          <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            +{event.image_urls.length - 1} fotos
          </span>
        )}
        <span className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full ${
          isPast ? 'bg-gray-500/80 text-white' : 'bg-sky-400/90 text-white'
        }`}>
          {isPast ? 'Finalizado' : 'Próximo evento'}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mb-2">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(event.date)}</span>
          {event.location && <span className="flex items-center gap-1 hidden sm:flex"><MapPin className="w-3.5 h-3.5" />{event.location}</span>}
        </div>

        <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2 line-clamp-2 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{event.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 sm:line-clamp-3 mb-4 leading-relaxed">{event.description}</p>

        <button onClick={onSelect}
          className="flex items-center gap-2 text-sm font-semibold text-sky-500 hover:text-sky-700 dark:hover:text-sky-400 transition group/btn">
          Ver detalle
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function Events() {
  const [selected, setSelected] = useState<Event | null>(null);
  const [registering, setRegistering] = useState<Event | null>(null);
  const events = getEvents();

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">Eventos</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Workshops, meetups y webinars de Key Lab</p>
      </div>

      {/* Stats bar */}
      <div className="flex gap-3 sm:gap-4 mb-6 flex-wrap">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 sm:px-5 py-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{events.filter(e => new Date(e.date) >= new Date()).length} próximos</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 sm:px-5 py-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Entrada gratuita</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {events.map((ev) => (
          <EventCard key={ev.id} event={ev} onSelect={() => setSelected(ev)} />
        ))}
      </div>

      {selected && (
        <EventDetail
          event={selected}
          onClose={() => setSelected(null)}
          onRegister={() => { setRegistering(selected); setSelected(null); }}
        />
      )}

      {registering && (
        <RegisterModal event={registering} onClose={() => setRegistering(null)} />
      )}
    </div>
  );
}
