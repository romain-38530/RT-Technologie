export default function Card({
  title,
  children,
  action
}: {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 24,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      marginBottom: 24
    }}>
      {title && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          paddingBottom: 16,
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{title}</h2>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
