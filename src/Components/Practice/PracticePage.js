import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PracticeTestModal from './PracticeTestModal';
import { parseGeminiResponse, generatePrompt, generateDefaultQuestions } from './Utils';
import Navbar from '../Home/pages/Navbar'; // Import Navbar

const PracticePage = () => {
  const [subject, setSubject] = useState('');
  const [otherSubject, setOtherSubject] = useState('');
  const [level, setLevel] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [testQuestions, setTestQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [testResults, setTestResults] = useState(null);
  const [showTest, setShowTest] = useState(false);
  const [generatingTest, setGeneratingTest] = useState(false);
  const [error, setError] = useState('');
  const [userTestResults, setUserTestResults] = useState([]);

  useEffect(() => {
    fetchUserTestResults();
  }, []);

  const fetchUserTestResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_HOST}/api/testResults/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserTestResults(response.data);
    } catch (error) {
      console.error('Error fetching user test results:', error);
    }
  };

  const handleGenerateTest = async () => {
    const actualSubject = subject === 'Other' ? otherSubject : subject;
    
    if (!actualSubject || !level || !questionType) {
      setError('Please select all options');
      return;
    }

    setError('');
    setGeneratingTest(true);

    try {
      const prompt = generatePrompt(actualSubject, level, questionType);

      
      const response = await axios.post(
        `${process.env.REACT_APP_HOST}/api/gemini/generate`,
        { prompt },
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data && response.data.content) {
        const questions = parseGeminiResponse(response.data.content, questionType);
     
        
        if (questions && questions.length > 0) {
          setTestQuestions(questions);
          setShowTest(true);
          setSelectedAnswers({});
          setTestResults(null);
        } else {
          setError('Failed to generate valid questions. Please try again.');
        }
      } else {
        setError('No content received from the API. Please try again.');
      }
    } catch (error) {
      console.error('Error generating test:', error);
      
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        setError(`Server error: ${error.response.status}. ${error.response.data?.error || ''}`);
      } else if (error.request) {
        setError('No response from server. Please check your network connection.');
      } else {
        setError(`Error: ${error.message}`);
      }
      
      const defaultQuestions = generateDefaultQuestions(10, questionType);
      setTestQuestions(defaultQuestions);
      setShowTest(true);
      setSelectedAnswers({});
      setTestResults(null);
    } finally {
      setGeneratingTest(false);
    }
  };

  const handleTestSubmit = async () => {
    const actualSubject = subject === 'Other' ? otherSubject : subject;
    const results = {
      total: testQuestions.length,
      correct: 0,
      answers: selectedAnswers
    };

    let mcqCount = 0;
    let theoryCount = 0;

    testQuestions.forEach((q, index) => {
      if (q.type === 'MCQ') {
        mcqCount++;
        if (selectedAnswers[index] === q.correctAnswer) {
          results.correct++;
        }
      } else if (q.type === 'Theory') {
        theoryCount++;
        if (selectedAnswers[index] && selectedAnswers[index].trim().length > 0) {
          results.correct++;
        }
      }
    });

   
    setTestResults(results);

    const passed = results.correct >= results.total * 0.7;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_HOST}/api/testResults/save`,
        {
          subject: actualSubject,
          level,
          questionType,
          score: results.correct,
          totalQuestions: results.total,
          passed
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data) {
        fetchUserTestResults(); // Refresh user test results
      }
    } catch (error) {
      console.error('Error saving test results:', error);
    }
  };

  return (
    <div>
      <Navbar /> {/* Add Navbar component */}
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 mr-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-3xl font-sans font-medium text-gray-800">Practice Tests</h1>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select Subject</option>
                <option value="HTML">HTML</option>
                <option value="CSS">CSS</option>
                <option value="Tailwind">Tailwind</option>
                <option value="React">React</option>
                <option value="Angular">Angular</option>
                <option value="Springboot">Springboot</option>
                <option value="MERN">MERN</option>
                <option value="PHP">PHP</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            {subject === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specify Subject</label>
                <input
                  type="text"
                  value={otherSubject}
                  onChange={(e) => setOtherSubject(e.target.value)}
                  placeholder="Enter subject name"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select Level</option>
                <option value="Easy">Easy</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Question Type</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select Question Type</option>
                <option value="MCQ">MCQ</option>
                <option value="Theory">Theory</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={handleGenerateTest}
              className={`w-full md:w-auto px-6 py-3 text-white font-medium rounded-md shadow-sm transition-colors ${
                generatingTest 
                  ? 'bg-orange-300 cursor-not-allowed' 
                  : 'bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
              }`}
              disabled={generatingTest}
            >
              {generatingTest ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : 'Generate Test'}
            </button>
          </div>
        </div>

        {showTest && (
          <PracticeTestModal
            testQuestions={testQuestions}
            selectedAnswers={selectedAnswers}
            setSelectedAnswers={setSelectedAnswers}
            handleTestSubmit={handleTestSubmit}
            testResults={testResults}
            setShowTest={setShowTest}
            generatingTest={generatingTest}
            setTestResults={setTestResults}
            subject={subject === 'Other' ? otherSubject : subject}
            level={level}
            questionType={questionType}
          />
        )}

        <div className="mt-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 mr-2 bg-orange-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-800">Your Test History</h2>
          </div>
          
          {userTestResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userTestResults.map((result) => (
                <div key={result.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className={`h-2 ${result.passed ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-2 text-gray-800">{result.subject}</h3>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-medium">{result.level}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{result.questionType}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Score:</span>
                      <span className="font-medium">{result.score} / {result.totalQuestions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {result.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-gray-600">You haven't taken any tests yet.</p>
              <p className="text-gray-500 text-sm mt-2">Generate a test above to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticePage;