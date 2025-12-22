import { generateChatResponse } from '../services/geminiService.js';

export const sendMessage = async (req, res) => {
    try {
        const { message, userLocation } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ message: 'Tin nhắn không được để trống' });
        }

        // Generate response using Gemini
        const result = await generateChatResponse(message, userLocation);

        if (!result.success) {
            return res.status(500).json({ message: result.message });
        }

        return res.status(200).json({
            message: result.message,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Chat error:', error);
        return res.status(500).json({
            message: 'Đã xảy ra lỗi khi xử lý tin nhắn. Vui lòng thử lại sau.'
        });
    }
};
