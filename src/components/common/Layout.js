import React from 'react';
import Header from './Header';
import Footer from './Footer';
import WalletConnection from './WalletConnection';

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <WalletConnection />
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;

