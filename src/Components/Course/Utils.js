// Time formatting utilities
export const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Function to parse Gemini API response into structured MCQ format
  export const parseGeminiResponse = (content) => {
    if (!content || typeof content !== 'string') {
      return generateDefaultQuestions(10);
    }
    
    try {
      // Split by question numbers (1., 2., etc.)
      const questionRegex = /\n\s*(\d+)\.\s+([\s\S]*?)(?=\n\s*\d+\.\s+|$)/g;
      const questions = [];
      let match;
      
      while ((match = questionRegex.exec(content)) !== null) {
        const questionBlock = match[2].trim();
        
        // Extract the question text - everything up to the first option
        const questionTextMatch = questionBlock.match(/^([\s\S]*?)(?=\n\s*[A-D]\))/);
        if (!questionTextMatch) continue;
        
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
          correctAnswer: correctAnswer
        });
        
        // Stop after collecting 10 questions
        if (questions.length >= 10) break;
      }
      
      // If we couldn't parse any questions, generate defaults
      if (questions.length === 0) {
        return generateDefaultQuestions(10);
      }
      
      // Fill up to 10 questions if needed
      while (questions.length < 10) {
        questions.push(generateDefaultQuestions(1)[0]);
      }
      
      return questions;
    } catch (e) {
      console.error('Error parsing Gemini response:', e);
      return generateDefaultQuestions(10);
    }
  };
  
  // Fallback function to generate default questions if parsing fails
  export const generateDefaultQuestions = (count) => {
    const questions = [];
    for (let i = 0; i < count; i++) {
      questions.push({
        question: `Question ${i+1} about this section's content`,
        options: [
          'First option',
          'Second option',
          'Third option',
          'Fourth option'
        ],
        correctAnswer: 0 // Default to first option (A) being correct
      });
    }
    return questions;
  };
  
  // Function to shuffle array elements (for randomizing question order)
  export const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Swap elements
    }
    return shuffled;
  };
  
  // Calculate score based on user answers
  export const calculateScore = (questions, userAnswers) => {
    let correct = 0;
    const results = questions.map((question, index) => {
      const isCorrect = userAnswers[index] === question.correctAnswer;
      if (isCorrect) correct++;
      return {
        question: question.question,
        userAnswer: userAnswers[index],
        correctAnswer: question.correctAnswer,
        isCorrect
      };
    });
    
    return {
      score: correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
      results
    };
  };