import { Play, FileText, Eye } from 'lucide-react';
import { contentItems } from '../data';

export default function ContentSection() {
  return (
    <section id="content" className="bg-white rounded-2xl p-8 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Content</h2>
        <a href="#" className="text-sm text-sky-500 hover:text-sky-600 font-medium">
          See All Content →
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {contentItems.map((item) => (
          <div
            key={item.id}
            className="rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="relative bg-gray-200 h-40 overflow-hidden">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {item.type === 'video' && (
                <>
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-4 h-4 text-gray-800 ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 text-xs font-mono bg-black/60 text-white px-1.5 py-0.5 rounded">
                    {item.duration}
                  </span>
                </>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                  item.type === 'video'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-amber-50 text-amber-600'
                }`}>
                  {item.type === 'video'
                    ? <><Play className="w-3 h-3" /> video</>
                    : <><FileText className="w-3 h-3" /> Resource</>
                  }
                </span>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{item.title}</h4>
              {item.description && (
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{item.date}</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {item.views.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
