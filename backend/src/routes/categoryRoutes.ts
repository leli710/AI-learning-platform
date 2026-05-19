import express from 'express';
import { createCategory, getCategories } from '../controllers/categoryController';
import { createSubCategory, getSubCategoriesByParent, getAllSubCategories, getAiLearningPlan } from '../controllers/subCategoryController';

const router = express.Router();

router.get('/', getCategories);
router.post('/', createCategory);
router.post('/sub', createSubCategory);
router.get('/subcategories', getAllSubCategories);
router.get('/sub/:categoryId', getSubCategoriesByParent);
router.post('/sub/:id/learn', getAiLearningPlan);

export default router;
