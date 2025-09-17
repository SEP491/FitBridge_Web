import React, { useState, useCallback } from "react";
import { Button } from "antd";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { 
  MailOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import authService from "../../services/authServices";

const EmailConfirmForm = ({ title = "GymRadar", subtitle = "Xác Thực Email" }) => {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get email and token from URL params with manual + character handling
  const email = searchParams.get('email') || 'user@gymradar.com';
  
  // Fix the token by replacing spaces back to + characters
  const rawToken = searchParams.get('token') || 'ABC123';
  const token = rawToken.replace(/ /g, '+'); // Replace all spaces with + characters

  // Debug logging to show extracted values
  console.log("Extracted from URL - Email:", email);
  console.log("Raw Token (with spaces):", rawToken);
  console.log("Fixed Token (with +):", token);

  const handleVerify = useCallback(async () => {
    setLoading(true);
    console.log("Verifying with token:", token, "for email:", email);
    
    try {
      // Call the actual email confirmation API
      const response = await authService.emailConfirm(email, token);
      console.log("Email confirmation response:", response);
      
      setVerified(true);
      toast.success("Email đã được xác thực thành công!");
      
      
    } catch (error) {
      console.error("Email verification error:", error);
      
      // Handle different types of errors
      if (error.response?.status === 400) {
        toast.error("Mã xác thực không hợp lệ hoặc đã hết hạn");
      } else if (error.response?.status === 404) {
        toast.error("Không tìm thấy email hoặc token");
      } else if (error.response?.status === 409) {
        toast.error("Email đã được xác thực trước đó");
      } else {
        toast.error("Xác thực email thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  }, [email, token, navigate]); // Dependencies for useCallback


  return (
    <motion.div
      className="w-full h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 6.5 }}
    >
      {/* Header */}
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 7 }}
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg mb-2">
          {title}
        </h1>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white/90 drop-shadow">
          {subtitle}
        </h2>
      </motion.div>

      {/* Email Info */}
      <motion.div 
        className="text-center mb-6 space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 7.2 }}
      >
        <p className="text-sm sm:text-base font-semibold text-white bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 inline-flex items-center gap-2">
          <MailOutlined className="text-blue-200" />
          {email}
        </p>
        
      </motion.div>

      {/* Success Animation or Verify Button */}
      <AnimatePresence mode="wait">
        {!verified ? (
          <motion.div 
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 7.4 }}
          >
            {/* Verify Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 7.8 }}
            >
              <Button
                type="primary"
                onClick={handleVerify}
                loading={loading}
                className="w-full h-12 sm:h-14 rounded-lg text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 border-0 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                 style={{
                  background: 'linear-gradient(to right, #FF914D, #FF3A50)',
                  border: 'none',
                  boxShadow: '0 4px 15px 0 rgba(255, 145, 77, 0.3)'
                }}
              >
                {loading ? "Đang xác thực..." : "Xác Thực Email"}
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center w-full max-w-md"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.8, 
              ease: "backOut",
              scale: { delay: 0.2 }
            }}
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                duration: 0.6,
                delay: 0.3,
                type: "spring",
                stiffness: 300
              }}
            >
              <CheckCircleOutlined 
                className="text-6xl sm:text-8xl text-green-400 mb-4"
                style={{ filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))', color:'green' }}
              />
            </motion.div>
            
            {/* Success Message */}
            <motion.h3
              className="text-xl sm:text-2xl font-bold text-white mb-2 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Xác thực thành công!
            </motion.h3>
            
            <motion.p
              className="text-sm sm:text-base text-white/80 text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              Email của bạn đã được xác thực
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default EmailConfirmForm;