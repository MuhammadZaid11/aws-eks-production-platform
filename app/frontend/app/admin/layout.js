import Link from 'next/link';

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 100px)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: 'white', borderRight: '1px solid var(--border-color)', padding: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', padding: '0.5rem' }}>Admin Dashboard</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/admin/products" style={{ display: 'block', padding: '0.75rem 1rem', borderRadius: '4px', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', fontWeight: '500' }}>
            Products
          </Link>
          <Link href="/admin/orders" style={{ display: 'block', padding: '0.75rem 1rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
            Orders (Coming Soon)
          </Link>
          <Link href="/admin/users" style={{ display: 'block', padding: '0.75rem 1rem', borderRadius: '4px', color: 'var(--text-secondary)' }}>
            Users (Coming Soon)
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', backgroundColor: 'var(--bg-color)' }}>
        {children}
      </main>
    </div>
  );
}
