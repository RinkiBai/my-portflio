import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import portfolioImg from '../assets/portfolio.png';
import './Projects.css'; // Assume you create this CSS file for styles

const Projects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/api/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <section id="projects" className="projects-section">
      <h2 className="projects-title">My Projects</h2>

      {/* Optional static banner image */}
      <img
        src={portfolioImg}
        alt="Portfolio Website"
        className="projects-banner"
      />

      {projects.length > 0 ? (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project._id} className="project-card">
              <img
                src={project.image || portfolioImg}
                alt={project.title}
                className="project-image"
                onError={(e) => e.currentTarget.src = portfolioImg}
              />
              <h3 className="project-title">{project.title}</h3>
              <p className="project-description">{project.description}</p>

              {project.technologies && (
                <div className="project-tech-list">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="project-tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              <div className="project-links">
                {project.github && (
                  <a
                    href={project.github}
                    aria-label={`GitHub repository for ${project.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn code-btn"
                  >
                    <FaGithub /> Code
                  </a>
                )}

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
          ))}
        </div>
      ) : (
        <p className="no-projects-msg">No projects available.</p>
      )}
    </section>
  );
};

export default Projects;
