'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

const WHATSAPP_NUMBER = '971542327151';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export default function FloatingWhatsApp() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);

  if (typeof pathname === 'string' && pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'fixed',
        right: '20px',
        bottom: '20px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#25D366',
        color: '#ffffff',
        textDecoration: 'none',
        boxShadow: hovered
          ? '0 6px 20px rgba(37, 211, 102, 0.55)'
          : '0 4px 12px rgba(37, 211, 102, 0.40)',
        transform: hovered ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <i className="fa-brands fa-whatsapp" style={{ fontSize: '28px', lineHeight: 1 }} />
    </a>
  );
}
