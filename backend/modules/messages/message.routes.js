import express from 'express';

import protect from '../../middleware/auth.middleware.js';

import {
  createConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
} from './message.controller.js';

const router = express.Router();

router.use(protect);

/////////////////////////////////////////////////////
// CONVERSATIONS
/////////////////////////////////////////////////////

router.post('/conversations', createConversation);

router.get('/conversations', getUserConversations);

/////////////////////////////////////////////////////
// MESSAGES
/////////////////////////////////////////////////////

router.get('/conversations/:id/messages', getConversationMessages);

router.post('/conversations/:conversationId/messages', sendMessage);

router.patch('/conversations/:id/read', markMessagesAsRead);

export default router;
