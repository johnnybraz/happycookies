import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Links from './pages/Links';
import './styles/global.css';
import FloatingButtons from './components/FloatingButtons';

function AppLayout() {
  const location = useLocation();
  const isLinksPage = location.pathname === '/links' || location.pathname === '/link';

  return (
    <>
      {!isLinksPage && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/links" element={<Links />} />
        <Route path="/link" element={<Links />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      {!isLinksPage && <FloatingButtons />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
