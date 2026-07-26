import React, { useState } from 'react';
import useCartStore from '../store/cartStore';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = () => {
    // Garantir que a conversão de preço seja feita corretamente
    const numericPrice = product.price.replace(/\./g, '').replace(',', '.');
    
    addItem({
      id: product.id,
      name: product.name,
      description: product.description,
      price: numericPrice,
      image: product.image
    }, quantity);
    setQuantity(1);
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  const isAvailable = product.available !== false;

  return (
    <div className={`product-item ${!isAvailable ? 'product-item-esgotado' : ''}`}>
      <div className="product-img">
        <img src={product.image} alt={product.name} />
        {!isAvailable && <span className="product-esgotado-badge">Esgotado</span>}
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-price">
          <span className="price">R$ {product.price}</span>
          <span className="unit">unidade</span>
        </div>
        {isAvailable ? (
          <>
            <div className="quantity-controls">
              <button className="quantity-btn" onClick={decreaseQuantity}>-</button>
              <span className="quantity">{quantity}</span>
              <button className="quantity-btn" onClick={increaseQuantity}>+</button>
            </div>
            <button className="cart-btn" onClick={handleAddToCart}>
              Adicionar ao Carrinho
            </button>
          </>
        ) : (
          <button className="cart-btn" disabled>
            Esgotado
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;