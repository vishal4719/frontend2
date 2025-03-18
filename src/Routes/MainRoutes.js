import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import Home from '../Components/Home/Home';
import Signup from '../Components/Signup';
import Dashboard from '../Components/Dasboard';
import Course from '../Components/Course/Course';
import EnrolledCourses from '../Components/Course/EnrolledCourses';
import Logout from '../Components/Logout';
import Profile from '../Components/Profile';
import CourseDetail from '../Components/CourseDetail';
import VideoDetail from '../Components/Video/VideoDetail';
import VideoPlayer from "../Components/Video/VideoPlayer";
import AdminDashboard from '../Admin/AdminDashboard';
import AdminCoursePreview from '../Admin/Components/AdminCoursePreview';
import AdminVideoPreview from '../Admin/Components/AdminVideoPreview';
import UserEnrolledCourses from '../Admin/UserEnrolledCources';
import UserDetails from '../Admin/UserDetails';
import PlaylistManager from '../Admin/PlalylistManger';
import ForgotPassword from '../Components/ForgotPassword';
import ResetPassword from '../Components/ResetPassword';
import TermsAndConditions from '../Components/TermsAndCondition';
import PurchaseDetail from '../Components/Purchase/PurchaseDetail';
import PurchaseHistory from '../Components/Purchase/PurchaseHistory';
import PracticePage from '../Components/Practice/PracticePage';
import InterviewPage from '../Components/InterviewPage';
import PaymentPage from '../Components/Payment/PaymentPage';
import PaymentGuard from '../Components/Payment/PaymentGuard';
import UserSubscription from '../Admin/UserSubscription';
import AllSubscriptions from '../Admin/AllSubscriptions';


const MainRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/course/:playlistId" element={<ProtectedRoute><Course /></ProtectedRoute>} />
      <Route path="/video/:videoId" element={<ProtectedRoute><VideoPlayer /></ProtectedRoute>} />
      <Route path="/enrolled-courses" element={<ProtectedRoute><EnrolledCourses /></ProtectedRoute>} />
      <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
      <Route path="/videodetail/:videoId" element={<ProtectedRoute><VideoDetail /></ProtectedRoute>
      } />
      <Route path="/coursedetail/:playlistId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/coursepreview/:playlistId" element={<ProtectedRoute><AdminCoursePreview /></ProtectedRoute>} />
      <Route path="/videopreview/:videoId" element={<ProtectedRoute><AdminVideoPreview /></ProtectedRoute>} />
      <Route path="/userdetails" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />
      <Route path="/admin/user/:userId/courses" element={<ProtectedRoute><UserEnrolledCourses /></ProtectedRoute>} />
      <Route path="/admin/playlists" element={<ProtectedRoute><PlaylistManager /></ProtectedRoute>} />
      <Route path="/purchases" element={<ProtectedRoute><PurchaseHistory /></ProtectedRoute>} />
      <Route path="/purchase/:purchaseId" element={<ProtectedRoute><PurchaseDetail /></ProtectedRoute>}/>
 <Route path="/practice" element={
    <PaymentGuard>
      <PracticePage />
    </PaymentGuard>
  } />
      <Route path="/payment" element={<PaymentPage />} />
      <Route 
          path="/practice" 
          element={
            <PaymentGuard>
              <PracticePage />
            </PaymentGuard>
          } 
        />
        <Route path="/premium/dashboard" element={<h2>Premium Dashboard</h2>} />
        <Route path="/admin/user/:userId/subscription" element={<UserSubscription />} />
        <Route path="/admin/subscriptions" element={<AllSubscriptions />} />

     
    </Routes>
  );
};

export default MainRoutes;