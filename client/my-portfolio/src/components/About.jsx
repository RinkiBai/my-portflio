import React from 'react';
import styles from './About.module.css';
import useInView from './useInView'; // Your Intersection Observer hook

const About = () => {
  const [ref, isVisible] = useInView({ threshold: 0.2 });

  const skills = ['React', 'Node.js', 'JavaScript', 'HTML5', 'CSS3', 'MongoDB', 'Express', 'Git'];

  return (
    <section
      id="about"
      ref={ref}
      className={`${styles.aboutSection} ${isVisible ? styles.visible : ''}`}
    >
      <h2 className={styles.title}>About Me</h2>
      
      <p className={styles.paragraph}>
        I'm a passionate <strong style={{ color: '#0284c7' }}>Frontend Developer</strong> specializing in building responsive websites using 
        <strong style={{ color: '#0284c7' }}> React</strong> and the <strong style={{ color: '#0284c7' }}>MERN stack</strong>. 
        I transform ideas into performant web applications with clean code and elegant UI/UX. 
        My goal is to provide users with seamless and interactive web experiences.
      </p>

      <div style={{ marginTop: '2rem' }}>
        <h3 className={styles.toolkitTitle}>My Toolkit</h3>
        
        <ul className={styles.toolkitList}>
          {skills.map((skill) => (
            <li key={skill} className={styles.skillItem}>
              <span className={styles.skillBullet}>▹</span> {skill}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default About;
