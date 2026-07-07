import { Request, Response } from 'express';
import Project from '../models/Project';
import { AuthRequest } from '../middleware/auth';

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, color, assignedMembers } = req.body;

    const project = await Project.create({
      name,
      description,
      color,
      assignedMembers: assignedMembers || [],
      createdBy: req.user?._id
    });

    // Populate assigned members before sending response
    const populatedProject = await Project.findById(project._id).populate('assignedMembers', 'name email');
    res.status(201).json(populatedProject);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find()
    .populate('assignedMembers', 'name email')
    .sort({ name: 1 });
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { name, description, color, assignedMembers } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { 
        name, 
        description, 
        color, 
        assignedMembers: assignedMembers || [] 
      },
      { new: true }
    ).populate('assignedMembers', 'name email');

    if (!project) return res.status(404).json({ message: 'Project not found' });

    res.json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};