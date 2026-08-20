import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import GameDetail from './pages/GameDetail';
import Backlog from './pages/Backlog';

export default function App() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/game/:id" element={<GameDetail />} />
          <Route path="/backlog" element={<Backlog />} />
        </Routes>
      </div>
      <footer className="border-t border-light-border dark:border-dark-border text-center py-8 text-slate-500 dark:text-slate-400 font-medium mt-12 bg-light-card/50 dark:bg-dark-bg/80 backdrop-blur-md transition-colors duration-500">
        <p>&copy; {currentYear} GameVault. All rights reserved.</p>
      </footer>
    </div>
  );
}