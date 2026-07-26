import React, { useState } from 'react';
import useCartStore from '../store/cartStore';
import CheckoutModal from './CheckoutModal';

const CookieCard = ({ cookie }) => {
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const addItem = useCartStore(state => state.addItem);
  
  const handleAddToCart = () => {
    addItem({
      id: cookie.id,
      name: cookie.name,
      price: cookie.price,
      image: cookie.image,
      description: cookie.description,
      quantity: 1
    });
    
    setIsCheckoutModalOpen(true);
  };
  
  return (
    <>
      <div className="cookie-card">
        <div className="cookie-image">
          <img src={cookie.image} alt={cookie.name} />
        </div>
        <div className="cookie-info">
          <h3>{cookie.name}</h3>
          <p>{cookie.description}</p>
          <div className="cookie-price">R$ {cookie.price}</div>
          <button className="btn btn-primary" onClick={handleAddToCart}>
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
      
      <CheckoutModal 
        isOpen={isCheckoutModalOpen} 
        onClose={() => setIsCheckoutModalOpen(false)} 
      />
    </>
  );
};

export default CookieCard;