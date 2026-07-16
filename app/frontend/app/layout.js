import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'NexusCart - Shop Online',
  description: 'The best place to buy everything.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container navbar">
            <Link href="/" className="logo">
              NexusCart
            </Link>
            
            <div className="search-container">
              <select style={{ backgroundColor: '#f3f4f6', border: 'none', padding: '0 0.5rem', outline: 'none' }}>
                <option>All</option>
                <option>Electronics</option>
                <option>Fashion</option>
              </select>
              <input type="text" className="search-input" placeholder="Search NexusCart" />
              <button className="search-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#0f1111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 21L16.65 16.65" stroke="#0f1111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <Link href="/login" className="nav-link">
              <span>Hello, sign in</span>
              <strong>Account & Lists</strong>
            </Link>
            
            <Link href="/admin" className="nav-link">
              <span>Manage</span>
              <strong>Admin</strong>
            </Link>
            
            <Link href="/cart" className="nav-link" style={{ flexDirection: 'row', alignItems: 'flex-end', gap: '0.25rem' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.20914 16.0087 9.68 16H19.4C19.8709 16.0087 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <strong>Cart</strong>
            </Link>
          </div>
        </header>
        
        <div className="secondary-nav">
          <div className="container" style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="#">☰ All</Link>
            <Link href="#">Today's Deals</Link>
            <Link href="#">Customer Service</Link>
            <Link href="#">Registry</Link>
            <Link href="#">Gift Cards</Link>
            <Link href="#">Sell</Link>
          </div>
        </div>
        
        {children}
      </body>
    </html>
  );
}
