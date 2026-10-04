import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const handleNavigation = (section) => {
    // Add your navigation logic here
    console.log(`Navigating to ${section}`);
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.brandSection}>
          <h2 style={styles.logo}>
            Train<span style={styles.logoAccent}>U+</span>
          </h2>
          <p style={styles.description}>
            Empowering employees through continuous learning and professional development.
          </p>
         
        </div>
        
      </div>

      {/* BOTTOM BAR */}
      <div style={styles.bottomBar}>
        <div style={styles.bottomContainer}>
          <p>© {currentYear} TrainU+. All rights reserved.</p>
          <p style={styles.version}>Version 0.0.1</p>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#0f2b42',
    color: '#ffffff',
    marginTop: 'auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 24px 32px',
    gap: '40px',
  },

  logo: {
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '12px',
    letterSpacing: '-0.5px',
  },

  logoAccent: {
    color: '#f58220',
    background: 'linear-gradient(135deg, #f58220 0%, #ff9e44 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    color: '#f58220',
  },

  description: {
    fontSize: '14px',
    lineHeight: '1.6',
    opacity: 0.85,
    marginBottom: '20px',
  },


  

  // Resources Section
  linksSection: {
    minWidth: '140px',
  },

  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '20px',
    color: '#f58220',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },

  linkList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },

  link: {
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    lineHeight: '2.2',
    opacity: 0.8,
    transition: 'all 0.2s ease',
    display: 'inline-block',
    ':hover': {
      opacity: 1,
      color: '#f58220',
      transform: 'translateX(4px)',
    },
  },

  // Contact Section
  contactSection: {
    minWidth: '240px',
  },

  contactInfo: {
    marginBottom: '24px',
  },

  contactItem: {
    fontSize: '14px',
    lineHeight: '2',
    opacity: 0.85,
    margin: '8px 0',
  },

  legalLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
    marginTop: '16px',
  },

  legalButton: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '12px',
    opacity: 0.7,
    cursor: 'pointer',
    padding: '4px 0',
    transition: 'opacity 0.2s ease',
    ':hover': {
      opacity: 1,
      textDecoration: 'underline',
    },
  },

  separator: {
    opacity: 0.5,
    fontSize: '12px',
  },

  // Bottom Bar
  bottomBar: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },

  bottomContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '12px',
    opacity: 0.7,
  },

  version: {
    fontSize: '11px',
    opacity: 0.6,
  },
};

export default Footer;