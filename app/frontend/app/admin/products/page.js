'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name, description, category, price: parseFloat(price), stock: parseInt(stock), imageUrl
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add product');
      }

      alert('Product added successfully!');
      setIsAdding(false);
      
      // Reset form
      setName(''); setDescription(''); setCategory('General'); setPrice(''); setStock(''); setImageUrl('');
      
      fetchProducts(); // Refresh list
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete');
      fetchProducts();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Manage Products</h1>
        <button 
          className="btn-primary" 
          style={{ width: 'auto', padding: '0.5rem 1.5rem' }}
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? 'Cancel' : 'Add New Product'}
        </button>
      </div>

      {isAdding && (
        <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Add New Product</h2>
          <form onSubmit={handleAddProduct}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">Product Name</label>
                <input type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
                  <option>General</option>
                  <option>Electronics</option>
                  <option>Fashion</option>
                  <option>Home & Kitchen</option>
                </select>
              </div>
              <div>
                <label className="label">Price ($)</label>
                <input type="number" step="0.01" className="input-field" value={price} onChange={e => setPrice(e.target.value)} required />
              </div>
              <div>
                <label className="label">Stock Quantity</label>
                <input type="number" className="input-field" value={stock} onChange={e => setStock(e.target.value)} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Image URL</label>
                <input type="text" className="input-field" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Description</label>
                <textarea className="input-field" rows="4" value={description} onChange={e => setDescription(e.target.value)}></textarea>
              </div>
            </div>
            <button type="submit" className="btn-primary" style={{ width: 'auto', marginTop: '1rem' }}>Save Product</button>
          </form>
        </div>
      )}

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>ID</th>
              <th style={{ padding: '1rem' }}>Image</th>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Price</th>
              <th style={{ padding: '1rem' }}>Stock</th>
              <th style={{ padding: '1rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem' }}>#{product.id}</td>
                <td style={{ padding: '1rem' }}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                  ) : 'N/A'}
                </td>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{product.name}</td>
                <td style={{ padding: '1rem' }}>{product.category}</td>
                <td style={{ padding: '1rem' }}>${product.price}</td>
                <td style={{ padding: '1rem' }}>{product.stock}</td>
                <td style={{ padding: '1rem' }}>
                  <button 
                    style={{ backgroundColor: 'var(--error-color)', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
