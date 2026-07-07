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
    const { weekStart, week, projectId, userId } = req.query;

    let query: any = {};

    const selectedWeek = (weekStart as string) || (week as string);

    if (selectedWeek) {
      const normalized = selectedWeek.trim();

      if (/^\d{4}-W\d{2}$/.test(normalized)) {
        const [yearStr, weekStr] = normalized.split('-W');
        const year = Number(yearStr);
        const weekNumber = Number(weekStr);

        const weekStartDate = new Date(Date.UTC(year, 0, 4));
        const day = weekStartDate.getUTCDay() || 7;
        weekStartDate.setUTCDate(weekStartDate.getUTCDate() + 1 - day);
        weekStartDate.setUTCDate(weekStartDate.getUTCDate() + (weekNumber - 1) * 7);

        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6);

        query.weekStartDate = { $gte: weekStartDate, $lte: weekEndDate };
      } else {
        const startDate = new Date(normalized);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        query.weekStartDate = { $gte: startDate, $lte: endDate };
      }
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