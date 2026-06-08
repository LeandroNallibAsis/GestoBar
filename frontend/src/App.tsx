import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import SalonEditor from './pages/SalonEditor';

const Home = () => (
  <section className="rounded-2xl border border-[#A3B31A]/20 bg-[#24303A] p-8 shadow-glow">
    <h1 className="text-3xl font-semibold text-[#A3B31A]">GestoBar</h1>
    <p className="mt-3 max-w-2xl text-slate-300">
      Frontend scaffold for the GestoBar dashboard with the salon editor module ready.
    </p>
  </section>
);

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#2F3D46] text-white">
        <main className="mx-auto max-w-7xl p-6">
          <nav className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-[#A3B31A]/20 bg-[#24303A] p-4 shadow-glow">
            <Link className="rounded-2xl bg-[#39FF8B]/10 px-4 py-2 font-semibold text-[#39FF8B] transition hover:bg-[#39FF8B]/20" to="/">
              Home
            </Link>
            <Link className="rounded-2xl bg-[#39FF8B]/10 px-4 py-2 font-semibold text-[#39FF8B] transition hover:bg-[#39FF8B]/20" to="/salon-editor">
              Salon Editor
            </Link>
          </nav>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/salon-editor" element={<SalonEditor />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
