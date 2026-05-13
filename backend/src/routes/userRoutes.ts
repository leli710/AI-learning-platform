import express from 'express';
import { registerUser } from '../controllers/userController.ts';

const router = express.Router();

// נתיב הרשמה: POST http://localhost:5000/api/users/register
router.post('/register', registerUser);

export default router;