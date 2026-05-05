import { Mail, MessageCircle, BookOpen, ExternalLink } from 'lucide-react';
import { getHelp } from '../lib/contentStore';

export default function Help() {
  const { faqs } = getHelp();
  return (
    <div className="max-w-3xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">Centro de ayuda</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Encuentra respuestas rápidas o contáctanos directamente</p>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
        {[
          { icon: Mail, title: 'Email', desc: 'hola@keylab.academy', link: 'mailto:hola@keylab.academy', color: 'from-sky-400 to-blue-500' },
          { icon: MessageCircle, title: 'Telegram', desc: '@keylabacademy', link: 'https://t.me/keylabacademy', color: 'from-cyan-400 to-sky-500' },
          { icon: BookOpen, title: 'Docs', desc: 'docs.keylab.academy', link: '#', color: 'from-indigo-400 to-violet-500' },
        ].map(({ icon: Icon, title, desc, link, color }) => (
          <a key={title} href={link} target={link.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
            className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 hover:shadow-md transition group flex flex-col items-start gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm group-hover:text-sky-600 dark:group-hover:text-sky-400 transition flex items-center gap-1">
                {title} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
            </div>
          </a>
        ))}
      </div>

      {/* FAQ */}
      <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-4">Preguntas frecuentes</h2>
      <div className="space-y-3">
        {faqs.map((faq) => (
          <details key={faq.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl group">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-gray-800 dark:text-gray-100 list-none select-none hover:text-sky-600 dark:hover:text-sky-400 transition">
              {faq.q}
              <span className="ml-2 text-gray-400 dark:text-gray-500 group-open:rotate-90 transition-transform inline-block shrink-0">›</span>
            </summary>
            <div className="px-5 pb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
