import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>Campus Shop Assistant</h1>
        </div>
        <nav className="header-nav">
          <Link to="/" className="nav-link">Home</Link>
        </nav>
        <div className="header-actions">
          <Link to="/login" className="btn-primary">Login</Link>
          <Link to="/signup" className="btn-primary">Sign Up</Link>
        </div>
      </div>
    </header>
  );
}

export default Header;