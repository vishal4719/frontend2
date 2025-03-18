/**
 * Utils.js - Functions for parsing API responses and generating questions
 */

// Function to generate a well-structured prompt for Gemini API
export const generatePrompt = (subject, level, questionType) => {
  let prompt = '';
  
  if (questionType === 'MCQ') {
    prompt = `Generate 10 multiple-choice questions (MCQs) for ${subject} at ${level} level.
For each question, provide:
1. The question text
2. Four options labeled A), B), C), and D)
3. The correct answer (e.g., "Correct answer: B")

Format each question like this:
1. [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct answer: [A/B/C/D]

2. [Next question]
...`;
  } else if (questionType === 'Theory') {
    prompt = `Generate 10 theory questions for ${subject} at ${level} level.
Each question should require a short paragraph answer and be numbered.

Format each question like this:
1. [Question text]

2. [Next question]
...`;
  } else {
    // For 'Both' type
    prompt = `Generate 5 multiple-choice questions and 5 theory questions for ${subject} at ${level} level.
For MCQs, provide:
1. The question text
2. Four options labeled A), B), C), and D)
3. The correct answer

For theory questions, provide a question that requires a short paragraph answer.

Format like this:
1. [MCQ question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct answer: [A/B/C/D]

6. [Theory question text]

...`;
  }
  
  return prompt;
};

// Main function to parse Gemini API response based on question type
export const parseGeminiResponse = (content, questionType = 'MCQ') => {
  if (!content || typeof content !== 'string') {
    console.warn("Invalid content received from API:", content);
    return generateDefaultQuestions(10, questionType);
  }
  
  try {
    
    // Handle different question types
    if (questionType === 'MCQ') {
      return parseMCQQuestions(content);
    } else if (questionType === 'Theory') {
      return parseTheoryQuestions(content);
    } else if (questionType === 'Both') {
      // Try to parse both types
      const allQuestions = [];
      
      // First try to find MCQ questions
      const mcqQuestions = parseMCQQuestions(content).slice(0, 5);
      allQuestions.push(...mcqQuestions);
      
      // Then try to find theory questions - focus on lines that don't have options
      const theoryQuestions = parseTheoryQuestions(content).slice(0, 10 - mcqQuestions.length);
      allQuestions.push(...theoryQuestions);
      
      // Fill in with defaults if needed
      while (allQuestions.length < 10) {
        if (allQuestions.length % 2 === 0) {
          allQuestions.push(generateDefaultQuestions(1, 'MCQ')[0]);
        } else {
          allQuestions.push(generateDefaultQuestions(1, 'Theory')[0]);
        }
      }
      
      return allQuestions;
    }
    
    // Default to MCQ if type is not recognized
    return parseMCQQuestions(content);
  } catch (e) {
    console.error('Error parsing Gemini response:', e);
    return generateDefaultQuestions(10, questionType);
  }
};

// Function to parse MCQ questions from API response
const parseMCQQuestions = (content) => {
  // Split by question numbers (1., 2., etc.)
  const questionRegex = /\n\s*(\d+)\.\s+([\s\S]*?)(?=\n\s*\d+\.\s+|$)/g;
  const questions = [];
  let match;
  
  while ((match = questionRegex.exec(content)) !== null) {
    const questionBlock = match[2].trim();
    
    // Skip if this looks like a theory question (no options)
    if (!questionBlock.match(/[A-D]\)/)) {
      continue;
    }
    
    // Extract the question text - everything up to the first option
    const questionTextMatch = questionBlock.match(/^([\s\S]*?)(?=\n\s*[A-D]\))/);
    if (!questionTextMatch) {
      console.warn(`Could not extract question text for question ${match[1]}`);
      continue;
    }
    
    const questionText = questionTextMatch[1].trim();
    
    // Extract options
    const optionsRegex = /([A-D]\))\s+([\s\S]*?)(?=\n\s*[A-D]\)|Correct answer:|$)/g;
    const options = [];
    let optionMatch;
    
    while ((optionMatch = optionsRegex.exec(questionBlock)) !== null) {
      options.push(optionMatch[2].trim());
    }
    
    // Extract correct answer
    const correctAnswerMatch = questionBlock.match(/Correct answer:\s*([A-D])/i);
    let correctAnswer = 0; // Default to A
    
    if (correctAnswerMatch && correctAnswerMatch[1]) {
      const answerLetter = correctAnswerMatch[1].toUpperCase();
      correctAnswer = answerLetter.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
    }
    
    // If we couldn't extract options properly, skip this question
    if (options.length < 2) {
      console.warn(`Not enough options extracted for question ${match[1]}, skipping`);
      continue;
    }
    
    // Ensure we have exactly 4 options
    while (options.length < 4) {
      options.push(`Option ${options.length + 1}`);
    }
    
    // Only keep the first 4 options
    if (options.length > 4) {
      options.splice(4);
    }
    
    questions.push({
      question: questionText,
      options: options,
      correctAnswer: correctAnswer,
      type: 'MCQ'
    });
  }
  
  // If we couldn't parse any MCQ questions, generate defaults
  if (questions.length === 0) {
    console.warn("No MCQ questions could be parsed from the response, using defaults");
    return generateDefaultQuestions(10, 'MCQ');
  }
  
  // Fill up to 10 questions if needed
  while (questions.length < 10) {
    questions.push(generateDefaultQuestions(1, 'MCQ')[0]);
  }
  
  return questions;
};

// Function to parse theory questions from API response
const parseTheoryQuestions = (content) => {
  // Split by question numbers (1., 2., etc.)
  const questionRegex = /\n\s*(\d+)\.\s+([\s\S]*?)(?=\n\s*\d+\.\s+|$)/g;
  const questions = [];
  let match;
  
  while ((match = questionRegex.exec(content)) !== null) {
    const questionBlock = match[2].trim();
    
    // Skip if this looks like an MCQ (has options)
    if (questionBlock.match(/[A-D]\)/)) {
      continue;
    }
    
    questions.push({
      question: questionBlock,
      type: 'Theory'
    });
  }
  
  
  // If we couldn't parse any theory questions, generate defaults
  if (questions.length === 0) {
    console.warn("No Theory questions could be parsed from the response, using defaults");
    return generateDefaultQuestions(10, 'Theory');
  }
  
  // Fill up to 10 questions if needed
  while (questions.length < 10) {
    questions.push(generateDefaultQuestions(1, 'Theory')[0]);
  }
  
  return questions;
};

// Function to generate default questions if parsing fails
export const generateDefaultQuestions = (count, type = 'MCQ') => {
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    if (type === 'MCQ') {
      questions.push({
        question: `Default question ${i+1} about ${type}`,
        options: [
          'First option',
          'Second option',
          'Third option',
          'Fourth option'
        ],
        correctAnswer: 0, // First option is correct by default
        type: 'MCQ'
      });
    } else {
      questions.push({
        question: `Default theory question ${i+1}: Explain a concept related to this topic.`,
        type: 'Theory'
      });
    }
  }
  
  return questions;
};