const Message = require('../models/Message');
const Group = require('../models/Group');

/**
 * GET /api/messages/group/:groupId
 * Get messages for a group (access controlled)
 */
const getGroupMessages = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const companyId = req.user.companyId._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    // Verify group exists and user has access
    const group = await Group.findOne({ _id: groupId, companyId });
    if (!group) return res.status(404).json({ success: false, message: 'Group not found.' });

    // Employee: check department access
    if (req.user.role === 'EMPLOYEE') {
      const userDeptId = req.user.departmentId?._id?.toString();
      if (group.departmentId.toString() !== userDeptId) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    const messages = await Message.find({ groupId, companyId, isDeleted: false })
      .populate('senderId', 'name email role avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Message.countDocuments({ groupId, companyId, isDeleted: false });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/messages
 * Send a message (REST fallback - primary via Socket.io)
 */
const sendMessage = async (req, res, next) => {
  try {
    const { content, groupId } = req.body;
    const companyId = req.user.companyId._id;

    const group = await Group.findOne({ _id: groupId, companyId });
    if (!group) return res.status(404).json({ success: false, message: 'Group not found.' });

    if (req.user.role === 'EMPLOYEE') {
      const userDeptId = req.user.departmentId?._id?.toString();
      if (group.departmentId.toString() !== userDeptId) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }

    const message = await Message.create({
      content,
      senderId: req.user._id,
      groupId,
      companyId,
      departmentId: group.departmentId
    });

    const populated = await message.populate('senderId', 'name email role avatar');

    res.status(201).json({ success: true, data: { message: populated } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/messages/:messageId
 * Soft delete a message (own messages or admin)
 */
const deleteMessage = async (req, res, next) => {
  try {
    const companyId = req.user.companyId._id;
    const query = { _id: req.params.messageId, companyId };
    if (req.user.role !== 'ADMIN') query.senderId = req.user._id;

    const message = await Message.findOneAndUpdate(
      query,
      { isDeleted: true },
      { new: true }
    );

    if (!message) return res.status(404).json({ success: false, message: 'Message not found.' });
    res.json({ success: true, message: 'Message deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getGroupMessages, sendMessage, deleteMessage };
