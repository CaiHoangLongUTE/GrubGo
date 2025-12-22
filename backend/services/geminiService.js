import { GoogleGenerativeAI } from '@google/generative-ai';
import Item from '../models/itemModel.js';
import Shop from '../models/shopModel.js';


export const generateChatResponse = async (userMessage, userLocation = null) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is missing");
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Get context from database
        const items = await Item.find()
            .populate('shop', 'name city address')
            .populate('category', 'name')
            .limit(50)
            .lean();

        const shops = await Shop.find()
            .select('name city address')
            .limit(30)
            .lean();

        // Build context for Gemini
        const context = `
Bạn là trợ lý AI của GrubGo - nền tảng đặt đồ ăn trực tuyến tại Việt Nam.

**Thông tin về website:**
- GrubGo giúp người dùng đặt đồ ăn từ các quán ăn địa phương
- Hỗ trợ thanh toán online(vnpay) và COD
- Phí ship tính theo khoảng cách (15,000₫ cơ bản + 5,000₫/km sau 3km đầu)
- Có 3 vai trò: Khách hàng, Chủ quán, Người giao hàng

**Danh sách món ăn hiện có (${items.length} món):**
${items.map(item => `- ${item.name} (${item.price.toLocaleString()}₫) - ${item.category?.name || 'N/A'} - Quán: ${item.shop?.name || 'N/A'}`).join('\n')}

**Danh sách quán ăn (${shops.length} quán):**
${shops.map(shop => `- ${shop.name} - ${shop.address}, ${shop.city}`).join('\n')}

**Nhiệm vụ của bạn:**
1. Gợi ý món ăn phù hợp với yêu cầu người dùng
2. Trả lời câu hỏi về dịch vụ, chính sách
3. Giúp tìm quán ăn gần vị trí người dùng
4. Luôn trả lời bằng tiếng Việt, thân thiện và hữu ích
5. Nếu được hỏi về giá, luôn format với dấu phẩy và ₫
6. Gợi ý tối đa 3-5 món mỗi lần

**Lưu ý:**
- Nếu người dùng hỏi về món ăn không có trong danh sách, lịch sự nói "Hiện tại chúng tôi chưa có món này"
- Khi gợi ý món, ưu tiên món có giá phù hợp và đa dạng
- Format response đẹp với emoji và bullet points
`;

        // Initialize Gemini model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                maxOutputTokens: 1000,
            }
        });

        // Create chat with context
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: context }],
                },
                {
                    role: "model",
                    parts: [{ text: "Xin chào! Tôi đã hiểu rõ về GrubGo và sẵn sàng giúp đỡ bạn. Bạn muốn tôi gợi ý món ăn gì hôm nay?" }],
                },
            ],
        });

        // Send user message
        const result = await chat.sendMessage(userMessage);
        const response = result.response.text();

        return {
            success: true,
            message: response
        };

    } catch (error) {
        console.error('Gemini API Error:', error);
        return {
            success: false,
            message: `Lỗi Gemini: ${error.message}`
        };
    }
}
