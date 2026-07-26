import React, { useState, useEffect } from 'react';
import './TestimonialsSection.css';

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      text: 'Os cookies da Happy Cookies são simplesmente divinos! O de Nutella é meu favorito, sempre peço nas sextas para adoçar o final de semana. Entrega rápida e embalagem impecável!',
      author: 'Mariana Silva',
      rating: 5
    },
    {
      id: 2,
      text: 'Experimentei o cookie de Kit Kat e fiquei impressionada! A massa é macia e o recheio é generoso. Já virou tradição pedir todo final de semana.',
      author: 'Carla Oliveira',
      rating: 5
    },
    {
      id: 3,
      text: 'As marmitinhas são perfeitas para dividir (ou não). A de Red Velvet é simplesmente incrível, o recheio de chocolate branco combina perfeitamente com a massa.',
      author: 'Juliana Mendes',
      rating: 5
    },
    {
      id: 4,
      text: 'Sou viciada nos cookies de Oreo! A textura é perfeita - crocante por fora e macia por dentro. O atendimento é excelente e a entrega sempre pontual.',
      author: 'Fabiola Silva',
      rating: 5
    },
    {
      id: 5,
      text: 'Sabor incrível, qualidade ótima e entrega certinha. Foi uma experiência muito boa, nota 10!',
      author: 'Ana Carolina',
      rating: 5
    },
    {
      id: 6,
      text: 'O atendimento foi ótimo e a entrega super rápida. E os cookies? Uma delícia! Bem docinhos e com aquele sabor de feito em casa.',
      author: 'Lucas Santos', 
      rating: 5
    },
    {
      id: 7,
      text: 'No meu primeiro pedido fiquei impressionado com o sabor. Muito melhor do que eu esperava! Peço toda semana.',
      author: 'Rubens Paiva',
      rating: 5
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => 
        prevIndex === testimonials.length - 3 ? 0 : prevIndex + 1
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleDotClick = (index) => {
    if (index <= testimonials.length - 3) {
      setActiveIndex(index);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < rating; i++) {
      stars.push(<span key={i} className="star">★</span>);
    }
    return stars;
  };

  return (
    <section className="testimonials">
      <div className="container">
        <h2 className="testimonials-title">
          <span className="secondary-color">O que nossos </span>
          <span className="primary-color">clientes </span>
          <span className="primary-color">dizem</span>
        </h2>
        <p className="testimonials-subtitle" style={{fontWeight:"600"}}>
          Veja o que nossos clientes estão falando sobre nossos cookies
        </p>

        <div className="testimonials-carousel">
          <div className="testimonial-cards-container">
            {[0, 1, 2].map((offset) => {
              const index = (activeIndex + offset) % testimonials.length;
              return (
                <div key={testimonials[index].id} className="testimonial-card">
                  <p className="testimonial-text">
                    {testimonials[index].text}
                  </p>
                  <div className="testimonial-rating">
                    {renderStars(testimonials[index].rating)}
                  </div>
                  <p className="testimonial-author">
                    {testimonials[index].author}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="testimonial-dots">
            {testimonials.slice(0, testimonials.length - 2).map((_, index) => (
              <button
                key={index}
                className={`testimonial-dot ${index === activeIndex ? 'active' : ''}`}
                onClick={() => handleDotClick(index)}
                aria-label={`Depoimento ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;