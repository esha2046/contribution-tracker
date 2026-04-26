import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../hooks/useWeb3';
import './Header.css';

export const Header = () => {
  const { account, connectWallet, disconnectWallet, isConnected, isConnecting } = useWeb3();

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          📚 Contribution Tracker
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/projects">Projects</Link>
        </nav>

        <div className="wallet-section">
          {isConnected && account ? (
            <div className="wallet-connected">
              <span className="wallet-address">{formatAddress(account)}</span>
              <button className="btn-disconnect" onClick={disconnectWallet}>
                Disconnect
              </button>
            </div>
          ) : (
            <button
              className="btn-connect"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
