import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="app-header">
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/ico">ICO</Link></li>
          <li><Link to="/token">Token</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;

