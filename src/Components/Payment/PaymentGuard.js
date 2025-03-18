import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentGuard = ({ children }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // First check localStorage
        const isPremium = localStorage.getItem('isPremium') === 'true';
        if (isPremium) {
          setHasPaid(true);
          setLoading(false);
          return;
        }

        // If not in localStorage, check with server
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/signup', { state: { from: '/practice' } });
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_HOST}/api/payment/check-premium-status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.active) {
          localStorage.setItem('isPremium', 'true');
          setHasPaid(true);
        } else {
          navigate('/payment');
        }
      } catch (error) {
        console.error('Error checking premium status:', error);
        navigate('/payment');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return hasPaid ? children : null;
};

export default PaymentGuard;