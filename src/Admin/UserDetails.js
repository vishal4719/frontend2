import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Trash2, User, Mail, Shield, Search } from "lucide-react";
import Navbar from "./Components/Navbar";

const UserDetails = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_HOST}/api/auth/admin/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      setError("Failed to fetch users. Please try again later.");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, event) => {
    event.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setError(null);
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_HOST}/api/auth/admin/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      setError("Failed to delete user. Please try again later.");
      console.error("Error deleting user:", error);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/admin/user/${userId}/courses`);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  // Fixed filter logic with null/undefined checks
  const sortedAndFilteredUsers = [...users]
    .filter(user => {
      if (!searchTerm) return true;
      
      const name = (user.name || "").toLowerCase();
      const lName = (user.lName || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      
      return name.includes(searchLower) || 
             lName.includes(searchLower) || 
             email.includes(searchLower);
    })
    .sort((a, b) => {
      let compareA, compareB;
      
      if (sortBy === "name") {
        compareA = `${a.name || ""} ${a.lName || ""}`;
        compareB = `${b.name || ""} ${b.lName || ""}`;
      } else if (sortBy === "email") {
        compareA = a.email || "";
        compareB = b.email || "";
      } else if (sortBy === "role") {
        compareA = (a.roles || []).join(", ");
        compareB = (b.roles || []).join(", ");
      }
      
      if (sortDirection === "asc") {
        return compareA.localeCompare(compareB);
      } else {
        return compareB.localeCompare(compareA);
      }
    });

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
              User Management
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
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
                  <th 
                    className="px-4 py-3 rounded-tl-lg cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      {sortBy === "name" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Email</span>
                      {sortBy === "email" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Role</span>
                      {sortBy === "role" && (
                        <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 rounded-tr-lg text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    onClick={() => handleUserClick(user.id)}
                    className="border-b border-orange-100 hover:bg-orange-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-orange-200 p-2 rounded-full">
                          <User className="h-5 w-5 text-orange-700" />
                        </div>
                        <span className="font-medium">
                          {user.name || ""} {user.lName || ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <span>{user.email || ""}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-gray-400" />
                        <span>{(user.roles || []).join(", ")}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={(e) => handleDeleteUser(user.id, e)}
                        className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white focus:outline-none transition-colors"
                        aria-label="Delete user"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {sortedAndFilteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      No users found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Summary</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-800">{users.length}</p>
                </div>
                <div className="bg-orange-200 p-3 rounded-full">
                  <User className="h-6 w-6 text-orange-700" />
                </div>
              </div>
            </div>
            <div className="bg-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Admin Users</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {users.filter(user => Array.isArray(user.roles) && user.roles.includes("ADMIN")).length}
                  </p>
                </div>
                <div className="bg-orange-200 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-orange-700" />
                </div>
              </div>
            </div>
            <div className="bg-orange-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Regular Users</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {users.filter(user => !Array.isArray(user.roles) || !user.roles.includes("ADMIN")).length}
                  </p>
                </div>
                <div className="bg-orange-200 p-3 rounded-full">
                  <User className="h-6 w-6 text-orange-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;