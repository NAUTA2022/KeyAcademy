import { communities } from '../data';

export default function Communities() {
  return (
    <section id="communities" className="bg-white rounded-2xl p-8 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Communities</h2>
        <a href="#" className="text-sm text-sky-500 hover:text-sky-600 font-medium">
          See All Communities →
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {communities.map((c) => (
          <div
            key={c.id}
            className="rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer"
          >
            {/* Banner */}
            <div className={`h-16 bg-gradient-to-br ${c.color}`} />

            {/* Info */}
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">{c.name}</h4>
              <p className="text-xs text-gray-400 mb-3">
                {c.members.toLocaleString()} members · {c.events} events
              </p>
              <button className="text-xs font-medium text-sky-500 border border-sky-200 rounded-full px-3 py-1 hover:bg-sky-50 transition-colors w-full">
                Go to community
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
