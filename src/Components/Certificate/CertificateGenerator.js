import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';
import Certificate from '../../Assests/Certificate.png';

const CertificateGenerator = ({ playlistId, playlist, completionStatus }) => {
  const certificateRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState('');
  const [certificateDetails, setCertificateDetails] = useState({
    userName: '',
    courseName: '',
    eligible: false,
    completion: 0,
    presentText: "This certificate is proudly presented to",
  });
  
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const completionPercentage = (() => {
    if (!playlist?.videos?.length) return 0;
    const totalVideos = playlist.videos.length;
    const completedVideos = Object.values(completionStatus || {}).filter(Boolean).length;
    return (completedVideos / totalVideos) * 100;
  })();
  
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;
  const isEligible = completionPercentage >= 70;
  const remainingPercentage = Math.max(70 - completionPercentage, 0);

  useEffect(() => {
    const fetchCertificateDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        // Check if token exists before making the request
        if (!token) {
          console.warn('Authentication token not found. User may need to log in again.');
          return;
        }
        
        const response = await axios.get(
          `${process.env.REACT_APP_HOST}/api/certificate/eligibility/${playlistId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setCertificateDetails(prev => ({
          ...prev,
          ...response.data
        }));
      } catch (error) {
        console.error('Error fetching certificate details:', error);
        if (error.response && error.response.status === 403) {
          console.error('Authorization failed. Token may be expired or invalid.');
        }
      }
    };

    if (playlistId) {
      fetchCertificateDetails();
    }
  }, [playlistId]);
  
  // Updated saveCertificateRecord function with better error handling
  const saveCertificateRecord = async (certificateUrl) => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if token exists
      if (!token) {
        console.error('Authentication token not found. Unable to save certificate record.');
        throw new Error('Authentication token missing');
      }
      
      // Ensure we have valid data before attempting to save
      if (!playlistId || !certificateDetails.userName || !certificateDetails.courseName) {
        console.error('Missing required data for certificate record');
        throw new Error('Missing required certificate data');
      }
      
      const response = await axios.post(
        `${process.env.REACT_APP_HOST}/api/certificate/save`,
        {
          playlistId,
          certificateUrl,
          userName: certificateDetails.userName,
          courseName: certificateDetails.courseName,
          completionPercentage,
          issuedDate: new Date().toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error saving certificate record:', error);
      
      // Provide more specific error handling
      if (error.response) {
        const { status, data } = error.response;
        if (status === 403) {
          console.error('Authorization failed. Token may be expired. Try logging in again.');
        } else if (status === 400) {
          console.error('Invalid data format:', data);
        } else if (status === 500) {
          console.error('Server error. Please try again later.');
        }
      }
      
      throw error;
    }
  };
    
  // Improved uploadToCloudinary function
  const uploadToCloudinary = async (imageData) => {
    try {
      const CLOUD_NAME = 'dmrxftcyv';
      const UPLOAD_PRESET = 'v-skills'; // Make sure this preset is configured as "unsigned" in Cloudinary
      
      const formData = new FormData();
      const blob = await fetch(imageData).then(res => res.blob());
      
      formData.append('file', blob);
      formData.append('upload_preset', UPLOAD_PRESET);
      
      
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          // Avoid auth header interference with Cloudinary
          transformRequest: [(data, headers) => {
            if (headers) {
              delete headers.Authorization;
            }
            return data;
          }]
        }
      );
  
      const cloudinaryImageUrl = response.data.secure_url;
      setCloudinaryUrl(cloudinaryImageUrl);
      
      return cloudinaryImageUrl;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      
      if (error.response) {
        console.error('Cloudinary error response:', error.response.data);
        
        // Handle specific Cloudinary error codes
        if (error.response.data.error && error.response.data.error.message) {
          console.error('Cloudinary error message:', error.response.data.error.message);
        }
      }
      
      // Throw the error to be handled by the caller
      throw error;
    }
  };
  
  // Create QR code as data URL
  const createQRCodeDataURL = async (url) => {
    return new Promise((resolve) => {
      // Create a temporary canvas in memory
      const canvas = document.createElement('canvas');
      const qrCodeComponent = (
        <QRCodeCanvas 
          value={url}
          size={1000}
          level="H"
          renderAs="canvas"
        />
      );
      
      // We'll use a temporary div to render the QR code
      const tempDiv = document.createElement('div');
      document.body.appendChild(tempDiv);
      
      // Use createRoot instead of ReactDOM.render (React 18+)
      const root = require('react-dom/client').createRoot(tempDiv);
      root.render(qrCodeComponent);
      
      // Wait for rendering to complete
      setTimeout(() => {
        try {
          const renderedCanvas = tempDiv.querySelector('canvas');
          if (renderedCanvas) {
            const dataURL = renderedCanvas.toDataURL('image/png');
            resolve(dataURL);
          } else {
            resolve(null);
          }
        } catch (err) {
          console.error('QR code rendering error:', err);
          resolve(null);
        } finally {
          // Clean up
          root.unmount();
          document.body.removeChild(tempDiv);
        }
      }, 100);
    });
  };
  
  // Updated generateCertificate function with improved QR code handling
  const generateCertificate = async () => {
    if (!isEligible || isGenerating) return;
    setIsGenerating(true);
    setShowTemplate(true);
  
    try {
      // Ensure the certificate template is visible before capturing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!certificateRef.current) {
        throw new Error('Certificate template not found');
      }
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1100,
        windowHeight: 800,
        allowTaint: false
      });
  
      const imgData = canvas.toDataURL('image/png', 1.0);
      let certificateUrl = imgData;
      let uploadSuccessful = false;
      
      try {
        // Try to upload to Cloudinary
        certificateUrl = await uploadToCloudinary(imgData);
        uploadSuccessful = true;
        
        // Only attempt to save the record if the upload was successful
        if (uploadSuccessful) {
          try {
            await saveCertificateRecord(certificateUrl);
          } catch (saveError) {
            console.warn('Failed to save certificate record:', saveError);
            // Continue as this shouldn't prevent the user from getting their PDF
          }
        }
      } catch (cloudinaryError) {
        console.warn('Cloudinary upload failed, continuing with local image:', cloudinaryError);
        // Proceed with PDF generation using local image
      }
      
      const pdf = new jsPDF('l', 'mm', [297, 210]);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Add the certificate image
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  
      // Create QR code only if we have a valid URL from Cloudinary
      if (uploadSuccessful && certificateUrl) {
        try {
          
          // Generate QR code as data URL
          const qrCodeDataUrl = await createQRCodeDataURL(certificateUrl);
          
          if (qrCodeDataUrl) {
            // Add QR code to the PDF
            pdf.addImage(qrCodeDataUrl, 'PNG', pdfWidth - 40, pdfHeight - 40, 30, 30);
          }
        } catch (qrError) {
          console.warn('QR code generation failed:', qrError);
          // Continue without QR code
        }
      }
      
      // Save the PDF
      const fileName = `${certificateDetails.userName || 'User'}-${certificateDetails.courseName || 'Course'}-Certificate.pdf`;
      pdf.save(fileName);
      
      // Set cloudinary URL for display in the UI
      if (uploadSuccessful) {
        setCloudinaryUrl(certificateUrl);
      }
      
    } catch (error) {
      console.error('Certificate generation failed:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setIsGenerating(false);
      // Keep the template rendered if we need to show the QR code
      setShowTemplate(false);
    }
  };

  return (
    <>
      {/* Progress Display and Button */}

{/* Progress Display and Button */}
<div className="flex items-center gap-3">
  <div className="flex items-center gap-1">
    <h2 className="text-gray-800 text-base font-medium">Progress</h2>
    <div className="relative w-10 h-10">
      <svg className="w-10 h-10 transform -rotate-90">
        <circle cx="20" cy="20" r="18" stroke="#FEE2E2" strokeWidth="4" fill="none" />
        <circle
          cx="20"
          cy="20"
          r="18"
          stroke="#FFA07A" // Changed to orange color
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-gray-700">{completionPercentage.toFixed(0)}%</span>
      </div>
    </div>
  </div>
  
  <button
    onClick={() => setShowModal(true)}
    className="flex items-center p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
  >
    <Download className="w-4 h-4 text-white" />
  </button>
</div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-xl w-full m-4 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">
                {isEligible ? 'Certificate Available!' : 'Keep Going!'}
              </h3>
              
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium text-gray-700">{completionPercentage.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${isEligible ? 'bg-green-500' : 'bg-yellow-500'}`}
                    style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {isEligible ? (
                <button
                  onClick={generateCertificate}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Download Certificate'}
                </button>
              ) : (
                <p className="text-yellow-700">
                  Complete {remainingPercentage.toFixed(1)}% more to earn your certificate
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Certificate Template - Always in the DOM, but visually hidden when not needed */}
      <div 
        ref={certificateRef} 
        className={`${showTemplate ? 'block' : 'hidden'} relative bg-white shadow-lg`}
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
              OF COMPLETION
            </h2>
          </div>

          <div className="flex flex-col items-center justify-start flex-grow">
            {/* Presentation text */}
            <p className="text-xl text-gray-700 mb-8">
              {certificateDetails.presentText}
            </p>
            
            {/* Student name */}
            <h2 className="font-greatVibes text-6xl font-normal text-amber-500 mt-8">
              {certificateDetails.userName || 'Student Name'}
            </h2>
            
            {/* Course description */}
            <p className="text-xl text-gray-700 text-center mt-8">
              For Completed the Course {certificateDetails.courseName || 'Course'}
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
                <p className="text-lg font-bold text-gray-700">
                  Vishal Gupta
                </p>
                <p className="text-lg text-gray-700 mt-4">
                  CEO of V-skills
                </p>
              </div>
            </div>
          </div>

          {/* QR Code */}
          {cloudinaryUrl && (
            <div className="absolute bottom-8 right-8 bg-white p-2 rounded-lg shadow-md">
              <QRCodeCanvas
                value={cloudinaryUrl}
                size={88}
                level="H"
                includeMargin={true}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CertificateGenerator;