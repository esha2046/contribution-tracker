import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Dashboard } from './components/Dashboard';
import { Projects } from './components/Projects';
import { NotFound } from './components/NotFound';
import './App.css';

function App() {
  return (
    <Web3Provider>
      <Router>
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Router>
    </Web3Provider>
  );
}

export default App;
