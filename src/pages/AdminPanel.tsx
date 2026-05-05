import { useState } from 'react';
import {
  LayoutDashboard, Calendar, BookOpen, Users, Home, HelpCircle,
  LogOut, ChevronRight, ShieldCheck, Menu, X, RefreshCw, Loader2,
} from 'lucide-react';
import { isAdminLoggedIn, adminLogout } from '../lib/adminAuth';
import { AdminDataProvider, useAdminData } from '../contexts/AdminDataContext';
import AdminLogin from './admin/AdminLogin';
import Dashboard from './admin/sections/Dashboard';
import EventsManager from './admin/sections/EventsManager';
import CoursesManager from './admin/sections/CoursesManager';
import UsersManager from './admin/sections/UsersManager';
import HomeEditor from './admin/sections/HomeEditor';
import HelpEditor from './admin/sections/HelpEditor';

type Section = 'dashboard' | 'events' | 'courses' | 'users' | 'home' | 'help';

const NAV: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'events',    label: 'Eventos',      icon: Calendar },
  { id: 'courses',   label: 'Cursos',       icon: BookOpen },
  { id: 'users',     label: 'Usuarios',     icon: Users },
  { id: 'home',      label: 'Editor Home',  icon: Home },
  { id: 'help',      label: 'Editor Help',  icon: HelpCircle },
];

/* ── Sync banner (uses context) ─────────────────────────────── */
function SyncBanner() {
  const { syncing, lastSynced, refresh } = useAdminData();
  if (!syncing && !lastSynced) return null;
  return (
    <div className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-all ${
      syncing
        ? 'bg-sky-50 text-sky-700 border-b border-sky-100'
        : 'bg-emerald-50 text-emerald-700 border-b border-emerald-100'
    }`}>
      {syncing ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          Sincronizando datos desde Notion…
        </>
      ) : (
        <>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          Conectado a Notion
          {lastSynced && (
            <span className="opacity-60 ml-1">
              · última sync {lastSynced.toLocaleTimeString('es-MX', { timeStyle: 'short' })}
            </span>
          )}
          <button
            onClick={() => refresh()}
            className="ml-auto flex items-center gap-1 hover:text-emerald-900 transition"
            title="Recargar desde Notion"
          >
            <RefreshCw className="w-3 h-3" /> Actualizar
          </button>
        </>
      )}
    </div>
  );
}

/* ── Inner panel (needs to be inside the provider) ──────────── */
function AdminPanelInner() {
  const [section, setSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function navTo(s: Section) {
    setSection(s);
    setSidebarOpen(false);
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <ShieldCheck className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <p className="text-sm font-black text-gray-900 leading-tight">Key Lab</p>
            <p className="text-[10px] text-indigo-500 font-bold tracking-wide uppercase">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => navTo(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              section === id
                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
            }`}>
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">{label}</span>
            {section === id && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-3 border-t border-gray-100">
        <button
          onClick={() => { adminLogout(); window.location.reload(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Cerrar sesión
        </button>
        <p className="text-[10px] text-gray-300 text-center mt-3">Key Lab Academy © 2026</p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex flex-1">
        {/* ── Desktop sidebar ── */}
        <aside className="hidden lg:flex w-56 bg-white border-r border-gray-100 flex-col fixed h-full z-20 shadow-sm top-0">
          <SidebarContent />
        </aside>

        {/* ── Mobile sidebar overlay ── */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-56 bg-white shadow-2xl flex flex-col z-50">
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* ── Mobile top bar ── */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(v => !v)} className="p-1.5 rounded-lg hover:bg-gray-100">
            {sidebarOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-sm font-bold text-gray-800">
              {NAV.find(n => n.id === section)?.label || 'Admin'}
            </p>
          </div>
        </div>

        {/* ── Main content ── */}
        <main className="lg:ml-56 flex-1 min-h-screen flex flex-col">
          {/* Banner lives here so it's always in the usable area (right of sidebar) */}
          <div className="-mx-0">
            <SyncBanner />
          </div>

          <div className="p-6 lg:p-8 pt-20 lg:pt-4 flex-1">
            {section === 'dashboard' && <Dashboard setSection={(s) => setSection(s as Section)} />}
            {section === 'events'    && <EventsManager />}
            {section === 'courses'   && <CoursesManager />}
            {section === 'users'     && <UsersManager />}
            {section === 'home'      && <HomeEditor />}
            {section === 'help'      && <HelpEditor />}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Root export ─────────────────────────────────────────────── */
export default function AdminPanel() {
  const [authed, setAuthed] = useState(isAdminLoggedIn());

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return (
    <AdminDataProvider>
      <AdminPanelInner />
    </AdminDataProvider>
  );
}
