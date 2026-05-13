import express from 'express';
import { createCategory, getCategories } from '../controllers/categoryController';
const router = express.Router();
// נתיב לקבלת כל הקטגוריות: GET http://localhost:5000/api/categories
router.get('/', getCategories);
// נתיב ליצירת קטגוריה חדשה: POST http://localhost:5000/api/categories
router.post('/', createCategory);

export default router;