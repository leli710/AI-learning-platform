import { Router } from 'express';
import { getAllCourses, createCourse } from '../controllers/courseController';

const router = Router();

router.get('/', getAllCourses);
router.post('/', createCourse);

export default router;
