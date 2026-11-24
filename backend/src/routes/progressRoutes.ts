import { Router } from 'express';
import {
  getProgressUpdates,
  createProgressUpdate,
  deleteProgressUpdate,
} from '../controllers/progressController';

const router = Router();

router.get('/', getProgressUpdates);
router.post('/', createProgressUpdate);
router.delete('/:id', deleteProgressUpdate);

export default router;
