import express from 'express';
import { protect } from '../middleware/auth';
import { 
  createReport, 
  getMyReports, 
  getReportById, 
  updateReport, 
  submitReport 
} from '../controllers/reportController';
import { getTeamReports } from '../controllers/reportController';
import { managerOnly } from '../middleware/auth';
import { getAllUsers } from '../controllers/reportController';

const router = express.Router();

router.use(protect); // Protect all report routes

router.post('/', createReport);
router.get('/', getMyReports);
router.get('/team', protect, managerOnly, getTeamReports);
router.get('/users', protect, managerOnly, getAllUsers);
router.get('/:id', getReportById);
router.put('/:id', updateReport);
router.put('/:id/submit', submitReport);

export default router;