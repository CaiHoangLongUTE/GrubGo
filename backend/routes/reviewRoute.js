import express from 'express';
import { createReview, getShopReviews, getUserReviews, getDeliveryPersonReviews, getReviewByShopOrderId } from '../controllers/reviewController.js';
import isAuth from '../middlewares/isAuth.js';
import { upload } from '../middlewares/multer.js';

const router = express.Router();

router.post('/create', isAuth, upload.array('images', 2), createReview);
router.get('/shop/:shopId', getShopReviews);
router.get('/user', isAuth, getUserReviews);
router.get('/delivery/:deliveryPersonId', getDeliveryPersonReviews);
router.get('/by-shop-order/:shopOrderId', isAuth, getReviewByShopOrderId);

export default router;
