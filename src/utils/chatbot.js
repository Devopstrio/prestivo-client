import axios from "axios";
import API_BASE_URL from "../config";

// FAQ Categories
export const categories = [
    { id: 'all', name: 'All Questions', icon: 'FaQuestionCircle', count: 21 },
    { id: 'shipping', name: 'Shipping & Delivery', icon: 'FaShippingFast', count: 5 },
    { id: 'returns', name: 'Returns & Refunds', icon: 'FaUndo', count: 4 },
    { id: 'payments', name: 'Payments & Subscriptions', icon: 'FaCreditCard', count: 4 },
    { id: 'account', name: 'My Account & Orders', icon: 'FaUser', count: 4 },
    { id: 'products', name: 'Products & Availability', icon: 'FaBox', count: 3 },
    { id: 'security', name: 'Data & Privacy', icon: 'FaShieldAlt', count: 1 },
    { id: 'assistant', name: 'About Zara AI', icon: 'FaRobot', count: 7 },
    { id: 'store', name: 'About This Store', icon: 'FaStore', count: 6 }

];

// FAQ Items organized by categories
export const faqItems = [
    // Shipping & Delivery
    {
        id: 1,
        category: 'shipping',
        question: 'How long does delivery take?',
        answer: 'Orders are usually delivered within 3 to 7 business days, depending on your location.',
        keywords: ['delivery', 'shipping', 'time', 'long', 'take', 'when', 'arrive']
    },
    {
        id: 2,
        category: 'shipping',
        question: 'Do you offer free shipping?',
        answer: 'Yes, free standard shipping is available on all orders.',
        keywords: ['free', 'shipping', 'delivery', 'cost', 'charge']
    },
    {
        id: 3,
        category: 'shipping',
        question: 'Can I track my order?',
        answer: 'Absolutely! Once your order is placed, go to your "My Orders" dashboard to track it.',
        keywords: ['track', 'tracking', 'order', 'location', 'where', 'package']
    },
    {
        id: 4,
        category: 'shipping',
        question: 'Can I change my delivery address after placing an order?',
        answer: "No, you can't change your address after the order is placed. It will be delivered to the address provided.",
        keywords: ['change', 'address', 'delivery', 'modify', 'update', 'wrong address']
    },
    {
        id: 5,
        category: 'shipping',
        question: 'What if I miss my delivery?',
        answer: 'The courier will attempt delivery up to 2 more times. If missed, the package will be returned to the warehouse for rescheduling.',
        keywords: ['miss', 'delivery', 'not home', 'absent', 'redelivery', 'reschedule']
    },

    // Returns & Refunds
    {
        id: 6,
        category: 'returns',
        question: 'How do I return a product?',
        answer: 'Go to the "My Orders" page, select the item, and follow the instructions to request a return or replacement within 7 days of delivery.',
        keywords: ['return', 'product', 'how', 'process', 'send back']
    },
    {
        id: 7,
        category: 'returns',
        question: 'When will I receive my refund?',
        answer: 'Refunds take 3–5 business days after the returned product is received and verified.',
        keywords: ['refund', 'money', 'when', 'time', 'received', 'payment back']
    },
    {
        id: 8,
        category: 'returns',
        question: 'Are return pickups free?',
        answer: 'Yes, return pickups are completely free for eligible items.',
        keywords: ['return', 'pickup', 'free', 'cost', 'charge', 'pick up']
    },
    {
        id: 9,
        category: 'returns',
        question: 'What if an item is damaged or incorrect?',
        answer: 'Please contact support immediately with a photo and order ID. We will process a refund or replacement promptly.',
        keywords: ['damaged', 'incorrect', 'wrong', 'broken', 'defective', 'faulty']
    },

    // Payments & Subscriptions
    {
        id: 10,
        category: 'payments',
        question: 'What payment methods are supported?',
        answer: 'We accept UPI, credit/debit cards, net banking, wallet payments, and Cash on Delivery (COD) in select areas.',
        keywords: ['payment', 'methods', 'credit card', 'debit', 'UPI', 'COD', 'cash on delivery']
    },
    {
        id: 11,
        category: 'payments',
        question: 'Is it safe to make online payments?',
        answer: 'Yes, all online payments are processed through secure, encrypted gateways.',
        keywords: ['safe', 'secure', 'payment', 'online', 'security', 'protected']
    },
    {
        id: 12,
        category: 'payments',
        question: 'Can I change my payment method after placing an order?',
        answer: 'You can change payment methods for future orders, but not after an order has already been placed.',
        keywords: ['change', 'payment', 'method', 'modify', 'update', 'different payment']
    },

    // Account & Orders
    {
        id: 13,
        category: 'account',
        question: 'Do I need an account to place an order?',
        answer: 'Yes, creating an account is required to place orders so you can track orders and enjoy faster checkout.',
        keywords: ['account', 'required', 'necessary', 'sign up', 'register', 'order']
    },
    {
        id: 14,
        category: 'account',
        question: 'How can I view my order history?',
        answer: 'Log in to your account and navigate to the "My Orders" section to view your order details.',
        keywords: ['get', 'history', 'view', 'see', 'previous']
    },
    {
        id: 15,
        category: 'account',
        question: 'How can I cancel an order?',
        answer: 'Orders can be canceled within a limited time after placing them. Go to the My Orders page to request cancellation. After a few hours, we will process the cancellation. If a refund is applicable, it will be credited within 3 to 7 business days.',
        keywords: ['cancel', 'order', 'stop', 'remove', 'delete order']
    },
    {
        id: 16,
        category: 'account',
        question: 'How do I update my address or contact details?',
        answer: 'Go to the "My Profile" section in your account dashboard to update your personal information.',
        keywords: ['address', 'contact', 'details', 'change', 'modify', 'profile']
    },
    {
        id: 17,
        category: 'account',
        question: 'How do I update my password?',
        answer: 'Go to the "Forget Password or My Profile" then u can change your password.',
        keywords: ['update', 'change', 'password', 'modify']
    },

    // Products & Availability
    {
        id: 18,
        category: 'products',
        question: 'Are the products authentic?',
        answer: 'Yes, all products are 100% authentic and sourced only from verified brands and sellers.',
        keywords: ['authentic', 'genuine', 'real', 'original', 'quality']
    },
    {
        id: 19,
        category: 'products',
        question: 'Do you offer product customization?',
        answer: 'Some products offer customization options. Check the product page for availability.',
        keywords: ['customization', 'custom', 'personalize', 'modify', 'change product']
    },

    // Security & Privacy
    {
        id: 20,
        category: 'security',
        question: 'How is my personal data protected?',
        answer: 'We take data privacy seriously. All sensitive information is encrypted and will not be shared without your consent.',
        keywords: ['data', 'privacy', 'security', 'personal', 'information', 'protected']
    },
    // Assistant / Personality Questions
    {
        id: 21,
        category: 'assistant',
        question: 'What is your name?',
        answer: 'My name is Zara, your smart shopping assistant! 😊',
        keywords: ['your name', 'who are you']
    },
    {
        id: 22,
        category: 'assistant',
        question: 'Who created you?',
        answer: 'I was created by the Devopstrio development team to assist customers 24/7! 🤖',
        keywords: ['who created you', 'your creator', 'who made you']
    },
    {
        id: 23,
        category: 'assistant',
        question: 'What can you do?',
        answer: 'I can help you with orders, delivery tracking, returns, payments, product inquiries and general support! 😊',
        keywords: ['what can you do', 'your abilities', 'help', 'support']
    },
    {
        id: 24,
        category: 'assistant',
        question: 'Are you a robot?',
        answer: 'Yes! I am an AI-powered virtual assistant built to help you anytime. 🤖✨',
        keywords: ['robot', 'are you real', 'are you ai', 'are you human']
    },
    {
        id: 25,
        category: 'assistant',
        question: 'Where are you from?',
        answer: 'I live in the cloud ☁️ and work inside the Zara system to assist you!',
        keywords: ['where are you from', 'your place']
    },
    {
        id: 26,
        category: 'assistant',
        question: 'How old are you?',
        answer: 'I don’t age like humans! I stay updated and smart at all times. 😄',
        keywords: ['age', 'old', 'how old']
    },
    {
        id: 27,
        category: 'assistant',
        question: 'Are you human?',
        answer: 'I am not human — I’m an AI assistant designed to help you with your shopping needs! 🤖',
        keywords: ['human', 'are you human', 'real human']
    },
    // Store / Website Information
    {
        id: 28,
        category: 'store',
        question: 'What is this website?',
        answer: 'This is Devopstrio’s official online shopping website where you can browse, order, and purchase products safely and easily.',
        keywords: ['what is this website', 'this website', 'website info', 'site about']
    },
    {
        id: 29,
        category: 'store',
        question: 'What does this store offer?',
        answer: 'We offer a variety of high-quality products with secure payment options, fast delivery, and 24/7 support through Zara AI.',
        keywords: ['what do you sell', 'products', 'store offer', 'items available']
    },
    {
        id: 30,
        category: 'store',
        question: 'Is this website safe to use?',
        answer: 'Yes! Devopstrio uses encrypted security to protect your personal details and payment information at all times.',
        keywords: ['safe', 'secure website', 'is this safe', 'security']
    },
    {
        id: 31,
        category: 'store',
        question: 'Who manages this website?',
        answer: 'This website is managed by the Devopstrio team to ensure a smooth and trusted shopping experience for customers.',
        keywords: ['who manages', 'owner', 'who runs this website']
    },
    {
        id: 32,
        category: 'store',
        question: 'How does this website work?',
        answer: 'You can browse products, add them to your cart, place orders, track deliveries, and manage your account easily through this website.',
        keywords: ['how website works', 'how it works', 'site work']
    },
    {
        id: 33,
        category: 'store',
        question: 'How can I contact support?',
        answer: 'You can contact our support team anytime through email at info@devopstrioglobal.com or chat with Zara AI.',
        keywords: ['contact', 'support', 'help', 'customer service']
    }


];

// Greeting patterns and responses
export const greetingPatterns = {
    greetings: [
        'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
        'hi there', 'hello there', 'hey there', 'howdy', 'greetings'
    ],
    howAreYou: [
        'how are you', 'how are you doing', 'how is it going', 'how do you do',
        'what\'s up', 'how you doing', 'how have you been'
    ],
    thanks: [
        'thanks', 'thank you', 'thank you very much', 'thanks a lot', 'thx',
        'appreciate it', 'appreciate your help'
    ],
    goodbye: [
        'bye', 'goodbye', 'see you', 'see ya', 'farewell', 'have a good day',
        'take care', 'talk to you later', 'cya'
    ],
    positive: [
        'good', 'great', 'excellent', 'awesome', 'fantastic', 'wonderful',
        'perfect', 'amazing', 'nice', 'cool'
    ],
    negative: [
        'bad', 'not good', 'terrible', 'awful', 'horrible', 'not well'
    ]
};

// Greeting responses
export const greetingResponses = {
    greetings: [
        "Hello! 👋 How can I assist you today?",
        "Hi there! 😊 What can I help you with?",
        "Hey! Welcome to our support chat. How can I assist you?",
        "Greetings! 🌟 How may I help you today?",
        "Hello! Ready to help with any questions you have!"
    ],
    howAreYou: [
        "I'm doing great, thank you for asking! How can I assist you today? 😊",
        "I'm functioning perfectly and ready to help! What can I do for you?",
        "Doing well, thanks! How about you? What brings you here today?",
        "I'm excellent and eager to help you! What questions do you have?",
        "All systems go! 🚀 How can I make your day better?"
    ],
    thanks: [
        "You're welcome! 😊 Is there anything else I can help you with?",
        "Happy to help! Let me know if you have any other questions!",
        "My pleasure! Don't hesitate to ask if you need anything else!",
        "You're very welcome! 🌟 Feel free to ask more questions anytime!",
        "Glad I could assist! I'm here if you need anything else!"
    ],
    goodbye: [
        "Goodbye! 👋 Feel free to come back if you have more questions!",
        "See you later! 😊 Have a wonderful day!",
        "Take care! Don't hesitate to reach out if you need help again!",
        "Farewell! 🌟 Looking forward to assisting you next time!",
        "Bye! Remember, I'm always here to help with your questions!"
    ],
    positive: [
        "That's wonderful to hear! 😊 How can I assist you today?",
        "Great! I'm here to help make your day even better!",
        "Awesome! What can I do to help you today?",
        "Fantastic! Let me know how I can assist you!",
        "Perfect! I'm ready to help with whatever you need! 🌟"
    ],
    negative: [
        "I'm sorry to hear that. 😔 I hope I can help make your day better!",
        "Oh no! Let me know how I can assist and hopefully improve your day!",
        "I understand. I'm here to help with whatever you need!",
        "Sorry you're having a tough time. How can I help you today?",
        "I'm here for you! What can I do to assist and make things better?"
    ],
    defaultGreeting: [
        "Nice to chat with you! How can I assist you today? 😊",
        "Lovely to hear from you! What can I help you with?",
        "Thanks for reaching out! How may I assist you today?",
        "Welcome! I'm here to help with any questions you have! 🌟"
    ]
};

// Enhanced FAQ search function
export const searchFAQ = (input) => {
    const text = input.toLowerCase().trim();
    if (!text) return null;

    // 1. Check greetings
    const greetingResponse = detectGreeting(text);
    if (greetingResponse) {
        return {
            id: 'greeting',
            category: 'greeting',
            question: input,
            answer: greetingResponse,
            isGreeting: true,
            source: 'greeting'
        };
    }

    // 2. STRICT question-based matching (NO keyword scoring)
    const exactMatch = faqItems.find(
        item => item.question.toLowerCase() === text
    );
    if (exactMatch) return exactMatch;

    // 3. Slightly loose match: if user question contains FAQ question text
    const partialMatch = faqItems.find(
        item => text.includes(item.question.toLowerCase())
    );
    if (partialMatch) return partialMatch;

    // 4. FAQ question contains user text
    const reverseMatch = faqItems.find(
        item => item.question.toLowerCase().includes(text)
    );
    if (reverseMatch) return reverseMatch;

    // 5. No match → return null, let AI answer
    return null;
};


// Detect and respond to greetings
export const detectGreeting = (input) => {
    const text = input.toLowerCase().trim();

    // Check for greetings
    if (greetingPatterns.greetings.some(greeting => text.includes(greeting))) {
        return getRandomResponse(greetingResponses.greetings);
    }

    // Check for "how are you" type questions
    if (greetingPatterns.howAreYou.some(phrase => text.includes(phrase))) {
        return getRandomResponse(greetingResponses.howAreYou);
    }

    // Check for thanks
    if (greetingPatterns.thanks.some(phrase => text.includes(phrase))) {
        return getRandomResponse(greetingResponses.thanks);
    }

    // Check for goodbye
    if (greetingPatterns.goodbye.some(phrase => text.includes(phrase))) {
        return getRandomResponse(greetingResponses.goodbye);
    }

    // Check for positive responses
    if (greetingPatterns.positive.some(word => text === word || text.includes(`i'm ${word}`) || text.includes(`i am ${word}`))) {
        return getRandomResponse(greetingResponses.positive);
    }

    // Check for negative responses
    if (greetingPatterns.negative.some(word => text === word || text.includes(`i'm ${word}`) || text.includes(`i am ${word}`))) {
        return getRandomResponse(greetingResponses.negative);
    }

    // Simple greeting detection (just "hi", "hello", etc.)
    if (text.length <= 10 && greetingPatterns.greetings.some(greeting => text === greeting)) {
        return getRandomResponse(greetingResponses.greetings);
    }

    return null;
};

// Get random response from an array
export const getRandomResponse = (responses) => {
    return responses[Math.floor(Math.random() * responses.length)];
};

// Get time-based greeting
export const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning!";
    if (hour < 18) return "Good afternoon!";
    return "Good evening!";
};

// Enhanced welcome message with time-based greeting
export const getWelcomeMessage = () => {
    const timeGreeting = getTimeBasedGreeting();
    const welcomeMessages = [
        `${timeGreeting} 👋 I'm your Smart Assistant. How can I help you today?`,
        `${timeGreeting} 😊 Welcome! I'm here to answer your questions. What can I help you with?`,
        `${timeGreeting} 🌟 I'm your support assistant. How may I assist you today?`,
        `${timeGreeting} 🎉 Ready to help! What would you like to know?`
    ];
    return getRandomResponse(welcomeMessages);
};

// Get FAQs by category
export const getFAQsByCategory = (categoryId) => {
    if (categoryId === 'all') {
        return faqItems;
    }
    return faqItems.filter(item => item.category === categoryId);
};



// Get quick replies/suggestions
export const getQuickReplies = () => {
    return [
        "Hey Assistant!",
        "How long does delivery take?",
        "How do I return a product?",
        "How can I track my order?"
    ];
};

// OpenAI API Configuration
export const openAIConfig = {
    model: "gpt-4.1-mini",
};


// ✅ UPDATED: Call your backend instead of OpenAI
export const getAIResponse = async (userMessage, faqMatch = null) => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/chatbot`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: userMessage }),
        });

        const data = await res.json();

        return {
            success: data.success,
            answer: data.answer,
            source: "ai",
        };

    } catch (error) {
        console.error("AI error:", error);
        return {
            success: false,
            answer: "AI service unavailable. Try again later.",
            source: "error",
        };
    }
};


// Combined search function that tries FAQ first, then AI
export const searchCombined = async (input) => {
    const text = input.toLowerCase().trim();

    if (!text) return null;

    // Check for greeting
    const greetingResponse = detectGreeting(text);
    if (greetingResponse) {
        return {
            id: 'greeting',
            category: 'greeting',
            question: input,
            answer: greetingResponse,
            isGreeting: true,
            source: 'greeting'
        };
    }

    // First try FAQ search
    const faqMatch = searchFAQ(input);

    if (faqMatch && !faqMatch.isGreeting) {
        return {
            ...faqMatch,
            source: 'faq',
        };
    }

    // If no good FAQ match, prepare for AI fallback
    return {
        id: 'ai-fallback',
        category: 'ai',
        question: input,
        answer: null, // Will be filled by AI
        source: 'ai_pending',
        requiresAI: true
    };
};

// Helper function to calculate FAQ match score
const calculateFaqScore = (input, faqItem) => {
    let score = 0;
    const text = input.toLowerCase().trim();
    const questionWords = faqItem.question.toLowerCase().split(/\s+/);
    const inputWords = text.split(/\s+/);

    // Exact phrase matching
    if (faqItem.question.toLowerCase().includes(text)) {
        score += 10;
    }

    // Word matching in question
    inputWords.forEach(word => {
        if (questionWords.some(qWord => qWord.includes(word) || word.includes(qWord))) {
            score += 3;
        }
    });

    // Keyword matching
    if (faqItem.keywords) {
        inputWords.forEach(word => {
            if (faqItem.keywords.some(keyword => keyword.includes(word) || word.includes(keyword))) {
                score += 2;
            }
        });
    }

    return score;
};

// Default bot messages
export const botMessages = {
    welcome: getWelcomeMessage(),
    noMatch: "I'm checking that for you...",
    aiThinking: "I'm thinking about your question...",
    typing: "Typing...",
    defaultGreeting: "Nice to chat with you! How can I assist you today? 😊",
    aiError: "I apologize, but I'm having trouble processing your request. Please try again or contact our support team.",
    aiDisclaimer: "🤖 Zara's Answer: "
};