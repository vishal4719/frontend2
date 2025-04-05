import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Loading from "../Loading/Loading";
import Navbar from "../Home/pages/Navbar";
import VideoPlayer from '../Course/CourseVideoPlayer'; 
import CertificateGenerator from '../Certificate/CertificateGenerator';
import TestModal from '../Course/TestModel';
import { Menu, X } from 'lucide-react';

const Course = () => {
  const [playlist, setPlaylist] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const { playlistId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [completionStatus, setCompletionStatus] = useState({});
  const [showTest, setShowTest] = useState(false);
  const [currentTest, setCurrentTest] = useState(null);
  const [testQuestions, setTestQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [testResults, setTestResults] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [tests, setTests] = useState([]);
  const [activeSection, setActiveSection] = useState(0);
  const [sectionsData, setSectionsData] = useState([]);
  const [generatingTest, setGeneratingTest] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        // Get playlist data
        const playlistResponse = await axios.get(`${process.env.REACT_APP_HOST}/api/playlists/${playlistId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Get user-specific completion status
        const completionResponse = await axios.get(`${process.env.REACT_APP_HOST}/api/enrollment/status/${playlistId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setPlaylist(playlistResponse.data);
        setCompletionStatus(completionResponse.data || {});
        
        // Get user-specific tests
        let testsData = [];
        try {
          const testsResponse = await axios.get(`${process.env.REACT_APP_HOST}/api/test/${playlistId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (testsResponse.data) {
            testsData = testsResponse.data;
            setTests(testsData);
            setTestHistory(testsData
              .filter(test => test.completed && test.passed)
              .map(test => test.sectionIndex));
          }
        } catch (error) {
          console.error('Error fetching tests:', error);
        }
        
        if (playlistResponse.data.videos.length > 0) {
          // Organize videos into sections (every 5 videos)
          const sections = [];
          const videos = playlistResponse.data.videos;
          
          for (let i = 0; i < videos.length; i += 5) {
            const sectionVideos = videos.slice(i, i + 5);
            const sectionIndex = i / 5;
            
            // Check if this section's test was already passed by the current user
            const isTestCompleted = testsData.some(
              test => test.sectionIndex === sectionIndex && test.completed && test.passed
            );
            
            sections.push({
              title: `Section ${sectionIndex + 1}`,
              videos: sectionVideos,
              testCompleted: isTestCompleted || false,
              test: testsData.find(test => test.sectionIndex === sectionIndex),
              isLocked: sectionIndex > 0 && !testsData.some(
                test => test.sectionIndex === sectionIndex - 1 && test.completed && test.passed
              )
            });
          }
          
          setSectionsData(sections);
          
          // Find the first unlocked video to select initially
          const firstUnlockedSection = sections.find(section => !section.isLocked);
          if (firstUnlockedSection) {
            setSelectedVideo(firstUnlockedSection.videos[0]);
          } else {
            setSelectedVideo(playlistResponse.data.videos[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [playlistId]);

  // Close sidebar when window is resized to larger than mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setShowSidebar(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleVideoProgress = (progressData) => {
    if (progressData.isPlaying !== undefined) {
      setIsPlaying(progressData.isPlaying);
    }
    if (progressData.currentTime !== undefined) {
      setCurrentTime(progressData.currentTime);
    }
    if (progressData.duration !== undefined) {
      setDuration(progressData.duration);
    }
  };

  const playNextVideo = () => {
    const currentIndex = playlist.videos.findIndex(video => video.videoId === selectedVideo.videoId);
    const nextIndex = currentIndex + 1;
    if (nextIndex < playlist.videos.length) {
      const nextVideoSectionIndex = Math.floor(nextIndex / 5);
      // Check if the next video's section is locked
      if (!isSectionLocked(nextVideoSectionIndex)) {
        handleVideoSelect(playlist.videos[nextIndex]);
      }
    }
  };

  // Helper function to check if a section is locked
  const isSectionLocked = (sectionIndex) => {
    if (sectionIndex === 0) return false; // First section is always unlocked
    
    // Check if the previous section's test has been passed
    return !testHistory.includes(sectionIndex - 1);
  };

  const markVideoAsComplete = async (videoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_HOST}/api/enrollment/complete`,
        { playlistId, videoId },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      if (response.data?.videoCompletionStatus) {
        setCompletionStatus(response.data.videoCompletionStatus);
        
        // Check if section is complete
        const currentVideoIndex = playlist.videos.findIndex(v => v.videoId === videoId);
        const sectionIndex = Math.floor(currentVideoIndex / 5);
        checkAndUpdateSectionStatus(sectionIndex, response.data.videoCompletionStatus);
        
        // Auto-play next video
        playNextVideo();
      }
    } catch (error) {
      console.error('Error marking video as complete:', error);
    }
  };

  // Helper function to check section completion status
  const checkAndUpdateSectionStatus = (sectionIndex, completionStatusData) => {
    const sectionStart = sectionIndex * 5;
    const sectionEnd = Math.min(sectionStart + 5, playlist.videos.length);
    const sectionVideos = playlist.videos.slice(sectionStart, sectionEnd);
    
    // Check if all videos in section are completed
    const allSectionVideosCompleted = sectionVideos.every(v => 
      completionStatusData[v.videoId]
    );
    
    // Update sections data
    setSectionsData(prevSections => 
      prevSections.map((section, idx) => {
        if (idx === sectionIndex) {
          return {...section, allVideosCompleted: allSectionVideosCompleted};
        }
        return section;
      })
    );
  };

  // Toggle sidebar for mobile view
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // Close sidebar when a video is selected (for mobile)
  const handleVideoSelectMobile = (video) => {
    handleVideoSelect(video);
    setShowSidebar(false);
  };

  // Updated function to handle test taking
  const handleTakeTest = async (sectionIndex) => {
    // Close sidebar if mobile
    setShowSidebar(false);
    
    // First check if the section videos are all completed
    const sectionStart = sectionIndex * 5;
    const sectionEnd = Math.min(sectionStart + 5, playlist.videos.length);
    const sectionVideos = playlist.videos.slice(sectionStart, sectionEnd);
    
    const allSectionVideosCompleted = sectionVideos.every(v => 
      completionStatus[v.videoId]
    );
    
    if (!allSectionVideosCompleted) {
      // User hasn't completed all videos in this section
      alert('Please complete all videos in this section before taking the test.');
      return;
    }
    
    setGeneratingTest(true);
    
    // Check if test already exists
    const existingTest = tests.find(t => t.sectionIndex === sectionIndex);
    
    if (existingTest) {
      // Use existing test
      setCurrentTest(existingTest);
      setTestQuestions(existingTest.questions);
      setShowTest(true);
      setSelectedAnswers({});
      setTestResults(null);
      setGeneratingTest(false);
    } else {
      // Generate new test
      try {
        await generateTestForSection(sectionIndex);
      } catch (error) {
        console.error('Error generating test:', error);
        alert('Failed to generate test. Please try again.');
        setGeneratingTest(false);
      }
    }
  };

// Replace the generateTestForSection function with this improved version
const generateTestForSection = async (sectionIndex) => {
  try {
    setGeneratingTest(true);
    // Get the videos for the current section
    const sectionStart = sectionIndex * 5;
    const sectionEnd = Math.min(sectionStart + 5, playlist.videos.length);
    const sectionVideos = playlist.videos.slice(sectionStart, sectionEnd);
    
    // Extract video titles and descriptions to form the prompt
    const videoData = sectionVideos.map(video => ({
      title: video.title,
      
    }));
    
    const prompt = `Create 10 multiple-choice questions (MCQs) based on the following video titles donot ask youtbe video descriptions question als donot ask questions like timestamp or any useless questions jus take the title and make own questions depending on titles:
${JSON.stringify(videoData, null, 2)}

Format each question with exactly 4 options (A, B, C, D) and clearly indicate the correct answer at the end.
For example:

1. [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct answer: [A/B/C/D]

2. [Question text]
A) [Option A]
B) [Option B]
...

Make the questions test understanding of the key concepts that would likely be covered in videos with these titles.`;

    const token = localStorage.getItem('token');
    
    try {
      // Generate questions using the Gemini API
      const response = await axios.post(
        `${process.env.REACT_APP_HOST}/api/gemini/generate`,
        { prompt },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      let parsedQuestions;
      if (response.data && response.data.content) {
        parsedQuestions = parseGeminiResponse(response.data.content);
      } else {
        throw new Error('Invalid response from Gemini API');
      }
      
      // Create a test object
      const testData = {
        playlistId: playlistId,
        sectionIndex: sectionIndex,
        questions: parsedQuestions
      };
      
      // Save the test
      const saveResponse = await axios.post(
        `${process.env.REACT_APP_HOST}/api/test/save`,
        testData,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      if (saveResponse.data) {
        // Update tests state
        const newTest = saveResponse.data;
        setTests(prevTests => [...prevTests, newTest]);
        
        // Set current test for display
        setCurrentTest(newTest);
        setTestQuestions(newTest.questions);
        setShowTest(true);
        setSelectedAnswers({});
        setTestResults(null);
      }
    } catch (apiError) {
      console.error('Error with Gemini API or saving test:', apiError);
      // Fall back to default questions since the API failed
      await saveDefaultTest(sectionIndex);
    }
  } catch (outerError) {
    console.error('Error in test generation process:', outerError);
    await saveDefaultTest(sectionIndex);
  } finally {
    setGeneratingTest(false);
  }
};

// Add this new helper function to extract the test generation logic
const saveDefaultTest = async (sectionIndex) => {
  try {
    const defaultQuestions = generateDefaultQuestions(10);
    const token = localStorage.getItem('token');
    
    const testData = {
      playlistId: playlistId,
      sectionIndex: sectionIndex,
      questions: defaultQuestions
    };
    
    const saveResponse = await axios.post(
      `${process.env.REACT_APP_HOST}/api/test/save`,
      testData,
      { headers: { Authorization: `Bearer ${token}` }}
    );
    
    if (saveResponse.data) {
      const newTest = saveResponse.data;
      setTests(prevTests => [...prevTests, newTest]);
      setCurrentTest(newTest);
      setTestQuestions(newTest.questions);
      setShowTest(true);
      setSelectedAnswers({});
      setTestResults(null);
    }
  } catch (error) {
    console.error('Error saving default test:', error);
    alert('Failed to generate test questions. Please try again later.');
  }
};

  // Function to parse Gemini API response into structured MCQ format
  const parseGeminiResponse = (content) => {
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
  const generateDefaultQuestions = (count) => {
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
        correctAnswer: 0 // First option is correct by default
      });
    }
    return questions;
  };

  // Function to handle test submission with updated logic
  const handleTestSubmit = async () => {
    const results = {
      total: testQuestions.length,
      correct: 0,
      answers: selectedAnswers
    };
  
    testQuestions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        results.correct++;
      }
    });
  
    setTestResults(results);
    const passed = results.correct >= results.total * 0.7;
  
    // Save test results to backend
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_HOST}/api/test/submit`,
        {
          testId: currentTest.id,
          score: results.correct,
          totalQuestions: results.total,
          passed: passed
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
  
      // Update the local tests array with the updated test data
      if (response.data) {
        const updatedTest = response.data;
        setTests(prevTests => 
          prevTests.map(test => 
            test.id === updatedTest.id ? updatedTest : test
          )
        );
      }
  
      if (passed) {
        // Update test history if passed
        const sectionIndex = currentTest.sectionIndex;
        setTestHistory(prevHistory => [...prevHistory, sectionIndex]);
        
        // Update section data
        setSectionsData(prevSections => {
          const newSections = prevSections.map((section, idx) => {
            if (idx === sectionIndex) {
              return {...section, testCompleted: true};
            } else if (idx === sectionIndex + 1) {
              // Unlock the next section
              return {...section, isLocked: false};
            }
            return section;
          });
          return newSections;
        });
      }
    } catch (error) {
      console.error('Error saving test results:', error);
    }
  };

  const handleVideoSelect = (video) => {
    const videoIndex = playlist.videos.findIndex(v => v.videoId === video.videoId);
    const sectionIndex = Math.floor(videoIndex / 5);
    
    // Check if the section is locked
    if (isSectionLocked(sectionIndex)) {
      alert('This section is locked! Complete the previous section\'s test to unlock it.');
      return;
    }
    
    setSelectedVideo(video);
    setCurrentTime(0);
    setDuration(0);
    
    // Update active section
    setActiveSection(sectionIndex);
  };

  // Function to check if a section has all videos completed
  const isSectionCompleted = (sectionIndex) => {
    if (!playlist || !completionStatus) return false;
    
    const sectionStart = sectionIndex * 5;
    const sectionEnd = Math.min(sectionStart + 5, playlist.videos.length);
    const sectionVideos = playlist.videos.slice(sectionStart, sectionEnd);
    
    return sectionVideos.every(video => completionStatus[video.videoId]);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!playlist) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-fit bg-slate-100">
      <Navbar />
      <div className="flex h-screen flex-col md:flex-row relative">
        <button 
  className="md:hidden  p-2 rounded-md shadow-md " // Changed bg-purple-600 to bg-gray-200 and added mt-16
  onClick={toggleSidebar}
  aria-label="Toggle course content"
>
  {showSidebar ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
</button>

        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowSidebar(false)}
          ></div>
        )}

        {/* Course Content Sidebar (Desktop & Mobile) */}
        <div className={`bg-slate-100 overflow-y-auto border-r z-50 
          ${showSidebar 
            ? 'fixed inset-y-0 left-0 w-5/6 transform translate-x-0 transition-transform duration-300 ease-in-out' 
            : 'fixed inset-y-0 left-0 w-5/6 transform -translate-x-full transition-transform duration-300 ease-in-out md:relative md:w-1/4 md:transform-none'
          }`}
        >
          {/* Mobile Close Button */}
          <div className="flex justify-between items-center p-4 md:hidden">
            <h3 className="text-xl font-bold">Course Content</h3>
            <button 
              className="text-gray-500"
              onClick={() => setShowSidebar(false)}
              aria-label="Close menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4">
            <h3 className="text-xl font-bold mb-4 hidden md:block">Course Content</h3>
            <div className="space-y-4">
              {sectionsData.map((section, sectionIndex) => (
                <div key={sectionIndex} className="border rounded-lg overflow-hidden bg-white">
                  <div 
                    className={`p-3 font-medium flex justify-between items-center cursor-pointer ${
                      activeSection === sectionIndex ? 'bg-purple-100' : 'bg-gray-50'
                    }`}
                    onClick={() => setActiveSection(sectionIndex === activeSection ? -1 : sectionIndex)}
                  >
                    <div className="flex items-center">
                      <span>{section.title}</span>
                      {section.isLocked && (
                        <span className="ml-2 text-gray-500">🔒</span>
                      )}
                    </div>
                    <span className={`transform transition-transform ${
                      activeSection === sectionIndex ? 'rotate-180' : ''
                    }`}>▼</span>
                  </div>
                  
                  {activeSection === sectionIndex && (
                    <div className="border-t">
                      {section.isLocked ? (
                        <div className="p-4 text-center bg-gray-100">
                          <p className="text-gray-600">
                            This section is locked. Complete the previous section's test to unlock.
                          </p>
                        </div>
                      ) : (
                        <>
                          {section.videos.map((video, videoIndex) => (
                            <button
                              key={video.videoId}
                              onClick={() => handleVideoSelectMobile(video)}
                              className={`w-full text-left p-3 border-b last:border-b-0 transition-colors ${
                                selectedVideo?.videoId === video.videoId
                                  ? 'bg-[#E8DAEF] text-purple-900'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start">
                                <span className="mr-3 text-gray-500">{sectionIndex * 5 + videoIndex + 1}.</span>
                                <span className="flex-1">{video.title}</span>
                                {completionStatus[video.videoId] && (
                                  <span className="ml-2 text-green-500">✓</span>
                                )}
                              </div>
                            </button>
                          ))}
                          
                          <div className="p-3 bg-gray-50 border-t">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Section Test</span>
                              {testHistory.includes(sectionIndex) ? (
                                <div className="flex flex-col items-end">
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                    Completed
                                  </span>
                                  {tests.find(t => t.sectionIndex === sectionIndex)?.score && (
                                    <span className="text-xs mt-1">
                                      Score: {tests.find(t => t.sectionIndex === sectionIndex)?.score}/{tests.find(t => t.sectionIndex === sectionIndex)?.totalQuestions}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleTakeTest(sectionIndex)}
                                  className={`px-3 py-1 rounded text-xs ${
                                    isSectionCompleted(sectionIndex)
                                      ? "bg-blue-500 text-white hover:bg-blue-600"
                                      : "bg-gray-300 text-gray-700 cursor-not-allowed"
                                  }`}
                                  disabled={!isSectionCompleted(sectionIndex) || generatingTest}
                                >
                                  {generatingTest ? "Generating..." : "Take Test"}
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {testHistory.includes(sectionIndex)
                                ? `You've passed this section's test!`
                                : isSectionCompleted(sectionIndex) 
                                  ? "All videos completed. Test is available."
                                  : "Complete all videos to unlock test"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Video and Details (Right Side) */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-slate-100 border-b p-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">{playlist.title}</h1>
              <div className="ml-auto">
                <CertificateGenerator
                  playlistId={playlistId}
                  playlist={playlist}
                  completionStatus={completionStatus}
                />
              </div>
            </div>
          </div>

          {/* Video Player and Tabs */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedVideo && (
              <div className="bg-white rounded-lg shadow-md">
                <div className="player-container relative">
                  <VideoPlayer 
                    videoId={selectedVideo.videoId}
                    onVideoComplete={markVideoAsComplete}
                    onVideoProgress={handleVideoProgress}
                  />
                </div>
                
                <div className="p-4">
                  <h2 className="text-xl font-bold">{selectedVideo.title}</h2>
                </div>
                
                {/* Tabs */}
                <div className="border-t">
                  <div className="flex border-b">
                    {['overview', 'doubts'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-sm font-medium ${
                          activeTab === tab
                            ? 'border-b-2 border-blue-500 text-blue-600'
                            :'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                  
                  {/* Tab Content */}
                  <div className="p-6">
                    {activeTab === 'overview' && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Overview</h3>
                        <p className="text-gray-600 mt-2">{selectedVideo.description}</p>
                      </div>
                    )}
                    {activeTab === 'doubts' && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Doubts</h3>
                        <p className="text-gray-600">Ask your questions here...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Test Modal Component */}
      {showTest && (
        <TestModal
          testQuestions={testQuestions}
          selectedAnswers={selectedAnswers}
          setSelectedAnswers={setSelectedAnswers}
          handleTestSubmit={handleTestSubmit}
          testResults={testResults}
          setShowTest={setShowTest}
          generatingTest={generatingTest}
          setTestResults={setTestResults}
        />
      )}
    </div>
  );
};

export default Course;