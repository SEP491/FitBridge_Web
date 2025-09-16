import React, { useState } from "react";
import { Button, Form, Input } from "antd";
import authService from "../../services/authServices";
import toast from "react-hot-toast";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  PhoneOutlined,
  UserOutlined,
} from "@ant-design/icons";

const RegisterForm = ({ title = "GymRadar", subtitle = "Đăng Ký", onToggleForm }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values) => {
    setLoading(true);
    console.log("Register values:", values);
    const requestData = {
      fullName: values.fullName,
      phone: values.phone,
      password: values.password,
      role: "GYM" // Default role for new registrations
    };
    console.log("Request data:", requestData);
    try {
      const response = await authService.register(requestData);
      console.log("Register response:", response);
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      form.resetFields();
      // Switch to login form after successful registration
      if (onToggleForm) {
        onToggleForm();
      }
    } catch (error) {
      console.log("Register error:", error);
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
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
          onFinish={handleRegister}
          requiredMark={false}
          className="h-full flex flex-col justify-center"
        >
          <Form.Item
            label={
              <span className="text-sm sm:text-base md:text-lg font-bold text-white drop-shadow">
                Họ và tên
              </span>
            }
            name="fullName"
            rules={[
              {
                required: true,
                message: (
                  <p className="text-red-300 !mt-1">
                    Vui lòng nhập họ và tên
                  </p>
                ),
              },
              {
                min: 2,
                message: (
                  <p className="text-red-300 !mt-1">
                    Họ và tên phải có ít nhất 2 ký tự
                  </p>
                ),
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-500" />}
              placeholder="Nguyễn Văn A"
              className="!rounded-lg !py-2 sm:!py-3 !px-3 !border-0 !bg-white/80 !backdrop-blur-sm !text-sm sm:!text-base"
            />
          </Form.Item>

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
              {
                len: 10,
                message: (
                  <p className="text-red-300 !mt-1">
                    Số điện thoại phải có đúng 10 số
                  </p>
                ),
              },
              {
                pattern: /^(03|05|07|08|09)[0-9]{8}$/,
                message: (
                  <p className="text-red-300 !mt-1">
                    Số điện thoại không hợp lệ
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
              {
                min: 6,
                message: (
                  <p className="text-red-300 !mt-1">
                    Mật khẩu phải có ít nhất 6 ký tự
                  </p>
                ),
              },
            ]}
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

          <Form.Item
            label={
              <span className="text-sm sm:text-base md:text-lg font-bold text-white drop-shadow">
                Xác nhận mật khẩu
              </span>
            }
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: (
                  <p className="text-red-300 !mt-1">
                    Vui lòng xác nhận mật khẩu
                  </p>
                ),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
            className="mb-4"
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

          {/* Register Button */}
          <div className="text-center mt-2 sm:mt-4">
            <Button
              onClick={() => form.submit()}
              loading={loading}
              className="!w-[70%] sm:!w-[60%] !rounded-full !h-10 sm:!h-12 !font-medium !border-0 !bg-gradient-to-r !from-[#FF914D] !to-[#FF3A50] !text-white !shadow-lg hover:!shadow-xl !transition-all !duration-300 !text-sm sm:!text-base"
            >
              Đăng ký
            </Button>
          </div>

          {/* Toggle to Login */}
          <div className="text-center mt-3 sm:mt-4">
            <button
              type="button"
              onClick={onToggleForm}
              className="text-white/80 text-xs sm:text-sm hover:text-white transition-colors underline"
            >
              Đã có tài khoản? Đăng nhập ngay
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default RegisterForm;