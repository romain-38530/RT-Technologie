import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RT Transporter',
  description: 'Espace transporteur - RT Technologie',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
