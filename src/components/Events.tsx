import { Calendar } from 'lucide-react';
import { events } from '../data';

export default function Events() {
  return (
    <section id="events" className="bg-white rounded-2xl p-8 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Events</h2>
        <a href="#" className="text-sm text-sky-500 hover:text-sky-600 font-medium">
          See All Events →
        </a>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
          >
            <div className="bg-sky-50 rounded-lg p-2.5 shrink-0">
              <Calendar className="w-5 h-5 text-sky-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                  {event.badge}
                </span>
                <span className="text-xs text-gray-400">{event.time}</span>
              </div>
              <p className="text-sm font-medium text-gray-800 truncate">{event.title}</p>
            </div>
            <button className="shrink-0 text-xs font-semibold text-sky-500 border border-sky-300 rounded-full px-3 py-1 hover:bg-sky-50 transition-colors">
              Learn More
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
