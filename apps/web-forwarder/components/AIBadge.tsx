export default function AIBadge({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const styles = {
    sm: { fontSize: 10, padding: '2px 6px' },
    md: { fontSize: 12, padding: '4px 8px' },
    lg: { fontSize: 14, padding: '6px 12px' },
  };

  return (
    <span style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      borderRadius: 4,
      fontWeight: 700,
      display: 'inline-block',
      ...styles[size]
    }}>
      AI
    </span>
  );
}
