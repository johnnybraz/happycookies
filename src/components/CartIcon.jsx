import React from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import './CartIcon.css';

const CartIcon = () => {
  const totalItems = useCartStore(state => state.getTotalItems());
  
  return (
    <Link to="/checkout" className="cart-icon">
      <FontAwesomeIcon icon={faShoppingCart} />
      {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
    </Link>
  );
};

export default CartIcon;