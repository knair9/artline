import Link from 'next/link';

export default function About() {
  return (
    <>
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
        }
      `}</style>

      <div style={{ backgroundColor: '#f7efe7', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header — matches index.js */}
        <header style={{
          backgroundColor: '#45633d',
          color: 'white',
          padding: '1.5rem 2rem',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
        }}>
          <div style={{ justifySelf: 'start', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ fontSize: '40px' }}>Artline</span>
            <Link href="/" style={{ color: 'white', fontSize: '1rem', fontWeight: '400', textDecoration: 'none', opacity: 0.85 }}>
              ← Back to Main
            </Link>
          </div>
          <div style={{ justifySelf: 'center', fontSize: '1rem', fontWeight: '500' }}>
            About
          </div>
          <div /> {/* spacer to keep grid balanced */}
        </header>

        {/* Page Content */}
        <main style={{
          flex: 1,
          maxWidth: '800px',
          margin: '3rem auto',
          padding: '0 2rem',
          color: '#222',
          fontFamily: 'Georgia, serif',
          lineHeight: '1.8',
        }}>
          <h1 style={{ color: '#45633d', borderBottom: '2px solid #b7492f', paddingBottom: '0.5rem' }}>
            About Artline
          </h1>

          <p>
            Write your project description here. What is Artline? What inspired it?
          </p>

          <h2 style={{ color: '#45633d', marginTop: '2rem' }}>The Team</h2>

          <p>
            <strong>Creator Name</strong> — write a short bio here.
          </p>

          <p>
            <strong>Another Creator</strong> — write a short bio here.
          </p>

          {/* Add more sections as needed */}
        </main>

        {/* Footer */}
        <div style={{
          padding: '1rem 2rem',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#666',
        }}>
          © {new Date().getFullYear()} Artline
        </div>
      </div>
    </>
  );
}