'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Loading products...</p>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Hero Banner Area */}
      <div style={{ position: 'relative', width: '100%', height: '300px', backgroundColor: '#e2e8f0', marginBottom: '2rem' }}>
        <img 
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=2070" 
          alt="Hero Banner" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)' }} 
        />
        <div className="container" style={{ position: 'absolute', top: '0', left: '0', right: '0', padding: '2rem 1rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            Super Saver Deals
          </h1>
          <p style={{ color: 'white', fontSize: '1.25rem', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Up to 50% off on electronics and fashion</p>
        </div>
      </div>

      <main className="container" style={{ marginTop: '-80px', position: 'relative', zIndex: 1 }}>
        {products.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No products available right now.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Link href={`/products/${product.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                  <div style={{ 
                    height: '200px', 
                    backgroundColor: '#f9fafb', 
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)'
                  }}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span>No Image</span>
                    )}
                  </div>
                  
                  <h3 style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {product.name}
                  </h3>
                </Link>
                
                <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#B12704', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', verticalAlign: 'top' }}>$</span>
                    {Math.floor(parseFloat(product.price))}
                    <span style={{ fontSize: '0.75rem', verticalAlign: 'top' }}>
                      {(parseFloat(product.price) % 1).toFixed(2).substring(2)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Ships to your location
                  </p>
                  
                  <Link href={`/products/${product.id}`} className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '0.5rem' }}>
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
