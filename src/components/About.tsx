import { Calendar, BookOpen, Users, MessageCircle } from 'lucide-react';
import { aboutCards } from '../data';

const iconMap: Record<string, React.ElementType> = {
  calendar: Calendar,
  'book-open': BookOpen,
  users: Users,
  'message-circle': MessageCircle,
};

export default function About() {
  return (
    <section className="bg-white rounded-2xl p-8 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">About OpenAI Academy</h2>
      <p className="text-sm text-gray-500 leading-relaxed mb-8 max-w-3xl">
        People around the world are embracing generative AI to solve complex problems and enhance
        creativity, productivity, and learning. OpenAI Academy will help them harness AI's
        transformative power through workshops, discussions, and digital content—ranging from
        foundational AI literacy to advanced integration for engineers. With a mix of online and
        in-person events, the Academy fosters a vibrant, collaborative community where participants
        of all backgrounds can gain actionable insights and drive innovation in their fields.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {aboutCards.map((card) => {
          const Icon = iconMap[card.icon];
          return (
            <div
              key={card.title}
              className="border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow"
            >
              <div className="bg-sky-50 rounded-lg w-9 h-9 flex items-center justify-center mb-3">
                {Icon && <Icon className="w-4.5 h-4.5 text-sky-500" />}
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">{card.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{card.description}</p>
            </div>
          );
        })}
      </div>

      <button className="bg-sky-400 hover:bg-sky-500 text-white font-semibold px-6 py-2.5 rounded-full transition-colors text-sm">
        Join Community
      </button>
    </section>
  );
}
