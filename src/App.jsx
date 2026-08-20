import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import GameDetail from './pages/GameDetail';
import Backlog from './pages/Backlog';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/game/:id" element={<GameDetail />} />
          <Route path="/backlog" element={<Backlog />} />
        </Routes>
      </div>
      <footer className="border-t border-slate-200 dark:border-slate-800 text-center py-8 text-slate-500 font-medium mt-12 bg-white dark:bg-slate-900/50 transition-colors duration-300">
        <p>Phase 1 Capstone Project • Powered by RAWG API</p>
      </footer>
    </div>
  );
}