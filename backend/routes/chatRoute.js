import express from 'express';
import { sendMessage } from '../controllers/chatController.js';

const chatRouter = express.Router();

// Public route - no authentication required
chatRouter.post('/message', sendMessage);

export default chatRouter;
