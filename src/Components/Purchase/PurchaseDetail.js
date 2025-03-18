import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Home/pages/Navbar';
import Loading from '../Loading/Loading';
import { jsPDF } from 'jspdf';

const PurchaseDetail = () => {
  const { purchaseId } = useParams();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPurchaseDetail();
    generateOrderId();
  }, [purchaseId]);

  const fetchPurchaseDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_HOST}/api/enrollment/${purchaseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchase(response.data);
    } catch (error) {
      setError('Failed to fetch purchase detail. Please try again later.');
      console.error('Error fetching purchase detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateOrderId = () => {
    // Generate a consistent order ID based on purchaseId
    const randomOrderId = 'ORD-' + purchaseId.substr(0, 8).toUpperCase();
    setOrderId(randomOrderId);
  };

  const downloadInvoice = () => {
    if (!purchase) return;
    
    const { enrollment, course } = purchase;
    const doc = new jsPDF();
    
    // Add V-Skills logo (text-based for now)
    doc.setFontSize(22);
    doc.setTextColor(220, 53, 69); // orange color
    doc.text("V-SKILLS", 105, 20, { align: 'center' });
    
    // Add invoice header
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("INVOICE", 105, 40, { align: 'center' });
    
    // Add invoice details
    doc.setFontSize(12);
    doc.text(`Order ID: ${orderId}`, 20, 60);
    doc.text(`Date: ${new Date(enrollment.enrollmentDate || new Date()).toLocaleDateString()}`, 20, 70);
    doc.text(`Course: ${course.title}`, 20, 80);
    doc.text(`Type: ${course.type === 'playlist' ? 'Playlist' : 'Single Video'}`, 20, 90);
    
    // Add price breakdown table manually
    doc.setFillColor(220, 53, 69);
    doc.setDrawColor(220, 53, 69);
    doc.setTextColor(255, 255, 255);
    doc.rect(20, 100, 80, 10, 'F');
    doc.rect(100, 100, 80, 10, 'F');
    doc.text("Item", 25, 107);
    doc.text("Price", 105, 107);
    
    // Table rows
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(200, 200, 200);
    
    // Row 1
    doc.rect(20, 110, 80, 10, 'S');
    doc.rect(100, 110, 80, 10, 'S');
    doc.text("Course Price", 25, 117);
    doc.text("₹0", 105, 117);
    
    // Row 2
    doc.rect(20, 120, 80, 10, 'S');
    doc.rect(100, 120, 80, 10, 'S');
    doc.text("GST", 25, 127);
    doc.text("₹0", 105, 127);
    
    // Row 3 (total)
    doc.rect(20, 130, 80, 10, 'S');
    doc.rect(100, 130, 80, 10, 'S');
    doc.setFont("helvetica", "bold");
    doc.text("Total", 25, 137);
    doc.text("₹0", 105, 137);
    
    // Add footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Thank you for choosing V-Skills!", 105, 180, { align: 'center' });
    doc.text("For support, contact support@v-skills.com", 105, 190, { align: 'center' });
    
    // Save PDF
    doc.save(`invoice_${orderId}.pdf`);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-orange-100 text-orange-700 border-l-4 border-orange-500 p-4 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!purchase || !purchase.enrollment || !purchase.course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-orange-100 text--700 border-l-4 border-orange-500 p-4 rounded-md">
          <p>Purchase details not found.</p>
        </div>
      </div>
    );
  }

  const { enrollment, course } = purchase;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 text-orange-600 hover:text-orange-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Purchases
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-orange-600 text-white p-6">
            <h2 className="text-2xl font-bold">Purchase Details</h2>
            <p className="text-white opacity-80">Order ID: {orderId}</p>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <img
                  src={course.thumbnailUrl || 'https://via.placeholder.com/640x360?text=No+Thumbnail'}
                  alt={course.title}
                  className="w-full h-auto object-cover rounded-md shadow-md"
                />
              </div>
              
              <div className="md:w-2/3">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{course.title}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 uppercase font-medium mb-1">Product Type</p>
                    <p className="text-gray-800 font-medium">
                    {course.type === 'playlist' || course.playlistId ? 'Course (Playlist)' : 'Single Video'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 uppercase font-medium mb-1">Purchase Date</p>
                    <p className="text-gray-800 font-medium">
                      {enrollment.enrollmentDate 
                        ? new Date(enrollment.enrollmentDate).toLocaleDateString() 
                        : new Date().toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 uppercase font-medium mb-1">Order ID</p>
                    <p className="text-gray-800 font-medium">{orderId}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm text-gray-500 uppercase font-medium mb-1">Certificate</p>
                    <p className="text-gray-800 font-medium">
                    {course.type === 'playlist' || course.playlistId ? 'Will be provided upon completion' : 'Not available for this course type'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Price Breakdown</h4>
                  <div className="flex justify-between border-b border-gray-200 py-2">
                    <span className="text-gray-600">Course Price</span>
                    <span className="text-gray-800 font-medium">₹0</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 py-2">
                    <span className="text-gray-600">GST</span>
                    <span className="text-gray-800 font-medium">₹0</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-800 font-semibold">Total</span>
                    <span className="text-gray-800 font-semibold">₹0</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => navigate(`/learning/${course.type === 'playlist' ? 'playlist' : 'video'}/${course.id}`)}
                    className="px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    Go to {course.type === 'Course' ? 'Course' : 'Video'}
                  </button>
                  
                  <button
                    onClick={downloadInvoice}
                    className="px-6 py-3 bg-white border border-orange-600 text-orange-600 rounded-md hover:bg-orange-50 transition-colors flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetail;