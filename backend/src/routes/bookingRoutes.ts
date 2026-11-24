import { Router } from 'express';
import {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
} from '../controllers/bookingController';

const router = Router();

router.get('/', getBookings);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBooking);

export default router;
