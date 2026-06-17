import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Speedrunning from './pages/Speedrunning';
import Deathless from './pages/Deathless';
import Challenges from './pages/Challenges';
import NotFound from './pages/NotFound';
import { Navigate } from 'react-router-dom';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/speedrunning" element={<Speedrunning />} />
        <Route path="/deathless" element={<Deathless />} />
        <Route path="/deathless/top-challenges" element={<Challenges />} />
        <Route path="/challenges" element={<Navigate to="/deathless/top-challenges" replace />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
