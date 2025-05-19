import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Ensures title is provided
  },
  description: {
    type: String,
    required: true, // Ensures description is provided
  },
  image: {
    type: String,
    required: true, // Ensures image is provided
  },
  link: {
    type: String,
    required: true, // Ensures link is provided
  },
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
