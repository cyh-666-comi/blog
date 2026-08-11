export default function Footer() {
  return (
    <footer className="border-t-2 border-dashed border-warm-200 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-brown-300 text-sm mb-2">🐾 🐾 🐾</p>
        <p className="text-brown-400 text-sm font-medium">© {new Date().getFullYear()} 我们的恋爱日记</p>
        <p className="text-brown-300 text-xs mt-1">记录 cyh ♥ frz 的每一天</p>
      </div>
    </footer>
  );
}
