import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faWhatsapp, faFacebook, faTiktok } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="footer">
      
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/images/logo-footer.png" alt="Happy Cookies Logo" style={{ maxWidth: '80px', height: 'auto' }} />
              <h2>Happy Cookies</h2>
            </div>
            <p style={{fontWeight:"700"}}>Porque Felicidade tem sabor de cookie!</p>
          </div>
          <div className="footer-social">
            <h3>Siga-nos</h3>
            <div className="social-icons">
              <a href="https://www.instagram.com/happy.cookie.s/" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
              <a href="https://wa.link/7cry8l" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faWhatsapp} />
              </a>
              <a href="https://www.facebook.com/profile.php?id=61571614631970" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faFacebook} />
              </a>
              <a href="https://www.tiktok.com/@happy_cookiies" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faTiktok} />
              </a>
            </div>
          </div>
          <div className="footer-contact">
          
            <h3>Contato</h3>
            <p> <FontAwesomeIcon icon={faWhatsapp} /> WhatsApp: (14) 99868-4409</p>
            <p><FontAwesomeIcon icon={faEnvelope} /> Email: atendimento.happycookies@gmail.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Happy Cookies. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;