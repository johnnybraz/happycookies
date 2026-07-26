import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './ContactModal.css';

const ContactModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Usando a API do FormSubmit com a chave correta
      const response = await fetch('https://formsubmit.co/ajax/atendimento.happycookies@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          message: formData.message,
          _captcha: false
        })
      });
      
      const data = await response.json();
      
      if (data.success === "true") {
        setSubmitStatus('success');
        setFormData({
          name: '',
          phone: '',
          email: '',
          message: ''
        });
        
        // Fechar o modal após 3 segundos
        setTimeout(() => {
          onClose();
          setSubmitStatus(null);
        }, 3000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="contact-modal">
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
          
          <h3>Fale Conosco</h3>
        </div>
        
        <div className="modal-header">
          <h2>Fale Conosco</h2>
          <p>Preencha o formulário abaixo e entraremos em contato o mais breve possível.</p>
        </div>
        
        {submitStatus === 'success' ? (
          <div className="success-message">
            <p>Mensagem enviada com sucesso!</p>
            <p>Obrigado pelo contato, retornaremos em breve.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Nome</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Telefone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Mensagem</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                required
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
            </button>
            
            {submitStatus === 'error' && (
              <p className="error-message">
                Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactModal;