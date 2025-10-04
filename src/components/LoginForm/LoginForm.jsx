import React, { useState } from "react";
import { Button, Form, Input } from "antd";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import authService from "../../services/authServices";
import toast from "react-hot-toast";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { login } from "../../redux/features/userSlice";
import { useNavigate } from "react-router-dom";
import { route } from "../../routes/index";
import Cookies from "js-cookie";

const LoginForm = ({ title = "GymRadar", subtitle = "Đăng Nhập", onToggleForm }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // JWT Decode function
  const decodeJWT = (token) => {
    try {
      // Split the token into parts
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token');
      }

      // Decode the payload (second part)
      const payload = parts[1];
      // Add padding if needed
      const paddedPayload = payload + '==='.slice((payload.length + 3) % 4);
      const decoded = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
      
      return JSON.parse(decoded);
    } catch (error) {
      console.error('JWT decode error:', error);
      return null;
    }
  };

  const handleLogin = async (values) => {
    setLoading(true);
    console.log("Login values:", values);
    
    const requestData = {
      identifier: values.email,
      password: values.password,
    };
    console.log("Request data:", requestData);
    try {
      const response = await authService.login(requestData);
      console.log("Login response:", response);
      
      // Decode the idToken to get user data
      let decodedToken = null;
      if (response.data.idToken) {
        decodedToken = decodeJWT(response.data.idToken);
        console.log("Decoded JWT Token:", decodedToken);
      }

      // Use decoded token data if available, otherwise use response data
      const userData = decodedToken || response.data;
      const userRole = userData.role || response.data.role;
      
      console.log("User role:", userRole);
      
      // Route based on role
      if (userRole === "Admin") {
        navigate(`${route.admin}/${route.dashboard}`);
      } else if (userRole === "GYM" || userRole === "GymOwner") {
        navigate(`${route.gym}/${route.dashboardGym}`);
      } else if (userRole === "PT" || userRole === "FreelancePT") {
        navigate(`${route.freelancePt}/${route.manageVoucherPT}`);
      } else {
        toast.error("Tài khoản không có quyền truy cập");
        return;
      }
      
      // Create user object from decoded token or response data
      const user = {
        id: userData.sub || userData.id || response.data.id,
        fullName: userData.name || userData.fullName || response.data.fullName,
        email: userData.email || response.data.email,
        phone: userData.phone_number || userData.phone || response.data.phone,
        role: userRole,
        gymName: userData.gymName,
        gender: userData.gender,
        birthdate: userData.birthdate,
        senderAvatar: userData.senderAvatar,
      };
      
      console.log("Final user object:", user);
      
      // Store tokens and user data
      Cookies.set("accessToken", response.data.accessToken);
      Cookies.set("idToken", response.data.idToken);
      Cookies.set("refreshToken", response.data.refreshToken);
      Cookies.set("user", JSON.stringify(user));
      
      dispatch(login(user));
      toast.success("Đăng nhập thành công");
    } catch (error) {
      console.log("Login error:", error);
      toast.error(error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <motion.div 
        className="pt-4 sm:pt-6 md:pt-8 pb-2 sm:pb-4 px-4 sm:px-6 md:px-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-4xl drop-shadow-lg">
          {title}
        </h1>
        <h2 className="text-white font-bold text-lg sm:text-xl md:text-2xl mt-2 sm:mt-3 drop-shadow-lg">
          {subtitle}
        </h2>
      </motion.div>

      {/* Form Section */}
      <motion.div 
        className="flex-1 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          requiredMark={false}
          className="h-full flex flex-col justify-center"
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Form.Item
              label={
                <span className="text-sm sm:text-base md:text-lg font-bold text-white drop-shadow">
                  Email
                </span>
              }
              name="email"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập email",
                },
                {
                  type: "email",
                  message: "Vui lòng nhập email hợp lệ",
                },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-500" />}
                placeholder="email@example.com"
                type="email"
                className="rounded-lg py-2 sm:py-3 px-3 border-0 bg-white/80 backdrop-blur-sm text-sm sm:text-base transition-all duration-300 hover:bg-white/90 focus:bg-white/90"
              />
            </Form.Item>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Form.Item
              label={
                <span className="text-sm sm:text-base md:text-lg font-bold text-white drop-shadow">
                  Mật khẩu
                </span>
              }
              name="password"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu",
                },
              ]}
              className="mb-6"
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-500" />}
                placeholder="••••••"
                className="rounded-lg py-2 sm:py-3 px-3 border-0 bg-white/80 backdrop-blur-sm text-sm sm:text-base transition-all duration-300 hover:bg-white/90 focus:bg-white/90"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>
          </motion.div>

          {/* Login Button */}
          <motion.div 
            className="text-center mt-2 sm:mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => form.submit()}
                loading={loading}
                className="w-[70%] sm:w-[60%] rounded-full h-10 sm:h-12 font-medium border-0 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                style={{
                  background: 'linear-gradient(to right, #FF914D, #FF3A50)',
                  border: 'none',
                  boxShadow: '0 4px 15px 0 rgba(255, 145, 77, 0.3)'
                }}
              >
                Đăng nhập
              </Button>
            </motion.div>
          </motion.div>

          {/* Toggle to Register */}
          <motion.div 
            className="text-center mt-3 sm:mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <motion.button
              type="button"
              onClick={onToggleForm}
              className="text-white/80 text-xs sm:text-sm hover:text-white transition-colors underline"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Chưa có tài khoản? Đăng ký ngay
            </motion.button>
          </motion.div>
        </Form>
      </motion.div>
    </motion.div>
  );
};

export default LoginForm;