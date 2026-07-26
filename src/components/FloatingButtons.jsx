import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import './FloatingButtons.css';

const FloatingButtons = () => {
  return (
    <div className="floating-buttons">
      <a 
        href="https://wa.link/7cry8l" 
        target="_blank" 
        rel="noopener noreferrer"
        className="floating-btn whatsapp-btn"
        aria-label="Contato pelo WhatsApp"
      >
        <FontAwesomeIcon icon={faWhatsapp} />
      </a>
      <a 
        href="https://www.ifood.com.br/delivery/ourinhos-sp/happy-cookies-jardim-alvorada/1709644f-67a5-4bae-b5f4-4215126ad823" 
        target="_blank" 
        rel="noopener noreferrer"
        className="floating-btn ifood-btn"
        aria-label="Pedir pelo iFood"
      >
        <img src="/images/ifood-icon.png" alt="iFood" width="30" height="30" />
      </a>
    </div>
  );
};

export default FloatingButtons;