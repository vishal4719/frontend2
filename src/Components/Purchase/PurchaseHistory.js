import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Home/pages/Navbar';
import Loading from '../Loading/Loading';

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPurchaseHistory();
  }, []);

  const fetchPurchaseHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_HOST}/api/enrollment/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      
      // Generate order IDs and format data
      const purchasesWithDetails = response.data.map(enrollment => {
        // Generate a consistent order ID based on enrollment ID
        const orderId = 'order_' + (enrollment.id?.substring(0, 8) || Math.random().toString(36).substring(2, 10)).toUpperCase();
        
        // Handle enrollment date - use current date if not available
        let purchaseDate = new Date();
        try {
          if (enrollment.enrollmentDate) {
            purchaseDate = new Date(enrollment.enrollmentDate);
          }
        } catch (e) {
          console.error("Error parsing date:", e);
        }
        
        // Format the date as MM/DD/YYYY
        const formattedDate = `${purchaseDate.getMonth() + 1}/${purchaseDate.getDate()}/${purchaseDate.getFullYear()}`;
        
        // Determine course title
        let courseTitle = "Untitled Course";
        if (enrollment.playlistTitle) {
          courseTitle = enrollment.playlistTitle;
        } else if (enrollment.videoTitle) {
          courseTitle = enrollment.videoTitle;
        } else if (enrollment.playlistId) {
          courseTitle = `Playlist ${enrollment.playlistId.substring(0, 6)}`;
        } else if (enrollment.videoId) {
          courseTitle = `Video ${enrollment.videoId.substring(0, 6)}`;
        }
        
        // Determine product type
        let productType = "Course";
        if (enrollment.playlistId) {
          productType = "Course";
        } else if (enrollment.videoId) {
          productType = "Video";
        }
        
        return {
          ...enrollment,
          orderId,
          formattedPurchaseDate: formattedDate,
          courseTitle,
          productType
        };
      });
      
      setPurchases(purchasesWithDetails);
    } catch (error) {
      console.error('Full error details:', error);
      setError('Failed to fetch purchase history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-orange-100 text-orange-700 border-l-4 border-orange-500 p-4 rounded-md w-full max-w-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-6 sm:px-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">My Purchases</h1>
        
        {purchases.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center">
            <p className="text-gray-600">You haven't enrolled in any courses yet.</p>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="mt-4 px-4 sm:px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-all duration-300"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Desktop view - table */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-orange-600 text-white">
                  <tr>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                      Purchase Description
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                      Product Type
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                      Purchase Date
                    </th>
                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 font-semibold">
                              {purchase.courseTitle.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3 sm:ml-4">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">{purchase.courseTitle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          purchase.productType === 'Course' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {purchase.productType}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {purchase.orderId}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {purchase.formattedPurchaseDate}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        <button
                          className="text-orange-600 hover:text-orange-900 flex items-center"
                          onClick={() => navigate(`/purchase/${purchase.id}`)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          More Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile view - cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-500 font-semibold">
                        {purchase.courseTitle.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{purchase.courseTitle}</div>
                      <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        purchase.productType === 'Course' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {purchase.productType}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-13 pl-13 grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                    <div>
                      <span className="font-medium text-gray-700">Order ID:</span>
                      <div>{purchase.orderId}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Purchase Date:</span>
                      <div>{purchase.formattedPurchaseDate}</div>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <button
                      className="w-full text-center text-orange-600 border border-orange-600 rounded-md py-2 hover:bg-orange-50 flex items-center justify-center"
                      onClick={() => navigate(`/purchase/${purchase.id}`)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      More Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;