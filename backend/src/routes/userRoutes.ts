import express from 'express';
import { loginOrRegister, getAllUsers, requestPasswordReset, resetPassword, changePassword } from '../controllers/userController';

const router = express.Router();

router.post('/login', loginOrRegister);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/change-password', changePassword);
router.get('/admin/all', (req, res, next) => {
    const secret = req.headers['x-admin-secret'];
    if (!secret || secret !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: 'Forbidden: invalid admin secret' });
    }
    next();
}, getAllUsers);

export default router;
