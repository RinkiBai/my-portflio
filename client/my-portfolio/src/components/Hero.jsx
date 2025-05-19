import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section className={styles.hero}>
    <div className={styles.heroContent}>
      <h1>
        Hi, I'm <span className={styles.highlight}>Rinki Bai</span>
      </h1>
      <p>Frontend Developer | MERN Stack Enthusiast</p>
      <a
        href="https://www.linkedin.com/in/rinki-bai-8a8231333"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.linkedinBtn}
      >
        Connect on LinkedIn
      </a>
    </div>
  </section>
  
  );
};

export default Hero;
