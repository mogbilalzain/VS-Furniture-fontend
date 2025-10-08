import './globals.css'
import ClientLayout from '../components/ClientLayout'

export const metadata = {
  title: 'VS Furniture - Educational Furniture Solutions',
  description: 'Premium educational furniture solutions for modern learning environments. Discover our innovative designs and ergonomic solutions.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" 
          rel="stylesheet" 
        />
      </head>
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
} 