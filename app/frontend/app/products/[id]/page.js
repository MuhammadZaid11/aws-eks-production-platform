'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProductDetails() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${params.id}`);
        const data = await res.json();
        if (res.ok) {
          setProduct(data);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id]);

  const addToCart = () => {
    setAddingToCart(true);
    // Basic local storage cart implementation
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = existingCart.findIndex(item => item.productId === product.id);
    
    if (itemIndex > -1) {
      existingCart[itemIndex].quantity += 1;
    } else {
      existingCart.push({
        productId: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    setTimeout(() => {
      setAddingToCart(false);
      router.push('/cart');
    }, 500);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--error-color)' }}>
        <h2>Product not found.</h2>
        <Link href="/">Return to Home</Link>
      </div>
    );
  }

  return (
    <div>
      <header style={{ padding: '1.5rem 0', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>NexusCart</Link>
          <nav>
            <Link href="/cart" style={{ marginRight: '1.5rem', fontWeight: '500' }}>Cart</Link>
            <Link href="/login" style={{ fontWeight: '500' }}>Login</Link>
          </nav>
        </div>
      </header>
      
      <main className="container" style={{ padding: '4rem 1rem' }}>
        <Link href="/" style={{ display: 'inline-block', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
          ← Back to products
        </Link>
        
        <div className="premium-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem' }}>
          <div style={{ flex: '1 1 400px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} style={{ width: '100%', borderRadius: '12px', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: 'var(--text-secondary)' }}>No Image Available</span>
            )}
          </div>
          
          <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>{product.name}</h1>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '2rem' }}>
              ${parseFloat(product.price).toFixed(2)}
            </p>
            
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Description</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                {product.description || "This premium product brings the best in class experience to your daily life. Engineered for excellence."}
              </p>
            </div>
            
            <div style={{ marginTop: 'auto' }}>
              <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                Status: <span style={{ color: product.stock > 0 ? '#10B981' : 'var(--error-color)', fontWeight: '600' }}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </p>
              
              <button 
                onClick={addToCart} 
                className="btn-primary" 
                disabled={product.stock <= 0 || addingToCart}
                style={{ padding: '1rem', fontSize: '1.125rem', opacity: product.stock <= 0 ? 0.5 : 1 }}
              >
                {addingToCart ? 'Adding to cart...' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
