import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import axios from 'axios';

function QRCodeGenerator() {
  const [text, setText] = useState('');
  const [size, setSize] = useState(200);
  const [color, setColor] = useState('#000000');
  const [showDownload, setShowDownload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState('');
  const qrRef = useRef(null);

  const uploadToCloudinary = async (imageData) => {
    const formData = new FormData();
    // Convert base64 to blob
    const blob = await fetch(imageData).then(res => res.blob());
    formData.append('file', blob);
    formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
    formData.append('api_key', process.env.REACT_APP_CLOUDINARY_API_KEY);
    formData.append('timestamp', Math.floor(Date.now() / 1000));

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  const generateQR = () => {
    if (text.trim() === '') {
      alert('Please enter text or URL');
      return;
    }
    setShowDownload(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      generateQR();
    }
  };

  const downloadQR = async () => {
    if (!qrRef.current) return;
    
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;
    
    try {
      setIsUploading(true);
      const image = canvas.toDataURL('image/png');
      
      // Upload to Cloudinary
      const uploadedUrl = await uploadToCloudinary(image);
      setCloudinaryUrl(uploadedUrl);
      
      // Generate new QR code with Cloudinary URL
      setText(uploadedUrl);
      
      // Download the QR code
      const link = document.createElement('a');
      link.href = image;
      link.download = 'certificate-qr.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error processing QR code:', error);
      alert('Failed to process QR code. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Certificate QR Code Generator
        </h1>
        
        <div className="mb-4">
          <label htmlFor="text" className="block font-semibold mb-1 text-gray-700">
            Enter Certificate Details:
          </label>
          <input
            type="text"
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter certificate details or URL"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="size" className="block font-semibold mb-1 text-gray-700">
              QR Code Size:
            </label>
            <select
              id="size"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value={128}>Small (128x128)</option>
              <option value={200}>Medium (200x200)</option>
              <option value={300}>Large (300x300)</option>
              <option value={400}>Extra Large (400x400)</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="color" className="block font-semibold mb-1 text-gray-700">
              QR Code Color:
            </label>
            <input
              type="color"
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full p-1 h-10 border border-gray-300 rounded"
            />
          </div>
        </div>
        
        <button
          onClick={generateQR}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded transition duration-300"
        >
          Generate QR Code
        </button>
        
        <div ref={qrRef} className="flex justify-center mt-6">
          {text && (
            <QRCodeCanvas
              value={text}
              size={size}
              fgColor={color}
              level="H"
              includeMargin={true}
            />
          )}
        </div>
        
        {showDownload && text && (
          <div className="text-center mt-4">
            <button
              onClick={downloadQR}
              disabled={isUploading}
              className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition duration-300 ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? 'Processing...' : 'Download QR Code'}
            </button>
            
            {cloudinaryUrl && (
              <div className="mt-4 text-sm text-gray-600">
                <p>Certificate URL:</p>
                <a 
                  href={cloudinaryUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 break-all"
                >
                  {cloudinaryUrl}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default QRCodeGenerator;