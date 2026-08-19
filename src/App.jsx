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
      <footer className="bg-slate-900 border-t border-slate-800 text-center py-6 text-slate-500 mt-12">
        <p>Phase 1 Capstone Project • Data provided by RAWG API</p>
      </footer>
    </div>
  );
}