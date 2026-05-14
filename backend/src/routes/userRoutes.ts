import express from 'express';
import { loginOrRegister, getUserHistory } from '../controllers/userController';

const router = express.Router();

router.post('/login', loginOrRegister);
router.get('/:userId/history', getUserHistory);
export default router;