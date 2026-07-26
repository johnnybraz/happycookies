import React, { useState } from 'react';
import { FaBars, FaTimes, FaShoppingCart } from 'react-icons/fa';
import ContactModal from './ContactModal';
import CheckoutModal from './CheckoutModal';
import useCartStore from '../store/cartStore';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const cartItems = useCartStore(state => state.items);
  
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const openContactModal = (e) => {
    e.preventDefault();
    setIsContactModalOpen(true);
    setIsMenuOpen(false);
  };
  
  const openCheckoutModal = (e) => {
    e.preventDefault();
    setIsCheckoutModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <a href="/" onClick={closeMenu}>
            <img src="/images/logo.png" alt="Happy Cookies" className="imgLogo" />
          </a>
        </div>
        
        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        <nav className={`main-nav ${isMenuOpen ? 'active' : ''}`}>
          <ul>
            <li><a href="#home" onClick={() => setIsMenuOpen(false)}>Home</a></li>
            <li><a href="#nossos-cookies" onClick={() => setIsMenuOpen(false)}>Produtos</a></li>
            <li><a href="#sobre" onClick={() => setIsMenuOpen(false)}>Sobre</a></li>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <li><a href="#" onClick={openContactModal}>Fale Conosco</a></li>
          </ul>
        </nav>
        
        <div className="cart-icon">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a href="#" onClick={openCheckoutModal}>
            <FaShoppingCart />
            {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
          </a>
        </div>
      </div>
      
      {/* Overlay para fechar o menu ao clicar fora */}
      {isMenuOpen && (
        <div 
          className="menu-overlay" 
          onClick={closeMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 99
          }}
        />
      )}
      
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
      
      <CheckoutModal 
        isOpen={isCheckoutModalOpen} 
        onClose={() => setIsCheckoutModalOpen(false)} 
      />
    </header>
  );
};

export default Header;