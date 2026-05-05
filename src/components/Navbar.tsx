import { useState } from 'react';
import { Search, Menu, Sun, Moon } from 'lucide-react';
import { ConnectButton } from 'thirdweb/react';
import { client, wallets } from '../lib/thirdweb';
import { Link } from 'react-router-dom';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const [dark, setDark] = useState<boolean>(
    () => document.documentElement.classList.contains('dark')
  );

  function toggleDark() {
    const next = !dark;
    const root = document.documentElement;
    if (next) {
      root.classList.add('dark');
      localStorage.setItem('kl_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('kl_theme', 'light');
    }
    setDark(next);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center h-14 px-3 sm:px-5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700/60 gap-2 sm:gap-3">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-600 dark:text-gray-300 shrink-0"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 shrink-0 select-none">
        <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
          <span className="text-white font-black text-xs tracking-tight">KL</span>
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-base tracking-tight hidden sm:block">Key Lab</span>
      </Link>

      {/* Search — hidden on mobile */}
      <div className="relative flex-1 max-w-sm hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Buscar..."
          className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:placeholder:text-gray-500 w-full focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
        />
      </div>

      <div className="flex-1" />

      {/* Dark mode toggle */}
      <button
        onClick={toggleDark}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition text-gray-500 dark:text-gray-400 shrink-0"
        aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        title={dark ? 'Modo claro' : 'Modo oscuro'}
      >
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* ThirdWeb ConnectButton */}
      <ConnectButton
        client={client}
        wallets={wallets}
        connectButton={{
          label: 'Iniciar sesión',
          style: {
            background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
            color: 'white',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            padding: '6px 14px',
            border: 'none',
            cursor: 'pointer',
          },
        }}
        detailsButton={{
          style: { borderRadius: '8px', fontSize: '13px' },
        }}
        locale="es_ES"
      />
    </header>
  );
}
