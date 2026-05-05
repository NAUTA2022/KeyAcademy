/**
 * MediaUploadInput — dual-mode URL / file-upload input.
 *
 * Supports:
 *  • "image" mode: URL text input OR file upload → uploads to Notion → gets back a notion_file:: ref
 *  • "video" mode: URL embed (YouTube/Vimeo) OR MP4 file upload → same notion_file:: ref
 *
 * Props:
 *  • notionDatabaseId — the database this file belongs to (required for file upload)
 *  • value            — current URL or notion_file:: ref
 *  • onChange         — called with new value (notion_file:: ref or plain URL)
 *  • mode             — 'image' | 'video'
 */

import { useState, useRef } from 'react';
import {
  Link2, Upload, X, Image as ImageIcon, Video, AlertTriangle, Loader2, CheckCircle2,
} from 'lucide-react';
import { uploadFileToNotion, encodeNotionFileRef, getDisplayUrl } from '../lib/notionDB';

interface Props {
  value: string;
  onChange: (url: string) => void;
  notionDatabaseId: string;
  label?: string;
  mode?: 'image' | 'video';
  placeholder?: string;
  className?: string;
}

export default function MediaUploadInput({
  value,
  onChange,
  notionDatabaseId,
  label,
  mode = 'image',
  placeholder,
  className = '',
}: Props) {
  const [tab,     setTab]     = useState<'url' | 'file'>('url');
  const [busy,    setBusy]    = useState(false);
  const [err,     setErr]     = useState('');
  const [success, setSuccess] = useState(false);
  const fileRef               = useRef<HTMLInputElement>(null);

  const accept = mode === 'image' ? 'image/*' : 'video/mp4,video/webm,video/ogg,video/*';
  const displayUrl = getDisplayUrl(value);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    if (!notionDatabaseId) {
      setErr('notionDatabaseId no configurado — contacta al desarrollador.');
      return;
    }
    setErr('');
    setSuccess(false);
    setBusy(true);
    try {
      // Create object URL for instant local preview
      const previewUrl = URL.createObjectURL(file);
      // Upload to Notion
      const fileUploadId = await uploadFileToNotion(file, notionDatabaseId);
      // Encode as notion_file:: ref so the save step can use build.fileUpload()
      onChange(encodeNotionFileRef(fileUploadId, previewUrl));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error al subir el archivo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      )}

      {/* Tab switcher */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200 w-fit text-xs font-semibold">
        {(['url', 'file'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setErr(''); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 transition ${
              tab === t
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            {t === 'url'
              ? <Link2 className="w-3 h-3" />
              : <Upload className="w-3 h-3" />}
            {t === 'url' ? 'URL' : 'Subir archivo'}
          </button>
        ))}
      </div>

      {/* ── URL input ── */}
      {tab === 'url' && (
        <input
          className="input w-full"
          value={value.startsWith('notion_file::') ? '' : value}
          onChange={e => onChange(e.target.value)}
          placeholder={
            placeholder ??
            (mode === 'video'
              ? 'https://www.youtube.com/embed/...'
              : 'https://images.unsplash.com/...')
          }
        />
      )}

      {/* ── File upload area ── */}
      {tab === 'file' && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-5 text-center transition
            ${busy
              ? 'opacity-60 pointer-events-none border-indigo-300 bg-indigo-50/20'
              : 'cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30'}
            ${success ? 'border-green-400 bg-green-50' : !busy ? 'border-gray-200' : ''}`}
          onClick={() => !busy && fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
        >
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={e => handleFile(e.target.files?.[0])}
          />

          {busy ? (
            <div className="flex flex-col items-center gap-2 text-indigo-500">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-sm font-semibold">Subiendo a Notion…</p>
              <p className="text-xs text-indigo-400">Espera un momento</p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              <p className="text-sm font-semibold">¡Archivo guardado en Notion!</p>
              <p className="text-xs text-green-500">Se mostrará el preview local hasta el próximo sync</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {mode === 'image'
                ? <ImageIcon className="w-6 h-6 text-gray-400" />
                : <Video className="w-6 h-6 text-gray-400" />}
              <p className="text-sm text-gray-500">
                Arrastra un archivo o{' '}
                <span className="text-indigo-600 font-semibold">haz clic</span>
              </p>
              <p className="text-xs text-gray-400">
                {mode === 'image'
                  ? 'JPG, PNG, WebP, GIF — se sube a Notion'
                  : 'MP4, WebM — se sube a Notion'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {err && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {err}
        </p>
      )}

      {/* Image preview */}
      {mode === 'image' && displayUrl && (
        <div className="relative group w-full h-36 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={displayUrl}
            alt="preview"
            className="w-full h-full object-cover"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            title="Quitar imagen"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      )}

      {/* Video preview — iframe for embeds, <video> for Notion-hosted MP4s */}
      {mode === 'video' && displayUrl && (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black">
          {displayUrl.includes('youtube.com') || displayUrl.includes('youtu.be') || displayUrl.includes('vimeo.com') ? (
            <div className="aspect-video">
              <iframe
                src={displayUrl}
                className="w-full h-full"
                allowFullScreen
                title="video preview"
              />
            </div>
          ) : (
            <video
              src={displayUrl}
              controls
              className="w-full max-h-56"
            />
          )}
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition"
            title="Quitar video"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}
