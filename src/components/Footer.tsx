export default function Footer() {
  return (
    <footer className="bg-white rounded-2xl p-10 mb-6 text-center">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Join OpenAI Academy today.
      </h2>
      <button className="bg-sky-400 hover:bg-sky-500 text-white font-semibold px-8 py-3 rounded-full transition-colors text-base mb-10">
        Join Now
      </button>

      <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
        <a href="#" className="hover:text-gray-600 transition-colors">Terms of Service</a>
        <span>·</span>
        <a href="#" className="hover:text-gray-600 transition-colors">Privacy Policy</a>
        <span>·</span>
        <a href="#" className="hover:text-gray-600 transition-colors">Code of Conduct</a>
      </div>
    </footer>
  );
}
