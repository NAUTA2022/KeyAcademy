export default function Hero() {
  return (
    <section className="relative rounded-2xl overflow-hidden min-h-[420px] flex items-end mb-6">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-teal-600 to-purple-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-2/3 h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-10 right-0 w-80 h-80 bg-purple-400/30 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-64 h-64 bg-blue-400/20 rounded-full blur-2xl" />
        {/* Wavy abstract lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20"
          viewBox="0 0 800 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <path d="M200 100 Q400 0 600 150 T900 100" stroke="white" strokeWidth="80" fill="none" opacity="0.3" strokeLinecap="round"/>
          <path d="M100 300 Q300 200 500 350 T800 280" stroke="#7dd3fc" strokeWidth="60" fill="none" opacity="0.4" strokeLinecap="round"/>
          <path d="M0 450 Q200 350 400 480 T700 420" stroke="#c4b5fd" strokeWidth="80" fill="none" opacity="0.3" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 p-10 pb-12 max-w-2xl">
        <h1 className="text-6xl font-semibold text-white leading-tight mb-5">
          OpenAI Academy
        </h1>
        <p className="text-lg text-white/90 mb-8 leading-relaxed">
          Unlock the opportunities of the AI era by equipping yourself with the knowledge
          and skills to harness artificial intelligence effectively.
        </p>
        <button className="bg-sky-400 hover:bg-sky-500 text-white font-semibold px-7 py-3 rounded-full transition-colors text-base">
          Join Now
        </button>
      </div>
    </section>
  );
}
