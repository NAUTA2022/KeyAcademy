import { NavLink } from 'react-router-dom';
import { Home, Calendar, BookOpen, HelpCircle, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useActiveAccount } from 'thirdweb/react';
import { useUserEmail, ADMIN_EMAIL } from '../lib/useUserEmail';

const navItems = [
  { label: 'Home', to: '/', icon: Home, end: true },
  { label: 'Eventos', to: '/events', icon: Calendar },
  { label: 'Cursos', to: '/courses', icon: BookOpen },
  { label: 'Help', to: '/help', icon: HelpCircle },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const account = useActiveAccount();
  const userEmail = useUserEmail();
  const isAdmin = account && userEmail === ADMIN_EMAIL;

  const content = (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700/60">
      {/* Mobile close button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 md:hidden">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-[10px]">KL</span>
          </div>
          <span className="text-sm font-bold text-gray-800 dark:text-gray-100">Key Lab</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500 dark:text-gray-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'text-sky-500 font-semibold bg-sky-50 dark:bg-sky-900/30 border-r-2 border-sky-500'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}

        {/* Membership CTA */}
        <div className="my-2 mx-4 border-t border-gray-100 dark:border-gray-800" />
        <NavLink
          to="/membership"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold transition-all mx-1 rounded-lg ${
              isActive
                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md'
                : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
            }`
          }
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          Membresía
        </NavLink>

        {isAdmin && (
          <>
            <div className="my-2 mx-4 border-t border-gray-100 dark:border-gray-800" />
            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-900/30 border-r-2 border-indigo-500'
                    : 'text-gray-500 dark:text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`
              }
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              Admin
            </NavLink>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-400 dark:text-gray-600">
          Powered by{' '}
          <span className="font-semibold bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
            KeyLab
          </span>
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <div className="hidden md:block fixed left-0 top-14 bottom-0 w-48 z-40">
        {content}
      </div>

      {/* Mobile sidebar — overlay drawer with animation */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${
          open ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={onClose}
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />
        {/* Drawer */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-64 shadow-2xl transition-transform duration-300 ease-out ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {content}
        </div>
      </div>
    </>
  );
}
