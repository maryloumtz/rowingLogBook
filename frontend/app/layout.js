import './globals.css';

export const metadata = {
  title: 'Rowing LogBook',
  description: 'Training logbook for rowing sessions.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
