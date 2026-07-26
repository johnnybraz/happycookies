import React from 'react';
import { FaCookieBite, FaShoppingCart, FaWhatsapp, FaMotorcycle } from 'react-icons/fa';
import './HowToOrderSection.css';

const HowToOrderSection = () => {
  return (
    <section className="how-to-order">
      <div className="container">
        <h2 className="how-to-order-title">
          <span className="secondary-color">Como </span>
          <span className="primary-color">Pedir</span>
        </h2>
        <p className="how-to-order-subtitle" style={{fontWeight:"600"}}>
          É fácil e rápido receber nossos cookies onde você quiser.
        </p>

        <div className="order-steps">
          <div className="order-step-card">
            <div className="order-step-icon">
              <FaCookieBite />
            </div>
            <h3 className="order-step-title">Escolha seus cookies</h3>
            <p className="order-step-text">
              Navegue pelo nosso cardápio e escolha seus sabores favoritos.
            </p>
          </div>

          <div className="order-step-card">
            <div className="order-step-icon">
              <FaShoppingCart />
            </div>
            <h3 className="order-step-title">Adicione ao carrinho</h3>
            <p className="order-step-text">
              Selecione a quantidade e adicione os produtos ao seu carrinho de compras.
            </p>
          </div>

          <div className="order-step-card">
            <div className="order-step-icon">
              <FaWhatsapp />
            </div>
            <h3 className="order-step-title">Entre em contato</h3>
            <p className="order-step-text">
              Clique no botão de finalizar a compra e você irá para nosso WhatsApp para finalizar seu pedido.
            </p>
          </div>

          <div className="order-step-card">
            <div className="order-step-icon">
              <FaMotorcycle />
            </div>
            <h3 className="order-step-title">Receba onde quiser</h3>
            <p className="order-step-text">
              Não importa onde você esteja em Ourinhos, levamos nossos cookies até você com todo carinho.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToOrderSection;