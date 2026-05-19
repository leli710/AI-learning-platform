import { Router } from 'express';
import { generateLesson, getUserHistory } from '../controllers/PromptController';
import { sendLessonEmail } from '../controllers/EmailController';

const router = Router();

router.post('/generate', generateLesson);
router.get('/history/:userId', getUserHistory);
router.post('/send-email', sendLessonEmail);

export default router;
