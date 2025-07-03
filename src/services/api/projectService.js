import mockProjects from '@/services/mockData/projects.json';

class ProjectService {
  constructor() {
    this.projects = [...mockProjects];
  }

  async getAll() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 250));
    return [...this.projects];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const project = this.projects.find(p => p.Id === parseInt(id));
    if (!project) {
      throw new Error('Project not found');
    }
    return { ...project };
  }

  async create(projectData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newProject = {
      Id: Math.max(...this.projects.map(p => p.Id), 0) + 1,
      name: projectData.name,
      color: projectData.color || '#4F46E5',
      taskCount: 0
    };
    
    this.projects.push(newProject);
    return { ...newProject };
  }

  async update(id, updates) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.projects.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Project not found');
    }
    
    const updatedProject = {
      ...this.projects[index],
      ...updates
    };
    
    this.projects[index] = updatedProject;
    return { ...updatedProject };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.projects.findIndex(p => p.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Project not found');
    }
    
    this.projects.splice(index, 1);
    return true;
  }
}

export const projectService = new ProjectService();