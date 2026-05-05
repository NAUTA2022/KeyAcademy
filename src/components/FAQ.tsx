import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqs } from '../data';

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-white rounded-2xl p-8 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>

      <div className="divide-y divide-gray-100">
        {faqs.map((faq, i) => (
          <div key={i}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between py-4 text-left gap-4 group"
            >
              <span className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                {faq.q}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                  open === i ? 'rotate-180' : ''
                }`}
              />
            </button>
            {open === i && (
              <div className="pb-4 pr-8">
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
