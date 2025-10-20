// frontend/src/admin/AdminHeader.jsx
export default function AdminHeader() {
  return (
    <header className="w-full bg-gradient-to-r from-sky-500 to-blue-700 text-white">
      <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
        {/* Brand */}
        <div className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Campus Shop Assistant
        </div>

        {/* Link giữa (chỉ minh hoạ) */}
        <nav className="hidden md:block">
          <a
            href="#"
            className="px-4 py-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10"
          >
            Home
          </a>
        </nav>

        {/* Nút phải (minh hoạ) */}
        <div className="flex gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded-xl border border-white/30 bg-transparent text-white hover:bg-white/10"
          >
            Login
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-white text-blue-700 hover:bg-gray-100"
          >
            Sign Up
          </button>
        </div>
      </div>
    </header>
  );
}
