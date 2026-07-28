import React from 'react';
import CookiesSection from '../components/CookiesSection';
import TestimonialsSection from '../components/TestimonialsSection';
import HowToOrderSection from '../components/HowToOrderSection';
import ReadyToOrderSection from '../components/ReadyToOrderSection';


const Home = () => {
  return (
    <main>
      <section id="home" className="banner">
        <div className="container">
          <div className="banner-content">
            <h1>Happy Cookies — Cookies Artesanais em Ourinhos/SP</h1>
            <p>Cookies artesanais feitos à mão em Ourinhos, com ingredientes selecionados e muito amor. Peça com delivery pelo site, WhatsApp ou iFood.</p>
            <p style={{fontWeight:"600"}}>Porque felicidade tem sabor de Cookie!</p>
            
          </div>
        </div>
      </section>
      
      <CookiesSection />
      
      <section id="sobre" className="sobre">
        <div className="container">
          <div className="section-header">
            <h2>Sobre <span className="primary-color">Nós</span></h2>
            <p style={{fontWeight:"600"}}>Conheça nossa história e paixão por cookies artesanais</p>
            
          </div>
          <div className="sobre-content">
            <div className="sobre-text">
              <p>Sempre acreditamos que a vida fica mais doce com um bom cookie. Movidos por essa ideia, decidimos transformar nossa paixão em algo maior. A Happy Cookies é a realização de um sonho que agora queremos dividir com você.</p>
              <p>Na Happy Cookies, qualidade é essencial. Selecionamos cuidadosamente cada ingrediente para oferecer cookies artesanais, frescos e irresistíveis.</p>
              <p>Acreditamos que um bom cookie tem o poder de transformar o dia de alguém.
              Nosso propósito é simples: entregar sabor, carinho e momentos doces de verdade.</p> 
              <p style={{fontStyle:"italic"}}>"Porque felicidade tem sabor de cookie!"</p>
            </div>
          </div>
        </div>
      </section>
      
      <TestimonialsSection />
      
      <HowToOrderSection />
      
      <ReadyToOrderSection />
    </main>
  );
};

export default Home;