import Link from 'next/link';

const AdminHome: React.FC = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard</h1>
      <p style={styles.subtitle}>Choose a section to manage:</p>
      
      <div style={styles.cardContainer}>
        <Link href="/staff/inventory">
          <div style={styles.card}>
            <h3>Inventory Management &rarr;</h3>
            <p>View and manage inventory items.</p>
          </div>
        </Link>
        
        <Link href="/staff/voucher-request">
          <div style={styles.card}>
            <h3>Voucher Requests &rarr;</h3>
            <p>Review and approve voucher requests.</p>
          </div>
        </Link>
        
        <Link href="/staff/manage-users">
          <div style={styles.card}>
            <h3>Manage Users &rarr;</h3>
            <p>Add, suspend, or reset user passwords.</p>
          </div>
        </Link>

        <Link href="/staff/product-request">
          <div style={styles.card}>
            <h3>Product Requests &rarr;</h3>
            <p>Handle requests for new or existing products.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    textAlign: 'center' as const,
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '2.5rem',
    color: '#333',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#555',
    marginBottom: '20px',
  },
  cardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  card: {
    padding: '20px',
    textDecoration: 'none',
    border: '1px solid #ddd',
    borderRadius: '10px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    color: '#333',
  },
};

export default AdminHome;
