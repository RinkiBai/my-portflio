import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import { Link } from 'react-router-dom';
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setIsMenuOpen(false);
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <h1 className={styles.logo}>MY Portfolio</h1>
        <div className={`${styles.links} ${isMenuOpen ? styles.active : ''}`}>
        <Link to="/">Home</Link>
        <Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
<Link to="/projects" onClick={() => setIsMenuOpen(false)}>Projects</Link>
<Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
        </div>
        <div className={styles.menuIcon} onClick={toggleMenu}>
          <span className={isMenuOpen ? styles.rotateTop : ''}></span>
          <span className={isMenuOpen ? styles.hideMiddle : ''}></span>
          <span className={isMenuOpen ? styles.rotateBottom : ''}></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
