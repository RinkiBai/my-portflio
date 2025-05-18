import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import portfolioImg from '../assets/portfolio.png';
import voyageAIImg from '../assets/voyageai-screenshot.png'; // Add your actual image
import portfolioMERNImg from '../assets/portfolio-screenshot.png'; // Add your actual image
import './Projects.css';

const Projects = () => {
  // Static array of GitHub projects with detailed descriptions
  const projects = [
    {
      id: 1,
      title: "VoyageAI Client",
      description: "A modern travel planning application that helps users discover and organize their dream vacations with AI-powered recommendations.",
      technologies: ["React", "Node.js", "Express", "MongoDB", "TailwindCSS"],
      github: "https://github.com/RinkiBai/voyageai-client",
      link: "https://voyageai-client-4e1k.vercel.app/", // Update with your actual demo link
      image: voyageAIImg
    },
    {
      id: 2,
      title: "MERN Portfolio",
      description: "A full-stack developer portfolio built with the MERN stack, featuring project showcases, skills display, and contact form with backend functionality.",
      technologies: ["React", "Node.js", "Express", "MongoDB", "Material-UI"],
      github: "https://github.com/RinkiBai/portfolio-mern",
      link: "https://portfolio-mern-gct8.vercel.app/projects/", // Update with your actual demo link
      image: portfolioMERNImg
    }
  ];

  return (
    <section id="projects" className="projects-section">
      <h2 className="projects-title">Featured Projects</h2>
      <p className="projects-subtitle">Here are some of my recent works</p>

      {projects.length > 0 ? (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-image-container">
                <img
                  src={project.image}
                  alt={project.title}
                  className="project-image"
                  onError={(e) => e.currentTarget.src = portfolioImg}
                />
              </div>
              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>

                <div className="project-tech-list">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="project-tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="project-links">
                  <a
                    href={project.github}
                    aria-label={`GitHub repository for ${project.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn code-btn"
                  >
                    <FaGithub /> View Code
                  </a>
                  
                  {project.link && (
                    <a
                      href={project.link}
                      aria-label={`Live demo for ${project.title}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn demo-btn"
                    >
                      <FaExternalLinkAlt /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="no-projects-msg">No projects available.</p>
      )}
    </section>
  );
};

export default Projects;