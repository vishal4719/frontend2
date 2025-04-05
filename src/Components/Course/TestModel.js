import React from 'react';

const TestModal = ({
  testQuestions,
  selectedAnswers,
  setSelectedAnswers,
  handleTestSubmit,
  testResults,
  setShowTest,
  generatingTest,
  setTestResults
}) => {
  const handleOptionSelect = (questionIndex, optionIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: optionIndex });
  };

  const isTestComplete = () => {
    return testQuestions.length > 0 && 
      Object.keys(selectedAnswers).length === testQuestions.length;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {generatingTest ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl font-medium">Generating your test questions...</p>
            <p className="text-gray-500 mt-2">This might take a moment.</p>
          </div>
        ) : testResults ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4 text-center">Test Results</h3>
            
            <div className="flex justify-center mb-6">
              <div className={`text-2xl font-bold p-4 rounded-full ${
                testResults.correct >= testResults.total * 0.7 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {testResults.correct} / {testResults.total}
              </div>
            </div>
            
            <div className="text-center mb-6">
              {testResults.correct >= testResults.total * 0.7 ? (
                <p className="text-green-600 font-medium">
                  Congratulations! You've passed this section's test.
                </p>
              ) : (
                <p className="text-red-600 font-medium">
                  You didn't reach the passing score (70%). You can retry this test later.
                </p>
              )}
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setShowTest(false);
                  setTestResults(null);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Section Test</h2>
                <button
                  onClick={() => setShowTest(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              <p className="text-gray-600 mt-1">
                Complete this test to progress to the next section. You need 70% to pass.
              </p>
            </div>

            <div className="p-6">
              {testQuestions.map((question, questionIndex) => (
                <div key={questionIndex} className="mb-8 pb-6 border-b last:border-0">
                  <h3 className="font-medium mb-4">
                    {questionIndex + 1}. {question.question}
                  </h3>
                  <div className="space-y-3 ml-4">
                    {question.options.map((option, optionIndex) => (
                      <div 
                        key={optionIndex}
                        className="flex items-center"
                      >
                        <input
                          type="radio"
                          id={`q${questionIndex}o${optionIndex}`}
                          name={`question${questionIndex}`}
                          checked={selectedAnswers[questionIndex] === optionIndex}
                          onChange={() => handleOptionSelect(questionIndex, optionIndex)}
                          className="mr-2"
                        />
                        <label 
                          htmlFor={`q${questionIndex}o${optionIndex}`}
                          className="cursor-pointer"
                        >
                          {String.fromCharCode(65 + optionIndex)}. {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
              <div>
                {!isTestComplete() && (
                  <p className="text-amber-600 text-sm">
                    Please answer all questions before submitting.
                  </p>
                )}
              </div>
              <button
                onClick={handleTestSubmit}
                disabled={!isTestComplete()}
                className={`px-4 py-2 rounded ${
                  isTestComplete()
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Submit Test
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TestModal;