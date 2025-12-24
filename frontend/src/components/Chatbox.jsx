import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { FaRobot, FaPaperPlane, FaTimes, FaCommentDots } from 'react-icons/fa';

const Chatbox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: '👋 Xin chào! Tôi là trợ lý AI của GrubGo. Tôi có thể giúp bạn:\n\n🍔 Gợi ý món ăn ngon\n📍 Tìm quán ăn gần bạn\n❓ Trả lời câu hỏi về dịch vụ\n\nBạn cần giúp gì?',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Draggable state
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const buttonRef = useRef(null);

    // Initialize position to bottom-right on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPosition({
                x: window.innerWidth - 88, // 24px right margin + 64px width
                y: window.innerHeight - 88 // 24px bottom margin + 64px height
            });
        }
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');

        // Add user message
        setMessages(prev => [...prev, {
            type: 'user',
            text: userMessage,
            timestamp: new Date()
        }]);

        setIsLoading(true);

        try {
            const response = await axios.post(`${serverUrl}/api/chat/message`, {
                message: userMessage
            });

            // Add bot response
            setMessages(prev => [...prev, {
                type: 'bot',
                text: response.data.message,
                timestamp: new Date()
            }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                type: 'bot',
                text: '😔 Xin lỗi, tôi gặp sự cố. Vui lòng thử lại sau.',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        '🍜 Gợi ý món ăn hôm nay',
        '📍 Quán ăn gần tôi',
        '💰 Món ăn dưới 50k'
    ];

    const handleQuickAction = (action) => {
        setInputMessage(action);
    };

    // Drag handlers
    const handleMouseDown = (e) => {
        if (isOpen) return;
        isDragging.current = false;
        dragStart.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };

        const handleMouseMove = (moveEvent) => {
            isDragging.current = true;
            const newX = Math.min(Math.max(0, moveEvent.clientX - dragStart.current.x), window.innerWidth - 64);
            const newY = Math.min(Math.max(0, moveEvent.clientY - dragStart.current.y), window.innerHeight - 64);
            setPosition({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // Touch handlers for mobile drag
    const handleTouchStart = (e) => {
        if (isOpen) return;
        isDragging.current = false;
        const touch = e.touches[0];
        dragStart.current = {
            x: touch.clientX - position.x,
            y: touch.clientY - position.y
        };
    };

    const handleTouchMove = (e) => {
        if (isOpen) return;
        isDragging.current = true;
        const touch = e.touches[0];
        const newX = Math.min(Math.max(0, touch.clientX - dragStart.current.x), window.innerWidth - 64);
        const newY = Math.min(Math.max(0, touch.clientY - dragStart.current.y), window.innerHeight - 64);
        setPosition({ x: newX, y: newY });
    };

    const handleClick = () => {
        if (!isDragging.current) {
            setIsOpen(prev => !prev);
        }
    };

    return (
        <div
            className="fixed z-50 transition-all duration-200"
            style={{
                left: isOpen ? undefined : position.x,
                top: isOpen ? undefined : position.y,
                bottom: isOpen ? '24px' : undefined,
                right: isOpen ? '24px' : undefined,
            }}
        >
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-96 h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] text-white p-4 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                <FaRobot className="text-[#ff4d2d] text-xl" />
                            </div>
                            <div>
                                <h3 className="font-bold">GrubGo AI</h3>
                                <p className="text-xs opacity-90">Trợ lý ảo của bạn</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.type === 'user'
                                        ? 'bg-[#ff4d2d] text-white rounded-br-none'
                                        : 'bg-white text-gray-800 shadow-md rounded-bl-none'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
                                    <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-800 shadow-md rounded-2xl rounded-bl-none px-4 py-3">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    {messages.length === 1 && (
                        <div className="p-3 bg-white border-t border-gray-200 shrink-0">
                            <p className="text-xs text-gray-500 mb-2">Gợi ý nhanh:</p>
                            <div className="flex flex-wrap gap-2">
                                {quickActions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickAction(action)}
                                        className="text-xs px-3 py-2 bg-orange-50 text-[#ff4d2d] rounded-full hover:bg-orange-100 transition-colors"
                                    >
                                        {action}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 shrink-0">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim() || isLoading}
                                className="w-12 h-12 bg-[#ff4d2d] text-white rounded-full flex items-center justify-center hover:bg-[#e63c1d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaPaperPlane />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Floating Button - Only show when chat is closed */}
            {!isOpen && (
                <button
                    ref={buttonRef}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onClick={handleClick}
                    className="w-16 h-16 bg-gradient-to-r from-[#ff4d2d] to-[#ff6b4d] text-white rounded-full shadow-2xl flex items-center justify-center cursor-move hover:scale-105 active:scale-95 transition-transform touch-none"
                    style={{ touchAction: 'none' }} // Prevent scrolling while dragging on touch devices
                >
                    <FaCommentDots className="text-2xl" />
                </button>
            )}
        </div>
    );
};

export default Chatbox;
