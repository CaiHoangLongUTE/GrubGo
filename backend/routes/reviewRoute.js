import express from 'express';
import { createReview, getShopReviews, getUserReviews, getDeliveryPersonReviews, getReviewByShopOrderId } from '../controllers/reviewController.js';
import isAuth from '../middlewares/isAuth.js';
import { upload } from '../middlewares/multer.js';

const reviewrouter = express.Router();

reviewrouter.post('/create', isAuth, upload.array('images', 2), createReview);
reviewrouter.get('/shop/:shopId', getShopReviews);
reviewrouter.get('/user', isAuth, getUserReviews);
reviewrouter.get('/delivery/:deliveryPersonId', getDeliveryPersonReviews);
reviewrouter.get('/by-shop-order/:shopOrderId', isAuth, getReviewByShopOrderId);

export default reviewrouter;
