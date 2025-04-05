import React from 'react';
import Certificate from '../Assests/Certificate.png';

const CertificateTemplate = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">
      <div 
        className="relative bg-white shadow-lg"
        style={{ 
          width: '1100px', 
          height: '800px',
          backgroundImage: `url(${Certificate})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="w-full h-full p-16 flex flex-col">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold tracking-widest text-gray-800">
              CERTIFICATE
            </h1>
            <h2 className="text-xl font-semibold tracking-wider text-gray-700 mt-2">
              OF PARTICIPATION
            </h2>
          </div>

          <div className="flex flex-col items-center justify-start flex-grow">
            {/* Presentation text */}
            <p className="text-xl text-gray-700 mb-8">
              This certificate is proudly presented to
            </p>
            
            {/* Student name */}
            <h2 className="font-greatVibes text-6xl font-normal text-amber-500 mt-8">
              John Doe
            </h2>
            
            {/* Course description */}
            <p className="text-xl text-gray-700 text-center mt-8">
              For participating in the React.js Development Course
            </p>
            
          </div>

          {/* Footer */}
          <div className="absolute bottom-32 left-0 right-0 px-48">
            <div className="flex justify-between">
              <div>
                <p className="text-lg text-gray-700">
                  {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-700 ">
                  Vishal Gupta
                </p>
                <p className="text-lg text-gray-700 mt-4">
                  CEO of V-skills
                </p>
              </div>
            </div>
          </div>

          {/* Sample QR Code Placeholder */}
          <div className="absolute bottom-8 right-8 bg-gray-200 w-24 h-24 rounded-lg flex items-center justify-center">
            <span className="text-xs text-gray-600">QR Code</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;