import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../hooks/useWeb3';
import './Home.css';

export const Home = () => {
  const { isConnected } = useWeb3();

  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1>Academic Contribution Tracker</h1>
          <p>Blockchain-based system to track and reward student contributions transparently</p>
          <div className="hero-buttons">
            {isConnected ? (
              <>
                <Link to="/dashboard" className="btn btn-primary">
                  View Dashboard
                </Link>
                <Link to="/projects" className="btn btn-secondary">
                  Explore Projects
                </Link>
              </>
            ) : (
              <p className="connect-prompt">Connect your wallet to get started</p>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Why Use Our Platform?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Transparent & Secure</h3>
            <p>All contributions are recorded on the blockchain for complete transparency</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Earn Points</h3>
            <p>Get points for your contributions and compete on leaderboards</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Fair Recognition</h3>
            <p>Every contribution is recognized with crypto-verified proof</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Progress</h3>
            <p>Monitor your contributions and see how you compare with peers</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Get Started Today</h2>
        <p>Connect your MetaMask wallet to join the academic contribution revolution</p>
        {!isConnected && <p className="wallet-required">⚠️ MetaMask wallet required</p>}
      </section>
    </div>
  );
};
