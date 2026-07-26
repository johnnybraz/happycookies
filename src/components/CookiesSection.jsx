import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { supabase } from '../lib/supabaseClient';
import './CookiesSection.css';

const CATEGORY_LABELS = {
  novidades: 'Novidades',
  tradicionais: 'Tradicionais',
  recheados: 'Recheados',
  marmitinhas: 'Marmitinhas',
  bebidas: 'Bebidas'
};

const CookiesSection = () => {
  const [activeCategory, setActiveCategory] = useState('novidades');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!supabase) {
        setError('Supabase não configurado (faltam as variáveis REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY).');
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, image, category, available')
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setProducts(data.map(product => ({
          ...product,
          price: Number(product.price).toFixed(2).replace('.', ',')
        })));
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const categories = Object.keys(CATEGORY_LABELS).filter(category =>
    products.some(product => product.category === category)
  );

  const productsByCategory = products.filter(product => product.category === activeCategory);

  return (
    <section id="nossos-cookies" className="nossos-cookies">
      <div className="container">
        <div className="section-header">
          <h2>
            <span className="secondary-color">Nossos</span>
            <span className="primary-color"> Cookies</span>
          </h2>
          <p style={{fontWeight:"600"}}>Conheça nossos sabores exclusivos feitos com ingredientes selecionados</p>
        </div>

        {error && <p className="produtos-erro">Não foi possível carregar o cardápio agora. Tente novamente em instantes.</p>}

        {!error && (
          <>
            <div className="category-tabs">
              {categories.map(category => (
                <button
                  key={category}
                  className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {CATEGORY_LABELS[category]}
                </button>
              ))}
            </div>

            {loading ? (
              <p className="produtos-carregando">Carregando cardápio...</p>
            ) : (
              <div className="produtos-grid">
                {productsByCategory.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default CookiesSection;
