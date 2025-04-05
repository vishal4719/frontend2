import React, { useState } from 'react';
import axios from 'axios';

const PracticeTestModal = ({
  testQuestions,
  selectedAnswers,
  setSelectedAnswers,
  handleTestSubmit,
  testResults,
  setShowTest,
  generatingTest,
  setTestResults
}) => {
  const [validationResults, setValidationResults] = useState({});
  const [validating, setValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState({});

  // Handle answer selection for MCQ questions
  const handleSelectAnswer = (questionIndex, optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: optionIndex
    });
  };

  // Handle answer input for Theory questions
  const handleTheoryAnswer = (questionIndex, answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answer
    });
    
    // Clear validation for this question when answer changes
    if (validationResults[questionIndex]) {
      const updatedValidationResults = { ...validationResults };
      delete updatedValidationResults[questionIndex];
      setValidationResults(updatedValidationResults);
      
      const updatedValidationStatus = { ...validationStatus };
      delete updatedValidationStatus[questionIndex];
      setValidationStatus(updatedValidationStatus);
    }
  };

  // Validate a single theory answer
  const validateSingleTheoryAnswer = async (questionIndex) => {
    const answer = selectedAnswers[questionIndex];
    const question = testQuestions[questionIndex].question;
    
    if (testQuestions[questionIndex].type === 'Theory' && answer && answer.trim() !== '') {
      setValidationStatus({
        ...validationStatus,
        [questionIndex]: 'validating'
      });
      
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_HOST}/api/gemini/validateTheoryAnswer`,
          { question, userAnswer: answer },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        setValidationResults({
          ...validationResults,
          [questionIndex]: response.data.validation
        });
        
        setValidationStatus({
          ...validationStatus,
          [questionIndex]: 'validated'
        });
        
        return response.data.validation;
      } catch (error) {
        console.error('Error validating theory answer:', error);
        setValidationStatus({
          ...validationStatus,
          [questionIndex]: 'error'
        });
      }
    }
    return null;
  };

  // Validate all theory answers
  const validateTheoryAnswers = async () => {
    setValidating(true);
    const results = {};
    const theoryQuestions = testQuestions.filter(q => q.type === 'Theory');
    const theoryQuestionIndices = theoryQuestions.map((_, i) => 
      testQuestions.findIndex((q, index) => q.type === 'Theory' && i === testQuestions.filter(tq => tq.type === 'Theory').indexOf(q))
    );
    
    for (const index of theoryQuestionIndices) {
      const validation = await validateSingleTheoryAnswer(index);
      if (validation) {
        results[index] = validation;
      }
    }

    setValidationResults({...validationResults, ...results});
    setValidating(false);
    return results;
  };

  // Calculate if the test can be submitted (all questions answered)
  const canSubmit = testQuestions && testQuestions.length > 0 && 
    Object.keys(selectedAnswers).length >= testQuestions.length;

  // Handle closing the test modal
  const handleClose = () => {
    setShowTest(false);
    setTestResults(null);
  };

  // Handle retry test
  const handleRetry = () => {
    setSelectedAnswers({});
    setTestResults(null);
    setValidationResults({});
    setValidationStatus({});
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Practice Test</h2>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {testResults ? (
            <div className="text-center p-6">
              <h3 className="text-xl font-bold mb-4">Test Results</h3>
              <div className="text-5xl font-bold mb-4">
                {testResults.correct} / {testResults.total}
              </div>
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full ${
                      (testResults.correct / testResults.total) >= 0.7 
                        ? 'bg-green-500' 
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${(testResults.correct / testResults.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="mb-6 text-lg">
                {(testResults.correct / testResults.total) >= 0.7 
                  ? 'Congratulations! You passed the test.' 
                  : 'You did not pass the test. Try again!'}
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              {testQuestions && testQuestions.length > 0 ? (
                <div>
                  <div className="space-y-8 mb-8">
                    {testQuestions.map((question, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-md">
                        <h3 className="font-semibold mb-2">
                          {index + 1}. {question.question}
                        </h3>
                        
                        {question.type === 'MCQ' && question.options && (
                          <div className="space-y-2 ml-4">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center">
                                <input
                                  type="radio"
                                  id={`q${index}-opt${optIndex}`}
                                  name={`question-${index}`}
                                  checked={selectedAnswers[index] === optIndex}
                                  onChange={() => handleSelectAnswer(index, optIndex)}
                                  className="mr-2"
                                />
                                <label htmlFor={`q${index}-opt${optIndex}`}>
                                  {option}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {question.type === 'Theory' && (
                          <div className="ml-4 mt-2">
                            <textarea
                              className="w-full p-2 border border-gray-300 rounded-md"
                              placeholder="Enter your answer here..."
                              rows="4"
                              value={selectedAnswers[index] || ''}
                              onChange={(e) => handleTheoryAnswer(index, e.target.value)}
                            ></textarea>
                            
                            {selectedAnswers[index] && selectedAnswers[index].trim() !== '' && (
                              <div className="mt-2 flex justify-between">
                                <button
                                  onClick={() => validateSingleTheoryAnswer(index)}
                                  disabled={validationStatus[index] === 'validating'}
                                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                                >
                                  {validationStatus[index] === 'validating' ? 'Checking...' : 'Check Answer'}
                                </button>
                                
                                {validationStatus[index] === 'validated' && (
                                  <span className="text-green-600 text-sm mt-1">Answer checked!</span>
                                )}
                              </div>
                            )}
                            
                            {validationResults[index] && (
                              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <h4 className="font-semibold text-blue-700">Suggested Answer:</h4>
                                <p className="mt-1 text-gray-700">{validationResults[index]}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between">
                    {testQuestions.some(q => q.type === 'Theory') && (
                      <button
                        onClick={validateTheoryAnswers}
                        disabled={validating}
                        className={`px-4 py-2 text-white rounded-md ${
                          !validating
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-blue-300 cursor-not-allowed'
                        }`}
                      >
                        {validating ? 'Checking Answers...' : 'Check All Theory Answers'}
                      </button>
                    )}
                    
                    <button
                      onClick={async () => {
                        await validateTheoryAnswers();
                        handleTestSubmit();
                      }}
                      disabled={!canSubmit || generatingTest}
                      className={`px-4 py-2 text-white rounded-md ${
                        canSubmit && !generatingTest
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Submit Test
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6">
                  <p>Loading questions...</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeTestModal;