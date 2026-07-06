import { Request, Response } from 'express';
import WeeklyReport from '../models/WeeklyReport';
import Project from '../models/Project';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';

export const createReport = async (req: AuthRequest, res: Response) => {
  try {
    const { weekStartDate, project, tasksCompleted, tasksPlanned, blockers, hoursWorked, notes } = req.body;

    const report = await WeeklyReport.create({
      user: req.user?._id,
      weekStartDate: new Date(weekStartDate),
      project,
      tasksCompleted,
      tasksPlanned,
      blockers,
      hoursWorked,
      notes,
      status: 'DRAFT'
    });

    res.status(201).json(report);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyReports = async (req: AuthRequest, res: Response) => {
  try {
    const reports = await WeeklyReport.find({ user: req.user?._id })
      .populate('project', 'name')
      .sort({ weekStartDate: -1 });

    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getReportById = async (req: AuthRequest, res: Response) => {
  try {
    const report = await WeeklyReport.findOne({ 
      _id: req.params.id, 
      user: req.user?._id 
    }).populate('project');

    if (!report) return res.status(404).json({ message: 'Report not found' });

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReport = async (req: AuthRequest, res: Response) => {
  try {
    const report = await WeeklyReport.findOneAndUpdate(
      { _id: req.params.id, user: req.user?._id },
      req.body,
      { new: true }
    );

    if (!report) return res.status(404).json({ message: 'Report not found' });

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const submitReport = async (req: AuthRequest, res: Response) => {
  try {
    const report = await WeeklyReport.findOneAndUpdate(
      { _id: req.params.id, user: req.user?._id },
      { status: 'SUBMITTED', submittedAt: new Date() },
      { new: true }
    );

    if (!report) return res.status(404).json({ message: 'Report not found' });

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeamReports = async (req: AuthRequest, res: Response) => {
  try {
    const { weekStart, projectId, userId } = req.query;

    let query: any = {};

    if (weekStart) {
      query.weekStartDate = { $gte: new Date(weekStart as string) };
    }
    if (projectId) query.project = projectId;
    if (userId) query.user = userId;

    const reports = await WeeklyReport.find(query)
      .populate('user', 'name email role')
      .populate('project', 'name')
      .sort({ weekStartDate: -1 });

    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('name email role').sort({ name: 1 });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};