'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
    setLoading(false);
  }, []);

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to checkout.');
      router.push('/login');
      return;
    }
    
    setProcessing(true);
    
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map(item => ({ productId: item.productId, quantity: item.quantity }))
        })
      });
      
      if (!res.ok) {
        throw new Error('Checkout failed');
      }
      
      localStorage.removeItem('cart');
      setCart([]);
      alert('Order placed successfully!');
      router.push('/');
    } catch (error) {
      alert(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div>
      <header style={{ padding: '1.5rem 0', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>NexusCart</Link>
          <nav>
            <Link href="/login" style={{ fontWeight: '500' }}>Login</Link>
          </nav>
        </div>
      </header>
      
      <main className="container" style={{ padding: '4rem 1rem', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '2rem' }}>Your Shopping Cart</h1>
        
        {cart.length === 0 ? (
          <div className="premium-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', marginBottom: '2rem' }}>Your cart is empty.</p>
            <Link href="/" className="btn-primary" style={{ display: 'inline-block', width: 'auto' }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="premium-card">
            <div style={{ marginBottom: '2rem' }}>
              {cart.map((item, index) => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem' }}>{item.name}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>${item.price.toFixed(2)} each</p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                      <button onClick={() => updateQuantity(index, -1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', padding: '0.5rem 1rem', cursor: 'pointer' }}>-</button>
                      <span style={{ padding: '0 0.5rem', fontWeight: '600' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(index, 1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', padding: '0.5rem 1rem', cursor: 'pointer' }}>+</button>
                    </div>
                    
                    <span style={{ fontWeight: '700', minWidth: '80px', textAlign: 'right' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>Total:</span>
                <span style={{ display: 'block', fontSize: '2rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                  ${total.toFixed(2)}
                </span>
              </div>
              
              <button 
                className="btn-primary" 
                style={{ width: 'auto', padding: '1rem 2rem', fontSize: '1.125rem' }}
                onClick={handleCheckout}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Checkout Securely'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
