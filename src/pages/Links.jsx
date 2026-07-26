import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { SiIfood } from 'react-icons/si';
import { FaBookOpen } from 'react-icons/fa';
import './Links.css';

const links = [
  {
    label: 'Ver Cardápio',
    href: '/cardapio/cardapio.pdf',
    icon: <FaBookOpen />,
    external: true
  },
  {
    label: 'Pedir pelo WhatsApp',
    href: 'https://wa.link/7cry8l',
    icon: <FontAwesomeIcon icon={faWhatsapp} />,
    external: true
  },
  {
    label: 'Pedir pelo iFood',
    href: 'https://www.ifood.com.br/delivery/ourinhos-sp/happy-cookies-nova-ourinhos/1709644f-67a5-4bae-b5f4-4215126ad823',
    icon: <SiIfood />,
    external: true
  },
  {
    label: 'Seguir no Instagram',
    href: 'https://www.instagram.com/happy.cookie.s/',
    icon: <FontAwesomeIcon icon={faInstagram} />,
    external: true
  }
];

const Links = () => {
  return (
    <div className="links-page">
      <div className="links-card">
        <img src="/images/logo.png" alt="Happy Cookies" className="links-logo" />
        <h1>Happy Cookies</h1>
        <p>Porque felicidade tem sabor de cookie!</p>

        <div className="links-list">
          {links.map(link => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className="links-button"
            >
              <span className="links-button-icon">{link.icon}</span>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Links;
