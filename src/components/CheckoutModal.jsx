import React, { useState, useRef } from 'react';
import { FaTimes, FaPlus, FaMinus, FaDownload, FaWhatsapp, FaExclamationTriangle} from 'react-icons/fa';
import useCartStore from '../store/cartStore';
import './CheckoutModal.css';
import html2canvas from 'html2canvas';

const STORE_WHATSAPP = '5514998684409';

const CheckoutModal = ({ isOpen, onClose }) => {
  const items = useCartStore(state => state.items);
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const getTotalPrice = useCartStore(state => state.getTotalPrice);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [address, setAddress] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'Ourinhos',
    state: 'SP',
    fullName: '' // Adicionando campo para nome completo
  });
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [cepError, setCepError] = useState('');
  const [showReceiptImage, setShowReceiptImage] = useState(false);
  const receiptRef = useRef(null);

  // Frete calculado por distância (Netlify Function + Google Maps).
  // status: 'idle' | 'loading' | 'known' | 'unknown'
  const [feeStatus, setFeeStatus] = useState('idle');
  const [deliveryFee, setDeliveryFee] = useState(null);

  const isDeliveryFeeKnown = feeStatus === 'known' && deliveryFee !== null;
  const isCalculatingFee = feeStatus === 'loading';
  const orderTotal = getTotalPrice() + (deliveryFee || 0);

  // Pede a localização real do navegador/celular do cliente. É mais precisa
  // que adivinhar pelo endereço digitado. Se o cliente não tiver GPS ou negar
  // a permissão, resolve(null) e caímos no cálculo por endereço.
  const getBrowserLocation = () => {
    return new Promise(resolve => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        position => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => resolve(null),
        { timeout: 8000, maximumAge: 5 * 60 * 1000 }
      );
    });
  };

  const calculateDeliveryFee = async () => {
    setFeeStatus('loading');
    try {
      const location = await getBrowserLocation();

      const response = await fetch('/.netlify/functions/delivery-fee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          street: address.street,
          city: address.city,
          state: address.state,
          ...(location ? { lat: location.lat, lng: location.lng } : {})
        })
      });

      const data = await response.json();

      if (typeof data.fee === 'number') {
        setDeliveryFee(data.fee);
        setFeeStatus('known');
      } else {
        setDeliveryFee(null);
        setFeeStatus('unknown');
      }
    } catch (error) {
      setDeliveryFee(null);
      setFeeStatus('unknown');
    }
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
    }
  };
  
  const handleRemoveItem = (id) => {
    if (window.confirm('Tem certeza que deseja remover este item?')) {
      removeItem(id);
    }
  };
  
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const searchAddressByCep = async () => {
    const cepDigits = address.cep.replace(/\D/g, '');

    if (cepDigits.length !== 8) {
      setCepError('CEP inválido. Digite os 8 números do CEP, com ou sem traço.');
      return;
    }

    setIsSearchingCep(true);
    setCepError('');

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        setCepError('CEP não encontrado.');
        return;
      }

      setAddress(prev => ({
        ...prev,
        street: data.logradouro,
        neighborhood: data.bairro || '',
        city: data.localidade,
        state: data.uf
      }));
    } catch (error) {
      setCepError('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setIsSearchingCep(false);
    }
  };
  
  const handleSaveAddress = () => {
    // Validar se os campos obrigatórios estão preenchidos
    if (!address.fullName || !address.street || !address.number || !address.neighborhood) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setShowAddressModal(false);
    calculateDeliveryFee();
  };

  const handleDeleteAddress = () => {
    if (window.confirm('Tem certeza que deseja remover este endereço?')) {
      setAddress({
        cep: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: 'Ourinhos',
        state: 'SP',
        fullName: ''
      });
      setFeeStatus('idle');
      setDeliveryFee(null);
    }
  };
  
  const formatCurrency = (value) => {
    return parseFloat(value).toFixed(2).replace('.', ',');
  };
  
  const getCurrentDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };
  
  const generateOrderNumber = () => {
    return Math.floor(Math.random() * 100) + 1;
  };
  
  const handleGenerateReceipt = () => {
    setShowReceiptImage(true);
  };

  const buildOrderMessage = () => {
    const lines = ['*Pedido Happy Cookies*', ''];

    items.forEach((item, index) => {
      const qtyPart = item.quantity > 1 ? ` (${item.quantity}x)` : '';
      lines.push(`${index + 1}. ${item.name}${qtyPart} - R$ ${formatCurrency(parseFloat(item.price) * item.quantity)}`);
    });

    lines.push('', `Subtotal: R$ ${formatCurrency(getTotalPrice())}`);

    if (isDeliveryFeeKnown) {
      lines.push(`Entrega: R$ ${formatCurrency(deliveryFee)}`);
      lines.push(`Total: R$ ${formatCurrency(orderTotal)}`);
    } else {
      lines.push('Entrega: a combinar');
    }

    lines.push('', '*Entrega no endereço:*');
    if (address.fullName) lines.push(address.fullName);
    lines.push(`${address.street}, ${address.number}${address.complement ? ' - ' + address.complement : ''}`);
    lines.push(address.neighborhood);
    lines.push(`${address.city}/${address.state}`);

    return lines.join('\n');
  };
  
  const handleDownloadReceipt = () => {
    if (receiptRef.current) {
      html2canvas(receiptRef.current, {
        backgroundColor: '#fff',
        scale: 2
      }).then(canvas => {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `pedido-happy-cookies-${generateOrderNumber()}.png`;
        link.click();
      });
    }
  };
  
  const handleShareWhatsApp = () => {
    const message = buildOrderMessage();
    const whatsappUrl = `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`;

    if (!receiptRef.current) {
      window.open(whatsappUrl, '_blank');
      return;
    }

    html2canvas(receiptRef.current, {
      backgroundColor: '#fff',
      scale: 2
    }).then(canvas => {
      const image = canvas.toDataURL('image/png');

      fetch(image)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "pedido-happy-cookies.png", { type: "image/png" });

          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
              files: [file],
              title: 'Meu pedido Happy Cookies',
              text: message
            }).catch(error => {
              console.log('Erro ao compartilhar:', error);
              window.open(whatsappUrl, '_blank');
            });
          } else {
            // Computador/navegadores sem suporte a compartilhar arquivo: abre o WhatsApp
            // já com o número da loja e o pedido completo preenchido.
            window.open(whatsappUrl, '_blank');
          }
        });
    });
  };
  
  const handleCheckout = () => {
    handleGenerateReceipt();
  };
  
  if (!isOpen) return null;
  
  return (
    // Dentro do componente, adicione uma classe para controle de responsividade
    <div className="checkout-modal-overlay">
      <div className="checkout-modal-container responsive">
        <button className="modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        
        <h2>Seu Carrinho</h2>
        
        {items.length === 0 ? (
          <div className="empty-cart">
            <p>Seu carrinho está vazio</p>
            <p>Adicione alguns produtos deliciosos!</p>
            <button className="btn btn-primary" onClick={onClose}>Voltar para o início.</button>
          </div>
        ) : showReceiptImage ? (
          <div className="receipt-container">
            <div className="receipt" ref={receiptRef}>
              <div className="receipt-header">
                <h3>*** NÃO É DOCUMENTO FISCAL ***</h3>
                <p>ABERTO EM {getCurrentDate()}</p>
                {address.fullName && <p>Cliente: {address.fullName}</p>}
              </div>
              
              <div className="receipt-items">
                <div className="receipt-item-header">
                  <span>ITEM (V.Unit)</span>
                  <span>Total</span>
                </div>
                
                {items.map((item) => (
                  <div key={item.id} className="receipt-item">
                    <div className="receipt-item-details">
                      <span>{item.name} {item.quantity > 1 ? `(${item.quantity}x)` : ''} (R$ {formatCurrency(item.price)})</span>
                      <span style={{fontWeight: '900'}}>R$ {formatCurrency(parseFloat(item.price) * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="receipt-total">
                <div className="receipt-total-line">
                  <span>Subtotal:</span>
                  <span>R$ {formatCurrency(getTotalPrice())}</span>
                </div>
                
                {isDeliveryFeeKnown ? (
                  <>
                    <div className="receipt-total-line">
                      <span>Entrega:</span>
                      <span>R$ {formatCurrency(deliveryFee)}</span>
                    </div>
                    <div className="receipt-total-line">
                      <span>Total:</span>
                      <span>R$ {formatCurrency(orderTotal)}</span>
                    </div>
                  </>
                ) : (
                  <div className="receipt-delivery-message">
                    <p style={{ color: 'red', fontWeight: 'bold', margin: '10px 0' }}>
                        ENTREGA A COMBINAR
                    </p>
                  </div>
                )}
              </div>
              
              <div className="receipt-footer">
                <p className="receipt-adress">Entrega no endereço:</p>
                <p>{address.street}, {address.number}</p>
                {address.complement && <p>{address.complement}</p>}
                <p>{address.neighborhood}</p>
                <p>{address.city}/{address.state}</p>
               <p style={{fontWeight:"700", color:"red"}}><span style={{color:"#FAB005"}}><FaExclamationTriangle /></span>  ATENÇÃO FINALIZE SEU PEDIDO PELO WHATSAPP!</p>
                <p>Obrigado pela Preferência!</p>
                <p>Volte Sempre!</p>
                
              </div>
            </div>
            
            <div className="receipt-actions">
              <button className="btn btn-primary" onClick={handleDownloadReceipt}>
                <FaDownload /> Baixar Recibo
              </button>
              <button className="btn btn-whatsapp" onClick={handleShareWhatsApp}>
                <FaWhatsapp /> Finalizar o pedido no WhatsApp
              </button>
              <button className="btn btn-secondary" onClick={() => setShowReceiptImage(false)}>
                Voltar ao Carrinho
              </button>
            </div>
          </div>
        ) : (
          <>
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
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <FaMinus />
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button 
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <FaPlus />
                      </button>
                    </div>
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
            
            <div className="delivery-options">
              <h3>Endereço de entrega:</h3>
              <div className="delivery-address-summary">
                {address.street ? (
                  <>
                    {address.fullName && <p><strong>Nome:</strong> {address.fullName}</p>}
                    <p><strong>Endereço:</strong> {address.street}, {address.number}</p>
                    {address.complement && <p><strong>Complemento:</strong> {address.complement}</p>}
                    <p><strong>Bairro:</strong> {address.neighborhood}</p>
                    <p><strong>Cidade/UF:</strong> {address.city}/{address.state}</p>
                    <p>
                      <strong>Entrega:</strong>{' '}
                      {isCalculatingFee
                        ? 'Calculando...'
                        : isDeliveryFeeKnown
                          ? `R$ ${formatCurrency(deliveryFee)}`
                          : 'A combinar (finalize pelo WhatsApp)'}
                    </p>
                    <div className="address-buttons">
                      <button className="edit-address-btn" onClick={() => setShowAddressModal(true)}>
                        Editar endereço
                      </button>
                      <button className="delete-address-btn" onClick={handleDeleteAddress}>
                     Excluir endereço
                      </button>
                    </div>
                  </>
                ) : (
                  <button className="checkout-btn" onClick={() => setShowAddressModal(true)}>
                    Adicionar endereço de entrega
                  </button>
                )}
              </div>
            </div>
            
            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>R$ {getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Entrega:</span>
                <span className={!isDeliveryFeeKnown ? 'shipping-calculate' : ''}>
                  {isCalculatingFee ? 'Calculando...' : isDeliveryFeeKnown ? `R$ ${formatCurrency(deliveryFee)}` : 'A combinar'}
                </span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>R$ {formatCurrency(orderTotal)}</span>
              </div>

              <div className="checkout-actions">
                {!address.street && (
                  <p className="error-message" style={{ textAlign: 'center' }}>
                    Adicione um endereço de entrega acima para finalizar o pedido.
                  </p>
                )}
                <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={!address.street || isCalculatingFee}
                >
                  {isCalculatingFee ? 'Calculando entrega...' : 'Finalizar Pedido'}
                </button>
                <button className="continue-shopping" onClick={onClose}>
                  Continuar Comprando
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {showAddressModal && (
        <div className="address-modal-overlay">
          <div className="address-modal">
            <button className="modal-close" onClick={() => setShowAddressModal(false)}>
              <FaTimes />
            </button>
            
            <h3>Endereço de Entrega</h3>
            
            <div className="address-form">
              <div className="form-group">
                <label htmlFor="fullName">Nome Completo</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={address.fullName}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cep">CEP*</label>
                  <div className="cep-input-group">
                    <input
                      type="text"
                      id="cep"
                      name="cep"
                      value={address.cep}
                      onChange={handleAddressChange}
                      placeholder="Com ou sem traço"
                      maxLength="9"
                    />
                    <button 
                      className="search-cep-btn"
                      onClick={searchAddressByCep}
                      disabled={isSearchingCep}
                    >
                      {isSearchingCep ? 'Buscando...' : 'Buscar'}
                    </button>
                  </div>
                  {cepError && <p className="error-message">{cepError}</p>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="street">Rua*</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row two-columns">
                <div className="form-group">
                  <label htmlFor="number">Número*</label>
                  <input
                    type="text"
                    id="number"
                    name="number"
                    value={address.number}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="complement">Complemento</label>
                  <input
                    type="text"
                    id="complement"
                    name="complement"
                    value={address.complement}
                    onChange={handleAddressChange}
                    placeholder="Apto, Bloco, etc."
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="neighborhood">Bairro*</label>
                  <input
                    type="text"
                    id="neighborhood"
                    name="neighborhood"
                    value={address.neighborhood}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row two-columns">
                <div className="form-group">
                  <label htmlFor="city">Cidade</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    disabled
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="state">Estado</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    disabled
                  />
                </div>
              </div>
              
              <div className="address-actions">
                <button 
                  className="save-address-btn"
                  onClick={handleSaveAddress}
                >
                  Salvar Endereço
                </button>
                
                <button 
                  className="cancel-btn"
                  onClick={() => setShowAddressModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutModal;