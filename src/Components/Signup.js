import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import codingImage from "../Assests/loginimg.png";
import Loading from "./Loading/Loading";

const Signup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        email: location.state.email,
        password: location.state.password,
      }));
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear password error when user is typing
    if (name === "password") {
      setPasswordError("");
    }
  };

  // Password validation function
  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return "";
  };

  // Handle successful authentication response
  const handleAuthSuccess = (response) => {
    if (response.data) {
      const { token, username, role } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", username);

      const userRole = Array.isArray(role) ? role[0] : role;
      localStorage.setItem("role", userRole);

      if (userRole === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate password
    const passwordValidationError = validatePassword(formData.password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
    
    setIsLoading(true);

    try {
      if (isLogin) {
        // Handle login
        const loginPayload = {
          email: formData.email,
          password: formData.password,
        };
        
        const response = await axios.post(
          `${process.env.REACT_APP_HOST}/api/auth/login`, 
          loginPayload
        );
        handleAuthSuccess(response);
      } else {
        // Handle signup
        const signupPayload = {
          name: formData.firstName,
          lname: formData.lastName,
          email: formData.email,
          password: formData.password,
        };
        
        // First create the account
        await axios.post(`${process.env.REACT_APP_HOST}/api/auth/signup`, signupPayload);
        
        // Then automatically log in the user
        const loginResponse = await axios.post(
          `${process.env.REACT_APP_HOST}/api/auth/login`, 
          {
            email: formData.email,
            password: formData.password,
          }
        );
        handleAuthSuccess(loginResponse);
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevents default form submission
      handleSubmit(e);
    }
  };

  return isLoading ? (
    <Loading />
  ) : (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row items-center justify-center p-4">
      <div className="w-screen lg:w-1/2 max-w-2xl p-4">
        <img src={codingImage} alt="Coding Setup" className="w-full h-auto" />
      </div>

      <div className="w-full lg:w-1/2 max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {isLogin ? "Welcome back!" : "Get Onboard and jumpstart your career!"}
          </h1>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </>
          )}

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email Address"
            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />

          <div className="space-y-2">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className={`w-full px-4 py-3 rounded-md border ${
                passwordError ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-orange-500`}
              required
            />
            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-orange-500 hover:text-orange-600 text-sm"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>

          {!isLogin && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mr-2"
                required
              />
              <label htmlFor="terms" className="text-gray-600">
                I accept the{" "}
                <button
                  type="button"
                  onClick={() => navigate("/terms-and-conditions")}
                  className="text-orange-500 hover:text-orange-600"
                >
                  Terms and Conditions
                </button>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-md hover:bg-orange-600 transition-colors"
            disabled={(!acceptedTerms && !isLogin) || passwordError}
          >
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setPasswordError("");
                setFormData({ firstName: "", lastName: "", email: "", password: "" });
              }}
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;