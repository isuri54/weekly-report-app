import express from 'express';
import { protect, managerOnly } from '../middleware/auth';
import { createProject, getAllProjects, updateProject, deleteProject } from '../controllers/projectController';

const router = express.Router();

router.get('/', protect, getAllProjects);
router.post('/', protect, managerOnly, createProject);
router.put('/:id', protect, managerOnly, updateProject);
router.delete('/:id', protect, managerOnly, deleteProject);

export default router;