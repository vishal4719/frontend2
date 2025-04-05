import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Navbar from "../Admin/Components/Navbar";

const UserSubscription = () => {
  const { userId } = useParams();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    fetchUserSubscription();
  }, [userId]);

  const fetchUserSubscription = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_HOST}/api/auth/admin/subscription/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setHasSubscription(response.data.hasSubscription);
      if (response.data.hasSubscription) {
        setSubscription(response.data.subscription);
      }
    } catch (error) {
      setError("Failed to fetch user subscription. Please try again later.");
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSubscriptionStatus = () => {
    if (!subscription) return "Not Active";
    
    const now = new Date();
    const expiryDate = new Date(subscription.expiryDate);
    
    if (now > expiryDate) {
      return "Expired";
    } else {
      return "Active";
    }
  };

  const getDaysRemaining = () => {
    if (!subscription) return 0;
    
    const now = new Date();
    const expiryDate = new Date(subscription.expiryDate);
    const diffTime = expiryDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-orange-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <Navbar />
      <div className="container mt-20 mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            User Subscription
          </h2>

          {error && (
            <div className="bg-red-100 text-red-700 border-l-4 border-red-500 p-4 rounded-md mb-6">
              <p>{error}</p>
            </div>
          )}

          {!hasSubscription ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-10 w-10 text-yellow-500 mr-4" />
                <div>
                  <h3 className="text-xl font-medium text-yellow-700">No Active Subscription</h3>
                  <p className="text-yellow-600 mt-1">This user doesn't have any active subscription.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-orange-100 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Subscription Type</p>
                    <p className="text-xl font-bold text-gray-800">{subscription.planType}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Status</p>
                    <div className="flex items-center mt-1">
                      {getSubscriptionStatus() === "Active" ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className={`font-medium ${getSubscriptionStatus() === "Active" ? "text-green-600" : "text-red-600"}`}>
                        {getSubscriptionStatus()}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="text-xl font-bold text-gray-800">${subscription.price}</p>
                  </div>
                </div>
                
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Start Date</p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-gray-800">{formatDate(subscription.startDate)}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Expiry Date</p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-gray-800">{formatDate(subscription.expiryDate)}</p>
                    </div>
                  </div>
                  
                  {getSubscriptionStatus() === "Active" && (
                    <div>
                      <p className="text-sm text-gray-500">Days Remaining</p>
                      <p className="text-xl font-bold text-gray-800">{getDaysRemaining()} days</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSubscription;