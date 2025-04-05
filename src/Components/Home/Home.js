import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { DotLottieReact, Typewriter, Navbar, java, python, clang,Loading } from "./Imports";

const Home = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    
    setTimeout(() => {
      setIsLoading(false);
    }, 2000); 
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          {/* Left Content */}
          <div className="lg:w-1/2 mb-8 lg:mb-0">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              Start Upskilling
            </h1>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              <span>With Our </span>
              <span className="inline-flex items-center">
                <span className="text-gray-800">&lt;</span>
                <span className="text-orange-500 mx-1">
                  <Typewriter
                    options={{
                      strings: ["FOCUSED"],
                      autoStart: true,
                      loop: true,
                    }}
                  />
                </span>
                <span className="text-gray-800">/&gt;</span>
              </span>
              <span> Courses</span>
            </h2>
            <p className="text-gray-600 mb-8 text-lg max-w-xl">
              V-Skills is your partner in effective upskilling. Get more value for
              time and resources you invest, with job-ready courses powered by
              high-technology, accessible for everyone!
            </p>
            <button className="bg-orange-500 text-white px-8 py-3 rounded-md hover:bg-orange-600 transition-colors"  onClick={() => navigate('/dashboard')}>
              Explore Courses
            </button>
          </div>

          {/* Right Content - Lottie Animation and Image Grid */}
          <div className="lg:w-1/2 relative">
            <div className="grid grid-cols-8 gap-6">
              {/* SQL Image */}
              <div className="relative col-span-4 col-start-5">
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-white rounded-full shadow-lg z-10 flex items-center justify-center">
                  <img src={java} alt="Java icon" className="w-8 h-8" />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <DotLottieReact
                    src="https://lottie.host/826a280e-cd5e-425b-bf73-03108d4c7584/0yzCrYct9I.lottie"
                    loop
                    autoplay
                    className="w-full h-48"
                  />
                </div>
              </div>

              {/* Middle Image */}
              <div className="relative col-span-8">
                <div className="absolute -top-6 -left-2 w-12 h-12 bg-white rounded-full shadow-lg z-10 flex items-center justify-center">
                  <img src={clang} alt="C Language icon" className="w-8 h-8" />
                </div>
                <div className="w-96 h-52 rounded-2xl overflow-hidden shadow-lg">
                <DotLottieReact
      src="https://lottie.host/302de86b-93eb-43b5-bc1a-3e866be6f6f3/Ml9B7WltRT.lottie"
      loop
      autoplay
    />
                </div>
              </div>

              {/* Bottom Image */}
              <div className="relative col-span-4 col-start-5">
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-white rounded-full shadow-lg z-10 flex items-center justify-center">
                  <img src={python} alt="Python icon" className="w-8 h-8" />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <DotLottieReact
                    src="https://lottie.host/e2f81207-0bcb-4586-bc3f-6ab4168b488f/AEUz6QsU5t.lottie"
                    loop
                    autoplay
                    className="w-full h-48"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Button */}
      <button className="fixed bottom-8 right-8 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-colors">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>
    </div>
  );
};

export default Home;
