import React, { useState } from "react";
import { Button, Form, Input } from "antd";
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
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="pt-4 sm:pt-6 md:pt-8 pb-2 sm:pb-4 px-4 sm:px-6 md:px-8 text-center">
        <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-4xl drop-shadow-lg">
          {title}
        </h1>
        <h2 className="text-white font-bold text-lg sm:text-xl md:text-2xl mt-2 sm:mt-3 drop-shadow-lg">
          {subtitle}
        </h2>
      </div>

      {/* Form Section */}
      <div className="flex-1 px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          requiredMark={false}
          className="h-full flex flex-col justify-center"
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
              className="!rounded-lg !py-2 sm:!py-3 !px-3 !border-0 !bg-white/80 !backdrop-blur-sm !text-sm sm:!text-base"
              maxLength={10}
              onKeyPress={(event) => {
                if (!/[0-9]/.test(event.key)) {
                  event.preventDefault();
                }
              }}
            />
          </Form.Item>

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
              className="!rounded-lg !py-2 sm:!py-3 !px-3 !border-0 !bg-white/80 !backdrop-blur-sm !text-sm sm:!text-base"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          {/* Login Button */}
          <div className="text-center mt-2 sm:mt-4">
            <Button
              onClick={() => form.submit()}
              loading={loading}
              className="!w-[70%] sm:!w-[60%] !rounded-full !h-10 sm:!h-12 !font-medium !border-0 !bg-gradient-to-r !from-[#FF914D] !to-[#FF3A50] !text-white !shadow-lg hover:!shadow-xl !transition-all !duration-300 !text-sm sm:!text-base"
            >
              Đăng nhập
            </Button>
          </div>

          {/* Toggle to Register */}
          <div className="text-center mt-3 sm:mt-4">
            <button
              type="button"
              onClick={onToggleForm}
              className="text-white/80 text-xs sm:text-sm hover:text-white transition-colors underline"
            >
              Chưa có tài khoản? Đăng ký ngay
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default LoginForm;