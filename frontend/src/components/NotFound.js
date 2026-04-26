import React from 'react';
import './NotFound.css';

export const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
        <a href="/" className="btn-home">
          Return to Home
        </a>
      </div>
    </div>
  );
};
