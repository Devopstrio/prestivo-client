import React, { useState, useRef, useEffect } from 'react';
import axios from "axios";
import API_BASE_URL from "../config";
import { FaComment, FaTrash, FaTimes, FaClock, FaCircle, FaRobot, FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { IoIosSend } from 'react-icons/io';
import {
    faqItems,
    searchCombined,
    getQuickReplies,
    botMessages,
    getWelcomeMessage,
    getAIResponse
} from '../utils/chatbot';
import '../styles/Chatbot.css';

const Chatbot = () => {
    const [messages, setMessages] = useState(() => {
        const savedMessages = sessionStorage.getItem('chatbotMessages');
        return savedMessages ? JSON.parse(savedMessages) : [
            {
                text: getWelcomeMessage(),
                sender: "bot",
                timestamp: new Date().toISOString(),
                id: Date.now()
            }
        ];
    });

    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isAIProcessing, setIsAIProcessing] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isVoiceSupported, setIsVoiceSupported] = useState(true);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    const isProductQuery = (text) => {
        // Budget / recommendation queries should NOT be blocked
        if (/budget|under|below|less than|recommend|suggest/i.test(text)) {
            return false;
        }

        const keywords = [
            "buy", "available", "stock",
            "sell", "product"
        ];

        return keywords.some(k => text.toLowerCase().includes(k)) &&
            !/price|cost|under|below|less than|budget/i.test(text);
    };



    // ----------------------------------------------------------
    // ⭐ VOICE RECOGNITION SETUP
    // ----------------------------------------------------------
    useEffect(() => {
        // Check if browser supports speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn("Speech recognition not supported in this browser");
            setIsVoiceSupported(false);
            return;
        }

        // Initialize speech recognition
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setVoiceTranscript(''); // Clear previous transcript
            // console.log("Voice recognition started...");
        };

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

            // Update transcript for display only (not in input field)
            setVoiceTranscript(transcript);

            // If final result, stop listening and send message
            if (event.results[0].isFinal) {
                setTimeout(() => {
                    recognition.stop();
                    setIsListening(false);

                    // Auto-send the voice message if there's content
                    if (transcript.trim()) {
                        // Create user message directly without using input field
                        handleVoiceMessage(transcript);
                        setVoiceTranscript(''); // Clear transcript after sending
                    }
                }, 100);
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
            setVoiceTranscript('');

            // Show error message in chat
            if (event.error === 'not-allowed') {
                setMessages(prev => [...prev, {
                    text: "Microphone access denied. Please allow microphone access to use voice input.",
                    sender: "bot",
                    timestamp: new Date().toISOString(),
                    id: Date.now() + Math.random()
                }]);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            // console.log("Voice recognition stopped.");
        };

        recognitionRef.current = recognition;

        // Cleanup on unmount
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // ----------------------------------------------------------
    // ⭐ VOICE CONTROL FUNCTIONS
    // ----------------------------------------------------------
    const startListening = () => {
        if (!isVoiceSupported) {
            setMessages(prev => [...prev, {
                text: "Voice input is not supported in your browser. Please use text input instead.",
                sender: "bot",
                timestamp: new Date().toISOString(),
                id: Date.now() + Math.random()
            }]);
            return;
        }

        if (!recognitionRef.current) {
            console.error("Speech recognition not initialized");
            return;
        }

        try {
            recognitionRef.current.start();
        } catch (error) {
            console.error("Error starting speech recognition:", error);
            setIsListening(false);
            setVoiceTranscript('');
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
            setVoiceTranscript('');
        }
    };

    const toggleVoiceInput = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };


    // ----------------------------------------------------------
    // ⭐ HANDLE VOICE MESSAGE DIRECTLY (without input field)
    // ----------------------------------------------------------
    const handleVoiceMessage = async (transcript) => {
        if (!transcript.trim()) return;

        // FIRST: Check AI Usage Limit
        const aiCheck = await validateAIUsage();
        if (!aiCheck.allowed) {
            const limitMsg = {
                text: aiCheck.message,
                sender: "bot",
                timestamp: new Date().toISOString(),
                id: Date.now() + Math.random()
            };

            setMessages(prev => [...prev, limitMsg]);
            return;   // STOP execution
        }

        // 🧑 USER MESSAGE FROM VOICE
        const userMessage = {
            text: transcript,
            sender: "user",
            timestamp: new Date().toISOString(),
            id: Date.now() + Math.random(),
            isVoice: true // Flag to indicate voice message
        };

        const typingMessage = {
            text: botMessages.typing,
            sender: "bot",
            id: 'typing'
        };

        setMessages(prev => [...prev, userMessage, typingMessage]);
        setIsTyping(true);
        setIsAIProcessing(false);

        // Search for FAQ match
        const faqMatch = await searchCombined(transcript);

        if (faqMatch && !faqMatch.requiresAI) {
            // We have a direct FAQ match or greeting
            setTimeout(() => {
                setMessages(prev => [
                    ...prev.filter(msg => msg.id !== 'typing'),
                    {
                        text: faqMatch.answer,
                        sender: "bot",
                        timestamp: new Date().toISOString(),
                        id: Date.now() + Math.random(),
                        isGreeting: faqMatch.isGreeting,
                        source: faqMatch.source
                    }
                ]);
                setIsTyping(false);
            }, faqMatch.isGreeting ? 500 : 900);
        } else {
            // Need AI assistance
            setIsAIProcessing(true);

            // Show AI thinking message
            setMessages(prev => [
                ...prev.filter(msg => msg.id !== 'typing'),
                {
                    text: botMessages.aiThinking,
                    sender: "bot",
                    id: 'ai-thinking',
                    isAIThinking: true
                }
            ]);

            // Get AI response
            try {
                const aiResponse = await getAIResponse(transcript, faqMatch);

                // Remove thinking message
                setMessages(prev => prev.filter(msg => msg.id !== 'ai-thinking'));

                if (aiResponse.success) {
                    // Format AI response with disclaimer
                    let answer = aiResponse.answer;
                    if (aiResponse.source === 'ai') {
                        answer = `${botMessages.aiDisclaimer}${answer}`;
                    }

                    setMessages(prev => [
                        ...prev,
                        {
                            text: answer,
                            sender: "bot",
                            timestamp: new Date().toISOString(),
                            id: Date.now() + Math.random(),
                            source: aiResponse.source,
                            isAI: aiResponse.source === 'ai'
                        }
                    ]);
                } else {
                    setMessages(prev => [
                        ...prev,
                        {
                            text: botMessages.aiError,
                            sender: "bot",
                            timestamp: new Date().toISOString(),
                            id: Date.now() + Math.random(),
                            source: 'error'
                        }
                    ]);
                }
            } catch (error) {
                console.error('AI processing error:', error);
                setMessages(prev => [
                    ...prev.filter(msg => msg.id !== 'ai-thinking'),
                    {
                        text: botMessages.aiError,
                        sender: "bot",
                        timestamp: new Date().toISOString(),
                        id: Date.now() + Math.random(),
                        source: 'error'
                    }
                ]);
            } finally {
                setIsTyping(false);
                setIsAIProcessing(false);
            }
        }
    };

    // ----------------------------------------------------------
    // ⭐ AI LIMIT VALIDATION - SAME AS HOME AI SEARCH
    // ----------------------------------------------------------
    const validateAIUsage = async () => {
        try {
            const res = await axios.post(`${API_BASE_URL}/api/ai`);
            return { allowed: true, data: res.data };
        } catch (err) {
            return {
                allowed: false,
                message: err.response?.data?.message || "AI request blocked."
            };
        }
    };
    // ----------------------------------------------------------

    useEffect(() => {
        sessionStorage.setItem('chatbotMessages', JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        };
        const timer = setTimeout(scrollToBottom, 50);
        return () => clearTimeout(timer);
    }, [messages]);


    const clearChat = () => {
        setMessages([{
            text: getWelcomeMessage(),
            sender: "bot",
            timestamp: new Date().toISOString(),
            id: Date.now() + 1
        }]);
    };

    const generateMessageId = () => Date.now() + Math.random();

    // ⭐ UPDATED: Enhanced handleSendMessage for TEXT input (AI-enabled product reply)
    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const aiCheck = await validateAIUsage();
        if (!aiCheck.allowed) {
            setMessages(prev => [...prev, {
                text: aiCheck.message,
                sender: "bot",
                timestamp: new Date().toISOString(),
                id: generateMessageId()
            }]);
            return;
        }

        const prompt = inputValue;

        setMessages(prev => [
            ...prev,
            {
                text: prompt,
                sender: "user",
                timestamp: new Date().toISOString(),
                id: generateMessageId()
            },
            { text: botMessages.typing, sender: "bot", id: "typing" }
        ]);

        setInputValue("");
        setIsTyping(true);

        /* =====================================================
           1️⃣ PRODUCT AVAILABILITY → AI RESPONSE (KEY UPDATE)
           ===================================================== */
        try {
            const productRes = await axios.post(
                `${API_BASE_URL}/api/chatbot/check-product`,
                { message: prompt }
            );

            if (productRes.data?.found) {
                // 👉 Ask AI to explain products naturally
                const aiExplain = await axios.post(
                    `${API_BASE_URL}/api/chatbot/ai-product-reply`,
                    {
                        message: prompt,
                        products: productRes.data.products
                    }
                );

                setMessages(prev => [
                    ...prev.filter(m => m.id !== "typing"),
                    {
                        text: `🤖 ${aiExplain.data.answer}`,
                        sender: "bot",
                        timestamp: new Date().toISOString(),
                        id: generateMessageId(),
                        source: "ai",
                        isAI: true
                    }
                ]);

                setIsTyping(false);
                return; // ⛔ STOP → no normal DB reply
            }
        } catch (err) {
            console.error("Product AI reply error", err);
        }

        /* =====================================================
           2️⃣ AI BUDGET-BASED RECOMMENDATION (UNCHANGED)
           ===================================================== */
        try {
            const recRes = await axios.post(
                `${API_BASE_URL}/api/chatbot/recommend-product`,
                { message: prompt }
            );

            if (recRes.data?.success) {
                const { intent, products } = recRes.data;

                const list = products
                    .map(
                        p =>
                            `• ${p.name} – ${p.currency} ${p.totalPrice}\n  🤖 ${p.aiReason}`
                    )
                    .join("\n\n");

                setMessages(prev => [
                    ...prev.filter(m => m.id !== "typing"),
                    {
                        text: `🤖 Based on your budget (${intent.currency} ${intent.maxBudget}), I recommend:\n\n${list}`,
                        sender: "bot",
                        timestamp: new Date().toISOString(),
                        id: generateMessageId(),
                        source: "ai-product",
                        isAI: true
                    }
                ]);

                setIsTyping(false);
                return;
            }
        } catch (err) {
            console.error("Recommendation error", err);
        }

        /* =====================================================
           3️⃣ FAQ (UNCHANGED)
           ===================================================== */
        const faqMatch = await searchCombined(prompt);
        if (faqMatch && !faqMatch.requiresAI) {
            setMessages(prev => [
                ...prev.filter(m => m.id !== "typing"),
                {
                    text: faqMatch.answer,
                    sender: "bot",
                    timestamp: new Date().toISOString(),
                    id: generateMessageId(),
                    source: "faq"
                }
            ]);
            setIsTyping(false);
            return;
        }

        /* =====================================================
           4️⃣ GENERAL AI FALLBACK (UNCHANGED)
           ===================================================== */
        setMessages(prev => [
            ...prev.filter(m => m.id !== "typing"),
            { text: botMessages.aiThinking, sender: "bot", id: "ai-thinking" }
        ]);

        try {
            const aiRes = await getAIResponse(prompt);
            setMessages(prev => [
                ...prev.filter(m => m.id !== "ai-thinking"),
                {
                    text: `${botMessages.aiDisclaimer}${aiRes.answer}`,
                    sender: "bot",
                    timestamp: new Date().toISOString(),
                    id: generateMessageId(),
                    source: "ai",
                    isAI: true
                }
            ]);
        } catch {
            setMessages(prev => [
                ...prev.filter(m => m.id !== "ai-thinking"),
                {
                    text: botMessages.aiError,
                    sender: "bot",
                    timestamp: new Date().toISOString(),
                    id: generateMessageId()
                }
            ]);
        } finally {
            setIsTyping(false);
        }
    };





    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
        // Stop listening when closing chat
        if (isOpen && isListening) {
            stopListening();
        }
    };



    const quickReplies = getQuickReplies();

    return !isOpen ? (
        <button className="chatbotToggle" onClick={toggleChatbot}>
            <FaComment className="chatbotIcon" />
            <span className="notificationDot">
                <FaCircle />
            </span>
        </button>
    ) : (
        <div className="chatbotContainer">
            <div className="chatHeader">
                <div className="headerInfo">
                    <h3 className="headerText">Zara AI</h3>
                    <span className="statusIndicator">
                        {isAIProcessing ? "AI Processing..." : isListening ? "Listening..." : "Online"}
                        {isAIProcessing && <FaRobot className="ai-icon" />}
                        {isListening && <FaMicrophone className="voice-icon" />}
                    </span>
                </div>
                <div className="headerControls">
                    <button onClick={clearChat} className="clearButton" title="Clear chat">
                        <FaTrash />
                    </button>
                    <button onClick={toggleChatbot} className="closeButton">
                        <FaTimes />
                    </button>
                </div>
            </div>

            <div className="chatWindow">
                {/* Voice listening indicator */}
                {isListening && voiceTranscript && (
                    <div className="voiceListeningIndicator">
                        <div className="voiceTranscript">
                            <FaMicrophone className="voice-icon-small" />
                            <span>{voiceTranscript}</span>
                        </div>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`messageBubble ${msg.sender === "bot" ? "botMessage" : "userMessage"} 
                            ${msg.isVoice ? 'voiceMessage' : ''}
                            ${msg.id === 'typing' || msg.id === 'ai-thinking' ? 'typingMessage' : ''}
                            ${msg.isGreeting ? 'greetingMessage' : ''} 
                            ${msg.isAI ? 'aiMessage' : ''}`}
                    >
                        <div className="messageContent">
                            {msg.text}
                            {msg.id !== 'typing' && msg.id !== 'ai-thinking' && (
                                <span className="messageTime">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                    {msg.source === 'ai' && (
                                        <span className="ai-label">AI</span>
                                    )}
                                    {msg.source === 'faq' && (
                                        <span className="faq-label">FAQ</span>
                                    )}
                                    {msg.isVoice && (
                                        <span className="voice-label">
                                            <FaMicrophone />
                                        </span>
                                    )}
                                </span>
                            )}
                        </div>
                        {(msg.id === 'typing' || msg.id === 'ai-thinking') && (
                            <div className="typingIndicator">
                                <span></span><span></span><span></span>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} className="scrollAnchor" />
            </div>

            {messages.length <= 1 && (
                <div className="quickReplies">
                    <p className="quickReplyTitle">Quick questions:</p>
                    {quickReplies.map((reply, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setInputValue(reply);
                                setTimeout(() => handleSendMessage(), 100);
                            }}
                            className="quickReplyButton"
                        >
                            {reply}
                        </button>
                    ))}
                </div>
            )}

            <div className="inputArea">
                <input
                    type="text"
                    value={inputValue}
                    placeholder={isListening ? "Listening... Speak now" : "Type your message here..."}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="inputField"
                    disabled={isTyping || isAIProcessing}
                />
                <button
                    onClick={toggleVoiceInput}
                    className={`voiceButton ${isListening ? 'listening' : ''}`}
                    disabled={isTyping || isAIProcessing}
                    title={isListening ? "Stop listening" : "Start voice input"}
                >
                    {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </button>
                <button
                    onClick={handleSendMessage}
                    className="sendButton"
                    disabled={isTyping || isAIProcessing || !inputValue.trim()}
                >
                    {isTyping || isAIProcessing ? <FaClock /> : <IoIosSend />}
                </button>
            </div>
        </div>
    );
};

export default Chatbot;