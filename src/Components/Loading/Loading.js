import React from "react";
import Lottie from "lottie-react";
import loadingAnimation from "./loding.json"; 

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <Lottie animationData={loadingAnimation} loop autoplay style={{ width: 300, height: 300 }} />
    </div>
  );
};

export default Loading;
