import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const loadRazorpayScript = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        setRazorpayLoaded(true);
      };
      document.body.appendChild(script);
    };

    // Load user data
    const loadUserData = () => {
      try {
        const userJson = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/signup', { state: { from: '/payment' } });
          return;
        }
        
        if (!userJson) {
          navigate('/signup', { state: { from: '/payment' } });
          return;
        }
        
        // Check if the user data is already an object
        if (typeof userJson === 'object') {
          setUser(userJson);
          return;
        }
        
        // Check if the user data is just an email string
        if (typeof userJson === 'string' && userJson.includes('@')) {
          setUser({ email: userJson });
          return;
        }
        
        // Try parsing as JSON
        try {
          const userData = JSON.parse(userJson);
          setUser(userData);
        } catch (e) {
          // Instead of immediately navigating away, store the email as user data if it looks like an email
          if (typeof userJson === 'string' && userJson.includes('@')) {
            setUser({ email: userJson });
          } else {
            navigate('/signup', { state: { from: '/payment' } });
          }
        }
      } catch (e) {
        console.error('Error loading user data:', e);
        navigate('/signup', { state: { from: '/payment' } });
      }
    };

    // Check if user already has premium access
    const checkPremiumStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setChecking(false);
          navigate('/signup', { state: { from: '/payment' } });
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_HOST}/api/payment/check-premium-status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data && response.data.isPremium) {
          // Store premium status tied to user ID or email
          const userJson = localStorage.getItem('user');
          let userId = '';
          
          try {
            const userData = JSON.parse(userJson);
            userId = userData.id || userData.email || '';
          } catch (e) {
            if (typeof userJson === 'string' && userJson.includes('@')) {
              userId = userJson;
            }
          }
          
          if (userId) {
            localStorage.setItem(`premium_${userId}`, 'true');
          }
          
          setPaymentStatus({
            isPremium: true,
            message: response.data.message || 'You already have premium access.'
          });
          
          // Automatically redirect to practice page after 3 seconds
          setTimeout(() => {
            navigate('/practice');
          }, 3000);
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
        // Clear any existing premium status if check fails
        const userJson = localStorage.getItem('user');
        if (userJson) {
          try {
            const userData = typeof userJson === 'object' ? userJson : JSON.parse(userJson);
            const userId = userData.id || userData.email || '';
            if (userId) {
              localStorage.removeItem(`premium_${userId}`);
            }
          } catch (e) {
            // If parsing fails, do nothing
          }
        }
      } finally {
        setChecking(false);
      }
    };

    loadRazorpayScript();
    loadUserData();
    checkPremiumStatus();
  }, [navigate]);

  const handlePayment = async () => {
    try {
      if (!razorpayLoaded) {
        setError('Payment system is still loading. Please try again in a moment.');
        return;
      }

      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signup', { state: { from: '/payment' } });
        return;
      }
      
      // Create an order
      const orderResponse = await axios.post(
        `${process.env.REACT_APP_HOST}/api/payment/create-order`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Check if the response indicates user already has subscription
      if (orderResponse.data && typeof orderResponse.data === 'string') {
        try {
          const parsedData = JSON.parse(orderResponse.data);
          if (parsedData.alreadySubscribed) {
            handleSuccessfulPayment();
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing order response:', e);
        }
      }
      
      // Parse order data
      let orderData;
      try {
        orderData = typeof orderResponse.data === 'string' 
          ? JSON.parse(orderResponse.data) 
          : orderResponse.data;
      } catch (e) {
        throw new Error('Invalid response from payment server. Please try again.');
      }
      
      // Configure Razorpay options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_live_yGBE93tUySUdJP',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'V-Skills',
        description: 'Premium Access',
        order_id: orderData.id,
        handler: function(response) {
          verifyPayment(
            response.razorpay_order_id, 
            response.razorpay_payment_id, 
            response.razorpay_signature
          );
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#F97316'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };
    
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function(response) {
        setError(`Payment failed: ${response.error?.description || 'Unknown error'}`);
        setLoading(false);
      });
      
      rzp.open();
    } catch (error) {
      console.error('Error creating order:', error);
      setError(error.message || error.response?.data?.error || error.response?.data?.message || 'Error processing payment. Please try again.');
      setLoading(false);
    }
  };

  const verifyPayment = async (orderId, paymentId, signature) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication token missing. Please login again.');
        setLoading(false);
        return;
      }
      
      if (!signature) {
        setError('Signature is missing from Razorpay response');
        setLoading(false);
        return;
      }
      
      // Verify payment with backend
      const response = await axios.post(
        `${process.env.REACT_APP_HOST}/api/payment/verify-payment`,
        {
          orderId: orderId,
          paymentId: paymentId,
          signature: signature
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Check for success explicitly
      if (response.data && response.data.success === true) {
        handleSuccessfulPayment();
      } else {
        setError(response.data?.message || 'Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setError('Payment verification failed: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleSuccessfulPayment = () => {
    // Store premium status tied to the current user ID or email
    const userJson = localStorage.getItem('user');
    let userId = '';
    
    try {
      const userData = typeof userJson === 'object' ? userJson : JSON.parse(userJson);
      userId = userData.id || userData.email || '';
    } catch (e) {
      if (typeof userJson === 'string' && userJson.includes('@')) {
        userId = userJson;
      }
    }
    
    if (userId) {
      localStorage.setItem(`premium_${userId}`, 'true');
    }
    
    setPaymentStatus({
      isPremium: true,
      message: 'Payment successful! Redirecting to practice page...'
    });
    
    // Redirect to practice page after 3 seconds
    setTimeout(() => {
      navigate('/practice');
    }, 3000);
  };

  // Show loading screen while checking premium status
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Checking subscription status...</p>
        </div>
      </div>
    );
  }
  
  if (paymentStatus?.isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">           
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-green-500" 
              width="32" 
              height="32"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Premium Access Confirmed</h2>
          <p className="text-gray-600 mb-6">{paymentStatus.message}</p>
          <div className="animate-pulse">
            <p className="text-sm text-gray-500">Redirecting to practice page...</p>
          </div>
          <button
            onClick={() => navigate('/practice')}
            className="mt-4 py-2 px-4 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            Go to Practice Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        {/* Display error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-orange-500" 
              width="32"
              height="32"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Premium Access Required</h2>
          <p className="text-gray-600 mb-6">
            Unlock unlimited practice tests with One Time Payment of just ₹1.
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-gray-800 mb-2">Premium Benefits:</h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <svg 
                className="h-5 w-5 text-green-500 mr-2 mt-0.5" 
                width="20"
                height="20"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Unlimited practice tests across all topics</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Detailed performance analytics</span>
            </li>
            <li className="flex items-start">
              <svg 
                className="h-5 w-5 text-green-500 mr-2 mt-0.5" 
                width="20"
                height="20"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Advanced difficulty levels</span>
            </li>
            <li className="flex items-start">
              <svg 
                className="h-5 w-5 text-green-500 mr-2 mt-0.5" 
                width="20"
                height="20"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Cancel anytime with no penalties</span>
            </li>
          </ul>
        </div>
        
        {/* Payment options information */}
        <div className="bg-orange-50 p-4 rounded-lg mb-6 border border-orange-200">
          <div className="flex justify-between mb-2">
            <span className="font-medium text-gray-800">One Time Payment:</span>
            <span className="font-bold text-orange-600">₹1/month</span>
          </div>
          <p className="text-xs text-gray-600">Secure payment via Razorpay.</p>
        </div>
        
        <button
          onClick={handlePayment}
          disabled={loading || !razorpayLoaded}
          className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors ${
            loading || !razorpayLoaded ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : !razorpayLoaded ? (
            'Loading payment system...'
          ) : (
            'Subscribe Now - ₹1/month'
          )}
        </button>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            Return to practice
          </button>
        </div>
        
        <div className="mt-6 text-xs text-gray-500 text-center">
          By subscribing, you agree to our Terms of Service and Privacy Policy.
         
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;