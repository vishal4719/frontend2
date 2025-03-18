import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar, CheckCircle, XCircle, Search, User } from "lucide-react";
import Navbar from "../Admin/Components/Navbar";

const AllSubscriptions = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("startDate");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    fetchAllSubscriptions();
  }, []);

  const fetchAllSubscriptions = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_HOST}/api/auth/admin/user/allsubscription`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSubscriptions(response.data.subscriptions);
    } catch (error) {
      setError("Failed to fetch subscriptions. Please try again later.");
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return "Invalid Date";
    }
  };

  const getSubscriptionStatus = (subscription) => {
    const now = new Date();
    const expiryDate = new Date(subscription.expiryDate);
    
    if (now > expiryDate) {
      return "Expired";
    } else {
      return "Active";
    }
  };

  const getDaysRemaining = (subscription) => {
    const now = new Date();
    const expiryDate = new Date(subscription.expiryDate);
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleUserClick = (userId) => {
    navigate(`/admin/user/${userId}/courses`);
  };

  // Filter and sort subscriptions
  const filteredAndSortedSubscriptions = [...subscriptions]
    .filter(subscription => {
      if (!searchTerm) return true;
      
      const userName = (subscription.user?.name || "").toLowerCase();
      const userEmail = (subscription.user?.email || "").toLowerCase();
      const planType = (subscription.planType || "").toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return userName.includes(searchLower) || 
             userEmail.includes(searchLower) || 
             planType.includes(searchLower);
    })
    .sort((a, b) => {
      let compareA, compareB;
      
      if (sortBy === "createdAt") {
        compareA = new Date(a.createdAt).getTime();
        compareB = new Date(b.createdAt).getTime();
      } else if (sortBy === "expiryDate") {
        compareA = new Date(a.expiryDate).getTime();
        compareB = new Date(b.expiryDate).getTime();
      } else if (sortBy === "planType") {
        compareA = a.planType || "";
        compareB = b.planType || "";
      } else if (sortBy === "price") {
        compareA = a.price || 0;
        compareB = b.price || 0;
      } else if (sortBy === "status") {
        compareA = getSubscriptionStatus(a);
        compareB = getSubscriptionStatus(b);
      }
      
      if (sortDirection === "asc") {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });

  // Calculate stats
  const activeSubscriptions = subscriptions.filter(sub => getSubscriptionStatus(sub) === "Active").length;
  const expiredSubscriptions = subscriptions.filter(sub => getSubscriptionStatus(sub) === "Expired").length;
  

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
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
              Subscription Management
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full md:w-64"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 border-l-4 border-red-500 p-4 rounded-md mb-6">
              <p>{error}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-orange-100 text-left">
                  <th className="px-4 py-3 rounded-tl-lg">User</th>
                  <th 
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => handleSort("planType")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Plan Type</span>
                      {sortBy === "planType" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Price</span>
                      {sortBy === "price" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Start Date</span>
                      {sortBy === "createdAt" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => handleSort("expiryDate")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Expiry Date</span>
                      {sortBy === "expiryDate" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer rounded-tr-lg"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {sortBy === "status" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedSubscriptions.map((subscription) => (
                  <tr 
                    key={subscription.id} 
                    onClick={() => handleUserClick(subscription.userId)}
                    className="border-b border-orange-100 hover:bg-orange-50 cursor-pointer transition-colors"
                  >
<td className="px-4 py-4">
  <div className="flex items-center space-x-3">
    <div className="bg-orange-200 p-2 rounded-full">
      <User className="h-5 w-5 text-orange-700" />
    </div>
    <div>
      {/* Access user data differently */}
      <div className="font-medium">
        User ID: {subscription.userId}
      </div>
      <div className="text-sm text-gray-500">
        {/* No email available directly */}
      </div>
    </div>
  </div>
</td>
<td className="px-4 py-4">
  <span className="font-medium">{subscription.orderId}</span> {/* use something else instead of planType */}
</td>
<td className="px-4 py-4">
  <span className="font-medium">₹{subscription.amount}</span> {/* use amount instead of price */}
</td>
<td className="px-4 py-4">
  <div className="flex items-center">
    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
    <span>{formatDate(subscription.createdAt)}</span> {/* use createdAt instead of startDate */}
  </div>
</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{formatDate(subscription.expiryDate)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        {getSubscriptionStatus(subscription) === "Active" ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        )}
                        <span 
                          className={`font-medium ${
                            getSubscriptionStatus(subscription) === "Active" 
                              ? "text-green-600" 
                              : "text-red-600"
                          }`}
                        >
                          {getSubscriptionStatus(subscription)}
                          {getSubscriptionStatus(subscription) === "Active" && (
                            <span className="text-gray-500 font-normal ml-1">
                              ({getDaysRemaining(subscription)} days left)
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAndSortedSubscriptions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      No subscriptions found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Subscription Summary</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-800">{subscriptions.length}</p>
                </div>
                <div className="bg-orange-200 p-3 rounded-full">
                  <User className="h-6 w-6 text-orange-700" />
                </div>
              </div>
            </div>
            <div className="bg-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-800">{activeSubscriptions}</p>
                </div>
                <div className="bg-green-200 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-700" />
                </div>
              </div>
            </div>
            <div className="bg-red-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Expired Subscriptions</p>
                  <p className="text-2xl font-bold text-gray-800">{expiredSubscriptions}</p>
                </div>
                <div className="bg-red-200 p-3 rounded-full">
                  <XCircle className="h-6 w-6 text-red-700" />
                </div>
              </div>
            </div>
          </div>
         
        </div>
      </div>
    </div>
  );
};

export default AllSubscriptions;