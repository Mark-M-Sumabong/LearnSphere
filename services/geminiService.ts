
import { GoogleGenAI, Type } from "@google/genai";
import { Course, Module, Quiz, SkillLevel } from '../types';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
    if (aiClient) {
        return aiClient;
    }

    const env = (globalThis as any).process?.env;
    if (!env?.API_KEY || env.API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        let errorMessage = "API_KEY environment variable not set.";
        if (env?.API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            errorMessage = "Google Gemini API Key is a placeholder. Please replace 'YOUR_GEMINI_API_KEY_HERE' in index.html with your actual key.";
        }
        throw new Error(errorMessage);
    }

    aiClient = new GoogleGenAI({ apiKey: env.API_KEY });
    return aiClient;
}

const curriculumSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "The overall title of the course." },
        description: { type: Type.STRING, description: "A brief, one-paragraph description of what the course covers." },
        modules: {
            type: Type.ARRAY,
            description: "An array of modules for the course.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the module." },
                    lessons: {
                        type: Type.ARRAY,
                        description: "An array of lessons within the module.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: "The title of the lesson." }
                            },
                            required: ["title"]
                        }
                    }
                },
                required: ["title", "lessons"]
            }
        }
    },
    required: ["title", "description", "modules"]
};

const quizSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "The title of the quiz, based on the module." },
        questions: {
            type: Type.ARRAY,
            description: "An array of multiple-choice questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    questionText: { type: Type.STRING, description: "The text of the question." },
                    options: {
                        type: Type.ARRAY,
                        description: "An array of 4 strings representing the possible answers.",
                        items: { type: Type.STRING }
                    },
                    correctAnswerIndex: { type: Type.INTEGER, description: "The 0-based index of the correct answer in the 'options' array." },
                    explanation: { type: Type.STRING, description: "A brief explanation of why the correct answer is correct." }
                },
                required: ["questionText", "options", "correctAnswerIndex", "explanation"]
            }
        }
    },
    required: ["title", "questions"]
}

export const generateAssessment = async (topic: string): Promise<Quiz> => {
    const ai = getAiClient();
    const systemInstruction = "You are an expert assessment designer. Your task is to create a 15-question, effective multiple-choice quiz to assess a user's proficiency on a given topic. The questions should progressively increase in difficulty to gauge the user's skill level accurately, from beginner to advanced concepts.";
    const prompt = `Create a comprehensive 15-question multiple-choice assessment quiz for the topic: "${topic}". The questions must cover a wide range of difficulties, from fundamental beginner concepts to complex advanced topics, to accurately gauge the user's proficiency. Each question must have exactly 4 options: one correct answer and three plausible but incorrect distractors.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: quizSchema,
        },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    if (parsedJson && parsedJson.title && parsedJson.questions) {
        // Customize title
        parsedJson.title = `Skill Assessment: ${topic}`;
        return parsedJson as Quiz;
    } else {
        throw new Error("AI response did not match the expected quiz structure for assessment.");
    }
};

export const evaluateAssessment = async (topic: string, score: number): Promise<SkillLevel> => {
    const ai = getAiClient();
    const systemInstruction = "You are an expert skill evaluator. Based on a user's quiz score, determine their proficiency level. Respond with only a single word: 'Beginner', 'Intermediate', or 'Advanced'. Do not add any other text or punctuation.";
    
    let description;
    if (score < 0.4) {
        description = "very low";
    } else if (score < 0.7) {
        description = "medium";
    } else {
        description = "high";
    }

    const prompt = `A user took a skill assessment on the topic "${topic}" and achieved a ${description} score of ${Math.round(score * 100)}%. Based on this, what is their skill level?`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction
        },
    });

    const skillLevel = response.text.trim();
    if (skillLevel === 'Beginner' || skillLevel === 'Intermediate' || skillLevel === 'Advanced') {
        return skillLevel;
    }

    console.warn(`Unexpected skill level from AI: '${skillLevel}'. Defaulting to 'Beginner'.`);
    return 'Beginner';
};

export const generateCurriculum = async (topic: string, skillLevel: SkillLevel = 'Beginner'): Promise<Course> => {
    const ai = getAiClient();
    const systemInstruction = "You are an expert instructional designer. Your task is to create a comprehensive, well-structured course curriculum for a learning platform like Udemy or Coursera, tailored to the user's specified skill level. The curriculum should be engaging and logically structured.";
    const prompt = `Create a course outline for the topic: "${topic}", specifically designed for a learner with a skill level of '${skillLevel}'.
    
    - For 'Beginner', start with the absolute fundamentals.
    - For 'Intermediate', assume basic knowledge and focus on core concepts and practical application.
    - For 'Advanced', focus on complex topics, best practices, and advanced techniques.
    
    The course should be divided into 5-7 logical modules. Each module should contain 3-5 specific lessons. The lesson titles should be concise and action-oriented.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: curriculumSchema,
        },
    });
    
    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    if (parsedJson && parsedJson.title && parsedJson.modules) {
        const course = parsedJson as Course;
        course.title = `${course.title} (${skillLevel})`;
        return course;
    } else {
        throw new Error("AI response did not match the expected course structure.");
    }
};

export const generateLessonContent = async (courseTopic: string, lessonTitle: string): Promise<string> => {
    const ai = getAiClient();
    const systemInstruction = "You are an expert teacher and content creator. You write clear, engaging, and informative educational content formatted for a web-based learning platform. Use markdown-like syntax for structure.";
    const prompt = `
    Generate the detailed content for a lesson titled "${lessonTitle}" which is part of a larger course on "${courseTopic}".
    
    The content should be:
    1.  **Well-structured:** Use headings, bullet points, and numbered lists to organize information.
    2.  **Beginner-friendly:** Explain concepts clearly, avoiding jargon where possible or defining it if necessary.
    3.  **Comprehensive:** Cover the key aspects of the lesson topic thoroughly.
    4.  **Engaging:** Use examples, analogies, or hypothetical scenarios to illustrate points.
    5.  **Actionable:** End with a summary or key takeaways.

    **Formatting Rules:**
    - Use '### ' for main headings.
    - Use '**' for bold text.
    - Use '*' for bullet points.
    - For regular code blocks, use \`\`\`language\\ncode\\n\`\`\` (e.g., \`\`\`javascript).
    - **For interactive command-line examples, use the language hint \`bash-interactive\`**. This will create a simulated terminal for the user. For example:
      \`\`\`bash-interactive
      # You can try these commands in the interactive terminal below!
      ls -a
      echo "Hello World" > hello.txt
      cat hello.txt
      \`\`\`
    - Ensure there are no more than 3 headings in the content.

    Generate the content now.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction,
        },
    });

    return response.text;
};

export const generateQuiz = async (courseTitle: string, module: Module): Promise<Quiz> => {
    const ai = getAiClient();
    const systemInstruction = "You are an expert educator who creates engaging and effective multiple-choice quizzes. The goal is to test the learner's understanding of the key concepts from the module lessons. Generate a quiz with exactly 10 questions. Each question must have exactly 4 options: one correct answer and three plausible but incorrect distractors.";
    
    const lessonTitles = module.lessons.map(l => `"${l.title}"`).join(', ');
    const prompt = `Generate a 10-question multiple-choice quiz for the module titled "${module.title}" in the course "${courseTitle}". The module covers the following lessons: ${lessonTitles}. The quiz should test the main concepts a beginner would need to learn from these topics.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: quizSchema,
        },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    if (parsedJson && parsedJson.title && parsedJson.questions) {
        return parsedJson as Quiz;
    } else {
        throw new Error("AI response did not match the expected quiz structure.");
    }
};

export const generateHint = async (courseTitle: string, questionText: string, options: string[]): Promise<string> => {
    const ai = getAiClient();
    const systemInstruction = "You are a helpful teaching assistant. Your goal is to provide a subtle hint for a quiz question. The hint should guide the student toward the correct answer without explicitly revealing it. The hint should be concise (1-2 sentences).";

    const optionsText = options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');

    const prompt = `
    Course: "${courseTitle}"
    Question: "${questionText}"
    Options:
    ${optionsText}

    Provide a concise hint for this question. Do not state which option is correct.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction,
        },
    });

    return response.text;
};

export const askTutor = async (courseTitle: string, lessonTitle: string, lessonContent: string, question: string): Promise<string> => {
    const ai = getAiClient();
    const systemInstruction = "You are 'LearnSphere AI Tutor', a friendly and knowledgeable teaching assistant. Your goal is to answer a student's question clearly and concisely. You should ONLY answer questions related to the provided lesson content and title. If the question is off-topic, politely state that you can only help with the current lesson. Your answers should be helpful and encouraging, but do not give away answers to potential quiz questions. Instead, guide the student to understand the concepts. Use markdown for formatting if it helps clarity.";

    const prompt = `
    The student is currently learning about:
    Course: "${courseTitle}"
    Lesson: "${lessonTitle}"

    Here is the content of the lesson they are viewing:
    ---
    ${lessonContent}
    ---

    The student has the following question:
    "${question}"

    Please provide a helpful, on-topic answer based on the lesson context.
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction,
        },
    });

    return response.text;
};

export const generateStudyLink = async (courseTitle: string, moduleTitle: string): Promise<string> => {
    const ai = getAiClient();
    const prompt = `As a helpful study assistant, your goal is to find a single, high-quality, and relevant online article or resource for a student who failed a quiz on a specific topic. Respond with ONLY the URL. Do not add any other text, explanation, or markdown.

Find the best single online article or tutorial for a beginner learning about "${moduleTitle}" in a course on "${courseTitle}".`;

    const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       contents: prompt,
       config: {
         tools: [{googleSearch: {}}],
       },
    });

    const url = response.text.trim();

    try {
        new URL(url);
        return url;
    } catch (_) {
        console.warn("AI did not return a valid URL, checking grounding metadata...");
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks && groundingChunks.length > 0) {
            for (const chunk of groundingChunks) {
                if ((chunk as any).web && (chunk as any).web.uri) {
                    return (chunk as any).web.uri;
                }
            }
        }
        console.warn("No valid URL in grounding metadata, falling back to Google search link.");
        return `https://www.google.com/search?q=${encodeURIComponent(moduleTitle + " " + courseTitle + " tutorial")}`;
    }
};
