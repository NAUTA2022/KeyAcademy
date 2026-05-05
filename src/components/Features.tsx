import { features } from '../data';

export default function Features() {
  return (
    <section className="bg-white rounded-2xl p-8 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className={`${i < features.length - 1 ? 'md:border-r md:border-gray-200 md:pr-8' : ''}`}>
            <h3 className="font-semibold text-gray-900 text-base mb-3">{f.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
