import { Router } from 'express';
import authRoutes from './auth';
import sweetsRoutes from './sweets';
import ordersRoutes from './orders';
import usersRoutes from './users';
import notificationsRoutes from './notifications';
import analyticsRoutes from './analytics';
import webhooksRoutes from './webhooks';

const router = Router();

router.use('/auth', authRoutes);
router.use('/sweets', sweetsRoutes);
router.use('/orders', ordersRoutes);
router.use('/users', usersRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/webhooks', webhooksRoutes);

export default router;
