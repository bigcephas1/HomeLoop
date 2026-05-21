import Conversation from './conversation.model.js';
import Message from './message.model.js';

/////////////////////////////////////////////////////
// CREATE OR GET CONVERSATION
/////////////////////////////////////////////////////

export const createConversation = async (req, res) => {
  try {
    const { participantId, propertyId } = req.body;

    /////////////////////////////////////////////////////
    // CHECK EXISTING
    /////////////////////////////////////////////////////

    let conversation = await Conversation.findOne({
      participants: {
        $all: [req.user._id, participantId],
      },
      property: propertyId || null,
    });

    /////////////////////////////////////////////////////
    // CREATE NEW
    /////////////////////////////////////////////////////

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, participantId],
        property: propertyId || null,
      });
    }

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name email profilePicture')
      .populate('property', 'title images');

    res.status(200).json(populatedConversation);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// GET USER CONVERSATIONS
/////////////////////////////////////////////////////

export const getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name email profilePicture lastSeen')
      .populate('property', 'title images')
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// GET MESSAGES
/////////////////////////////////////////////////////

export const getConversationMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.id,
    })
      .populate('sender', 'name email profilePicture')
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// SEND MESSAGE
/////////////////////////////////////////////////////

export const sendMessage = async (req, res) => {
  try {
    const { text, media } = req.body;

    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({
        message: 'Conversation not found',
      });
    }

    /////////////////////////////////////////////////////
    // CREATE MESSAGE
    /////////////////////////////////////////////////////

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text,
      media,
      readBy: [req.user._id],
    });

    /////////////////////////////////////////////////////
    // UPDATE CONVERSATION
    /////////////////////////////////////////////////////

    conversation.lastMessage = text || 'Media message';
    conversation.lastMessageAt = new Date();

    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name email profilePicture',
    );

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/////////////////////////////////////////////////////
// MARK AS READ
/////////////////////////////////////////////////////

export const markMessagesAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      {
        conversation: req.params.id,
        readBy: {
          $ne: req.user._id,
        },
      },
      {
        $push: {
          readBy: req.user._id,
        },
      },
    );

    res.status(200).json({
      message: 'Messages marked as read',
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
