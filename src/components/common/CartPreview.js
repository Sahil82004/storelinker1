import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/priceFormatter';
import './CartPreview.css';

const CartPreview = ({ show, onClose }) => {
    const { cartItems, removeFromCart, getCartTotal } = useCart();
    const navigate = useNavigate();

    if (!show) return null;

    const handleViewCart = () => {
        onClose();
        navigate('/cart');
    };

    return (
        <div className="cart-preview">
            <div className="cart-preview-header">
                <h3>Cart ({cartItems.length} items)</h3>
                <button className="close-button" onClick={onClose}>&times;</button>
            </div>
            <div className="cart-preview-items">
                {cartItems.map(item => (
                    <div key={item.id} className="cart-preview-item">
                        <img src={item.image} alt={item.title} />
                        <div className="item-details">
                            <h4>{item.title}</h4>
                            <div className="item-price">
                                <span className="current-price">{formatPrice(item.currentPrice)}</span>
                                <span className="quantity">x {item.quantity}</span>
                            </div>
                        </div>
                        <button 
                            className="remove-button"
                            onClick={() => removeFromCart(item.id)}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            <div className="cart-preview-footer">
                <div className="total">
                    <span>Total:</span>
                    <span>{formatPrice(getCartTotal())}</span>
                </div>
                <button className="view-cart-button" onClick={handleViewCart}>
                    View Cart
                </button>
            </div>
        </div>
    );
};

export default CartPreview; 