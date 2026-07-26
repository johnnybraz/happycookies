import React from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';

const CheckoutPage = () => {
  const items = useCartStore(state => state.items);
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const clearCart = useCartStore(state => state.clearCart);
  const getTotalPrice = useCartStore(state => state.getTotalPrice);
  
  const handleQuantityChange = (id, newQuantity) => {
    updateQuantity(id, parseInt(newQuantity));
  };
  
  const handleRemoveItem = (id) => {
    if (window.confirm('Tem certeza que deseja remover este item?')) {
      removeItem(id);
    }
  };
  
  const handleCheckout = () => {
    alert('Pedido realizado com sucesso! Em breve entraremos em contato.');
    clearCart();
  };
  
  if (items.length === 0) {
    return (
      <div className="checkout-page empty-cart">
        <div className="container">
          <h2>Seu carrinho está vazio</h2>
          <p>Volte para a página inicial e adicione alguns produtos deliciosos!</p>
          <Link to="/" className="btn btn-primary">Voltar para a loja</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="checkout-page">
      <div className="container">
        <h2>Seu Carrinho</h2>
        
        <div className="cart-items">
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="item-details">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </div>
              <div className="item-price">
                <span>R$ {item.price}</span>
              </div>
              <div className="item-quantity">
                <input 
                  type="number" 
                  min="1" 
                  value={item.quantity} 
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                />
              </div>
              <div className="item-total">
                <span>R$ {(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
              </div>
              <div className="item-remove">
                <button onClick={() => handleRemoveItem(item.id)}>Remover</button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="cart-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>R$ {getTotalPrice().toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Frete:</span>
            <span>Grátis</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>R$ {getTotalPrice().toFixed(2)}</span>
          </div>
          
          <button className="checkout-btn btn" onClick={handleCheckout}>
            Finalizar Compra
          </button>
          
          <Link to="/" className="continue-shopping">
            Continuar Comprando
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;