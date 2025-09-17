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
  PhoneOutlined,
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

  const handleLogin = async (values) => {
    setLoading(true);
    console.log("Login values:", values);
    const requestData = {
      phone: values.phone,
      password: values.password,
    };
    console.log("Request data:", requestData);
    try {
      const response = await authService.login(requestData);
      console.log("Login response:", response);
      console.log(response.data.role);
      if (response.data.role === "ADMIN") {
        navigate(`${route.admin}/${route.dashboard}`);
      } else if (response.data.role === "GYM") {
        navigate(`${route.gym}/${route.dashboardGym}`);
      } else {
        toast.error("Tài khoản không có quyền truy cập");
        return;
      }
      const user = {
        id: response.data.id,
        fullName: response.data.fullName,
        phone: response.data.phone,
        role: response.data.role,
      };
      Cookies.set("token", response.data.accessToken);
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
                  Số điện thoại
                </span>
              }
              name="phone"
              rules={[
                {
                  required: true,
                  message: (
                    <p className="text-red-300 !mt-1">
                      Vui lòng nhập số điện thoại
                    </p>
                  ),
                },
                {
                  pattern: /^[0-9]+$/,
                  message: (
                    <p className="text-red-300 !mt-1">
                      Vui lòng chỉ nhập số
                    </p>
                  ),
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="text-gray-500" />}
                placeholder="09XXXXXXXX"
                type="tel"
                className="rounded-lg py-2 sm:py-3 px-3 border-0 bg-white/80 backdrop-blur-sm text-sm sm:text-base transition-all duration-300 hover:bg-white/90 focus:bg-white/90"
                maxLength={10}
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
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
                  message: (
                    <p className="text-red-300 !mt-1">
                      Vui lòng nhập mật khẩu
                    </p>
                  ),
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