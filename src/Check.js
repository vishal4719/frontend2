import Certificate from "../src/Assests/Certificate.png";
import React from 'react';

const Check = () => {
  const certificateDetails = {
    presentText: "This certificate is proudly presented to",
    userName: "Vishal Gupta",
    courseName: "Digital Marketing Workshop",
    organizerDetails: "held by Wardiere Company on 6 June 2025"
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
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
         <div className="text-center mt-20">
            <h1 className="text-6xl font-bold tracking-widest text-gray-800">
              CERTIFICATE
            </h1>
            <h2 className="text-xl font-semibold tracking-wider text-gray-700 mt-2">
              OF PARTICIPATION
            </h2>
          </div>

        <div className="w-full h-full p-16 flex flex-col items-center">
          {/* Certificate Content */}
          <div className="flex flex-col items-center justify-center space-y-8 mb-30">
            {/* Presentation text */}
            <p className="text-xl text-gray-700">
              {certificateDetails.presentText}
            </p>

            {/* Name with decorative line */}
            <div className="relative w-auto text-center">
              <h2 className="font-greatVibes text-6xl font-normal text-amber-500 my-4 mb-3">
                {certificateDetails.userName}
              </h2>
             
            </div>

            {/* Course details */}
            <div className="text-center mt-16 space-y-2">
              <p className="text-xl text-gray-700">
                For participating in the {certificateDetails.courseName}
              </p>
              <p className="text-xl text-gray-700">
                {certificateDetails.organizerDetails}
              </p>
              <p className="absolute bottom-32 left-48 text-lg text-gray-700">
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            {/* Signature section */}
            <p className="absolute bottom-32 right-48 pl-10 text-lg font-bold text-gray-700">
              Vishal Gupta
            </p>
            <p className="absolute bottom-16 right-48 pl-10 pb-10 text-lg text-gray-700">
              CEO of V-skills
            </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Check;