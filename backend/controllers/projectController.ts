import { Request, Response } from 'express';
import Project from '../models/Project';
import { AuthRequest } from '../middleware/auth';

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.create({
      ...req.body,
      createdBy: req.user?._id
    });
    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await Project.find().sort({ name: 1 });
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
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