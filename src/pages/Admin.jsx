import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './Admin.css';

const CATEGORIES = ['novidades', 'tradicionais', 'recheados', 'marmitinhas', 'bebidas'];

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const emptyProduct = {
  id: '',
  name: '',
  description: '',
  price: '',
  category: CATEGORIES[0],
  image: '',
  available: true,
  active: true
};

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError('E-mail ou senha incorretos.');
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Digite seu e-mail acima primeiro, depois clique em "Esqueci minha senha".');
      return;
    }
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setInfo(error ? '' : 'Enviamos um e-mail com instruções para redefinir sua senha.');
    if (error) setError('Não foi possível enviar o e-mail. Tente novamente.');
  };

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={handleLogin}>
        <h1>Painel Happy Cookies</h1>
        <div className="admin-form-group">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="admin-form-group">
          <label htmlFor="password">Senha</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <p className="admin-error">{error}</p>}
        {info && <p className="admin-info">{info}</p>}
        <button type="submit" className="admin-btn-primary" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <button type="button" className="admin-link-btn" onClick={handleForgotPassword}>
          Esqueci minha senha
        </button>
      </form>
    </div>
  );
};

const ProductForm = ({ product, onCancel, onSaved }) => {
  const [form, setForm] = useState(product);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isNew = !product.id;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm(prev => ({
      ...prev,
      name,
      id: isNew ? `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}` : prev.id
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    const path = `${Date.now()}-${slugify(file.name)}`;
    const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file);

    if (uploadError) {
      setError('Falha ao enviar a foto: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    setForm(prev => ({ ...prev, image: data.publicUrl }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id || !form.name || !form.price) {
      setError('Preencha nome e preço.');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      id: form.id,
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      image: form.image,
      available: form.available,
      active: form.active
    };

    const { error: saveError } = isNew
      ? await supabase.from('products').insert(payload)
      : await supabase.from('products').update(payload).eq('id', form.id);

    setSaving(false);

    if (saveError) {
      setError('Falha ao salvar: ' + saveError.message);
      return;
    }

    onSaved();
  };

  return (
    <form className="admin-product-form" onSubmit={handleSubmit}>
      <h3>{isNew ? 'Novo produto' : `Editar: ${product.name}`}</h3>

      <div className="admin-form-group">
        <label>Nome</label>
        <input name="name" value={form.name} onChange={handleNameChange} required />
      </div>

      <div className="admin-form-group">
        <label>Descrição</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
      </div>

      <div className="admin-form-row">
        <div className="admin-form-group">
          <label>Preço (R$)</label>
          <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required />
        </div>

        <div className="admin-form-group">
          <label>Categoria</label>
          <select name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="admin-form-group">
        <label>Foto</label>
        {form.image && <img src={form.image} alt="" className="admin-image-preview" />}
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
        {uploading && <p className="admin-info">Enviando foto...</p>}
      </div>

      <div className="admin-form-row admin-checkboxes">
        <label>
          <input type="checkbox" name="available" checked={form.available} onChange={handleChange} />
          Disponível (sem isso marcado, aparece "Esgotado" no site)
        </label>
        <label>
          <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
          Ativo (sem isso marcado, some do cardápio do site)
        </label>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-form-actions">
        <button type="submit" className="admin-btn-primary" disabled={saving || uploading}>
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
        <button type="button" className="admin-btn-secondary" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
};

const ProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // produto sendo editado, ou emptyProduct pra novo

  const loadProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('name');
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, []);

  const toggleActive = async (product) => {
    await supabase.from('products').update({ active: !product.active }).eq('id', product.id);
    loadProducts();
  };

  if (editing) {
    return (
      <ProductForm
        product={editing}
        onCancel={() => setEditing(null)}
        onSaved={() => { setEditing(null); loadProducts(); }}
      />
    );
  }

  return (
    <div>
      <button className="admin-btn-primary" onClick={() => setEditing(emptyProduct)}>+ Novo produto</button>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="admin-product-list">
          {products.map(product => (
            <div key={product.id} className={`admin-product-row ${!product.active ? 'admin-inactive' : ''}`}>
              {product.image && <img src={product.image} alt="" className="admin-thumb" />}
              <div className="admin-product-info">
                <strong>{product.name}</strong>
                <span>R$ {Number(product.price).toFixed(2)} · {product.category}</span>
                <span>{product.available ? 'Disponível' : 'Esgotado'} · {product.active ? 'Ativo' : 'Inativo'}</span>
              </div>
              <div className="admin-product-actions">
                <button className="admin-btn-secondary" onClick={() => setEditing(product)}>Editar</button>
                <button className="admin-btn-secondary" onClick={() => toggleActive(product)}>
                  {product.active ? 'Desativar' : 'Reativar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DeliveryTab = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadZones = async () => {
    setLoading(true);
    const { data } = await supabase.from('delivery_zones').select('*').order('max_km');
    setZones(data || []);
    setLoading(false);
  };

  useEffect(() => { loadZones(); }, []);

  const updateField = (id, field, value) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, [field]: value } : z));
  };

  const saveZone = async (zone) => {
    setError('');
    const { error } = await supabase
      .from('delivery_zones')
      .update({ max_km: Number(zone.max_km), fee: Number(zone.fee) })
      .eq('id', zone.id);
    if (error) setError('Falha ao salvar: ' + error.message);
  };

  const deleteZone = async (id) => {
    if (!window.confirm('Excluir essa faixa de frete?')) return;
    await supabase.from('delivery_zones').delete().eq('id', id);
    loadZones();
  };

  const addZone = async () => {
    const { data, error } = await supabase
      .from('delivery_zones')
      .insert({ max_km: 1, fee: 0 })
      .select()
      .single();
    if (!error) setZones(prev => [...prev, data]);
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <p className="admin-hint">Distância (km) até onde vale esse valor de entrega, e o valor cobrado.</p>
      {error && <p className="admin-error">{error}</p>}

      <div className="admin-zone-list">
        {zones.map(zone => (
          <div key={zone.id} className="admin-zone-row">
            <label>
              Até
              <input
                type="number" step="0.1" min="0"
                value={zone.max_km}
                onChange={e => updateField(zone.id, 'max_km', e.target.value)}
              /> km
            </label>
            <label>
              R$
              <input
                type="number" step="0.01" min="0"
                value={zone.fee}
                onChange={e => updateField(zone.id, 'fee', e.target.value)}
              />
            </label>
            <button className="admin-btn-secondary" onClick={() => saveZone(zone)}>Salvar</button>
            <button className="admin-btn-danger" onClick={() => deleteZone(zone.id)}>Excluir</button>
          </div>
        ))}
      </div>

      <button className="admin-btn-primary" onClick={addZone}>+ Nova faixa</button>
    </div>
  );
};

const AdminDashboard = () => {
  const [tab, setTab] = useState('cardapio');

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Painel Happy Cookies</h1>
        <button className="admin-btn-secondary" onClick={() => supabase.auth.signOut()}>Sair</button>
      </header>

      <nav className="admin-tabs">
        <button className={tab === 'cardapio' ? 'active' : ''} onClick={() => setTab('cardapio')}>Cardápio</button>
        <button className={tab === 'entrega' ? 'active' : ''} onClick={() => setTab('entrega')}>Entrega</button>
      </nav>

      <main className="admin-content">
        {tab === 'cardapio' ? <ProductsTab /> : <DeliveryTab />}
      </main>
    </div>
  );
};

const Admin = () => {
  const [session, setSession] = useState(undefined); // undefined = carregando

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return <div className="admin-login"><p>Supabase não configurado.</p></div>;
  }

  if (session === undefined) {
    return <div className="admin-login"><p>Carregando...</p></div>;
  }

  return session ? <AdminDashboard /> : <AdminLogin />;
};

export default Admin;
