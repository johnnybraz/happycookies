import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { SiIfood } from 'react-icons/si';
import './ReadyToOrderSection.css';

const ReadyToOrderSection = () => {
  return (
    <>
      <section className="ready-to-order">
        <div className="container">
          <h2 className="ready-to-order-title">Pronto para experimentar?</h2>
          <p className="ready-to-order-subtitle">
            Faça seu pedido agora mesmo e receba cookies quentinhos em casa!
          </p>
          
          <div className="order-buttons">
            <a 
              href="https://wa.link/7cry8l" 
              className="order-button whatsapp-button"
              target="_blank" 
              rel="noopener noreferrer"
            >
              <FaWhatsapp className="button-icon" />
              Pedir pelo WhatsApp
            </a>
            
            <a 
              href="https://www.ifood.com.br/delivery/ourinhos-sp/happy-cookies-jardim-alvorada/1709644f-67a5-4bae-b5f4-4215126ad823" 
              className="order-button ifood-button"
              target="_blank" 
              rel="noopener noreferrer"
            >
              <SiIfood className="button-icon" />
              Pedir pelo iFood
            </a>
          </div>
        </div>
      </section>
      <div className="section-spacer"></div>
    </>
  );
};

export default ReadyToOrderSection;