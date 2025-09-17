import React, { useState } from "react";
import { Button, Form, Input, DatePicker, Select } from "antd";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import authService from "../../services/authServices";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  PhoneOutlined,
  UserOutlined,
  MailOutlined,
  BankOutlined,
  HomeOutlined,
} from "@ant-design/icons";


const RegisterForm = ({ title = "GymRadar", subtitle = "Đăng Ký", onToggleForm }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values) => {
    setLoading(true);
    console.log("Register values:", values);
    const requestData = {
      email: values.email,
      phoneNumber: values.phoneNumber,
      password: values.password,
      fullName: values.fullName,
      dob: values.dob ? values.dob.toISOString() : null,
      gymName: values.gymName,
      taxCode: values.taxCode,
      role: values.role || "GYM",
      isMale: values.isMale,
      isTestAccount: false,
    };
    console.log("Request data:", requestData);
    try {
      const response = await authService.register(requestData);
      console.log("Register response:", response);
      
      // Show detailed success message
      toast.success(
        "🎉 Đăng ký thành công!\n📧 Vui lòng kiểm tra email để xác thực tài khoản của bạn.",
        {
          duration: 6000,
          style: {
            background: '#10b981',
            color: '#ffffff',
            fontSize: '14px',
            textAlign: 'left',
            whiteSpace: 'pre-line'
          }
        }
      );
      
      form.resetFields();
      
      // Switch back to login form after successful registration
      if (onToggleForm) {
        setTimeout(() => {
          onToggleForm();
        }, 3000);
      }
      
    } catch (error) {
      console.log("Register error:", error);
      toast.error(error.response?.data?.message || "Đăng ký thất bại");
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
        className="flex-1 px-12 overflow-y-scroll pt-[30vh] "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRegister}
          requiredMark={false}
          className="h-full flex flex-col justify-center space-y-2"
          initialValues={{
            isMale: true
          }}
        >
          {/* Row 1: Full Name and Email */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Form.Item
              label={
                <span className="text-xs sm:text-sm font-bold text-white drop-shadow">
                  Họ và tên
                </span>
              }
              name="fullName"
              rules={[
                {
                  required: true,
                  message: <p className="text-red-300 !mt-1">Vui lòng nhập họ và tên</p>
                },
                {
                  min: 2,
                  message: <p className="text-red-300 !mt-1">Họ và tên phải có ít nhất 2 ký tự</p>
                },
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-500" />}
                placeholder="Nguyễn Văn A"
                className="rounded-lg py-1.5 sm:py-2 px-3 border-0 bg-white/80 backdrop-blur-sm text-xs sm:text-sm transition-all duration-300 hover:bg-white/90 focus:bg-white/90"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-xs sm:text-sm font-bold text-white drop-shadow">
                  Email
                </span>
              }
              name="email"
              rules={[
                {
                  required: true,
                  message: <p className="text-red-300 !mt-1">Vui lòng nhập email</p>
                },
                {
                  type: 'email',
                  message: <p className="text-red-300 !mt-1">Email không hợp lệ</p>
                },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-500" />}
                placeholder="example@email.com"
                className="rounded-lg py-1.5 sm:py-2 px-3 border-0 bg-white/80 backdrop-blur-sm text-xs sm:text-sm transition-all duration-300 hover:bg-white/90 focus:bg-white/90"
              />
            </Form.Item>
          </motion.div>

          {/* Row 2: Phone Number */}
          <motion.div 
            className="grid grid-cols-1 gap-3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Form.Item
              label={
                <span className="text-xs sm:text-sm font-bold text-white drop-shadow">
                  Số điện thoại
                </span>
              }
              name="phoneNumber"
              rules={[
                {
                  required: true,
                  message: <p className="text-red-300 !mt-1">Vui lòng nhập số điện thoại</p>
                },
                {
                  pattern: /^(03|05|07|08|09)[0-9]{8}$/,
                  message: <p className="text-red-300 !mt-1">Số điện thoại không hợp lệ</p>
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="text-gray-500" />}
                placeholder="09XXXXXXXX"
                type="tel"
                className="rounded-lg py-1.5 sm:py-2 px-3 border-0 bg-white/80 backdrop-blur-sm text-xs sm:text-sm transition-all duration-300 hover:bg-white/90 focus:bg-white/90"
                maxLength={10}
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </motion.div>

          {/* Row 3: Date of Birth, Role and Gender */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Form.Item
              label={
                <span className="text-xs sm:text-sm font-bold text-white drop-shadow">
                  Ngày sinh
                </span>
              }
              name="dob"
              rules={[
                {
                  required: true,
                  message: <p className="text-red-300 !mt-1">Vui lòng chọn ngày sinh</p>
                }
              ]}
            >
              <DatePicker
                placeholder="Chọn ngày sinh"
                format="DD/MM/YYYY"
                className="rounded-lg py-1.5 sm:py-2 px-3 border-0 bg-white/80 backdrop-blur-sm text-xs sm:text-sm w-full transition-all duration-300 hover:bg-white/90"
                disabledDate={(current) => current && current.isAfter(dayjs().subtract(16, 'year'))}
                maxDate={dayjs().subtract(16, 'year')}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(4px)',
                  border: 'none'
                }}
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-xs sm:text-sm font-bold text-white drop-shadow">
                  Vai trò
                </span>
              }
              name="role"
              rules={[
                {
                  required: true,
                  message: <p className="text-red-300 !mt-1">Vui lòng chọn vai trò</p>
                }
              ]}
            >
              <Select
                placeholder="Chọn vai trò"
                className="text-xs sm:text-sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '8px'
                }}
                dropdownStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)'
                }}
              >
                <Select.Option value="GymOwner">Chủ phòng gym</Select.Option>
                <Select.Option value="GymPT">Huấn luyện viên phòng gym</Select.Option>
                <Select.Option value="Admin">Quản trị viên</Select.Option>
                <Select.Option value="Customer">Khách hàng</Select.Option>
                <Select.Option value="FreelancePT">Huấn luyện viên tự do</Select.Option>



              </Select>
            </Form.Item>

            <Form.Item
              label={
                <span className="text-xs sm:text-sm font-bold text-white drop-shadow">
                  Giới tính
                </span>
              }
              name="isMale"
              rules={[
                {
                  required: true,
                  message: <p className="text-red-300 !mt-1">Vui lòng chọn giới tính</p>
                }
              ]}
            >
              <Select
                placeholder="Chọn giới tính"
                className="text-xs sm:text-sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '8px'
                }}
                dropdownStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)'
                }}
              >
                <Select.Option value={true}>Nam</Select.Option>
                <Select.Option value={false}>Nữ</Select.Option>
              </Select>
            </Form.Item>
          </motion.div>

          {/* Row 4: Gym Name and Tax Code */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <Form.Item
              label={
                <span className="text-xs sm:text-sm font-bold text-white drop-shadow">
                  Tên phòng gym
                </span>
              }
              name="gymName"
              rules={[
                {
                  required: true,
                  message: <p className="text-red-300 !mt-1">Vui lòng nhập tên phòng gym</p>
                }
              ]}
            >
              <Input
                prefix={<HomeOutlined className="text-gray-500" />}
                placeholder="Tên phòng gym"
                className="rounded-lg py-1.5 sm:py-2 px-3 border-0 bg-white/80 backdrop-blur-sm text-xs sm:text-sm transition-all duration-300 hover:bg-white/90 focus:bg-white/90"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-xs sm:text-sm font-bold text-white drop-shadow">
                  Mã số thuế
                </span>
              }
              name="taxCode"
              rules={[
                {
                  required: true,
                  message: <p className="text-red-300 !mt-1">Vui lòng nhập mã số thuế</p>
                },
                {
                  pattern: /^[0-9]{10,13}$/,
                  message: <p className="text-red-300 !mt-1">Mã số thuế phải từ 10-13 số</p>
                }
              ]}
            >
              <Input
                prefix={<BankOutlined className="text-gray-500" />}
                placeholder="1234567890"
                className="rounded-lg py-1.5 sm:py-2 px-3 border-0 bg-white/80 backdrop-blur-sm text-xs sm:text-sm transition-all duration-300 hover:bg-white/90 focus:bg-white/90"
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </motion.div>



          {/* Row 5: Password Fields */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <Form.Item
              label={
                <span className="text-xs sm:text-sm font-bold text-white drop-shadow">
                  Mật khẩu
                </span>
              }
              name="password"
              rules={[
                {
                  required: true,
                  message: <p className="text-red-300 !mt-1">Vui lòng nhập mật khẩu</p>
                },
                {
                  min: 6,
                  message: <p className="text-red-300 !mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-500" />}
                placeholder="••••••"
                className="rounded-lg py-1.5 sm:py-2 px-3 border-0 bg-white/80 backdrop-blur-sm text-xs sm:text-sm transition-all duration-300 hover:bg-white/90 focus:bg-white/90"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-xs sm:text-sm font-bold text-white drop-shadow">
                  Xác nhận mật khẩu
                </span>
              }
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                {
                  required: true,
                  message: <p className="text-red-300 !mt-1">Vui lòng xác nhận mật khẩu</p>
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
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-500" />}
                placeholder="••••••"
                className="rounded-lg py-1.5 sm:py-2 px-3 border-0 bg-white/80 backdrop-blur-sm text-xs sm:text-sm transition-all duration-300 hover:bg-white/90 focus:bg-white/90"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>
          </motion.div>

          {/* Register Button */}
          <motion.div 
            className="text-center mt-2 sm:mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => form.submit()}
                loading={loading}
                className="w-[70%] sm:w-[60%] rounded-full h-10 sm:h-12 font-medium border-0 bg-gradient-to-r from-[#FF914D] to-[#FF3A50] text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                style={{
                  background: 'linear-gradient(to right, #FF914D, #FF3A50)',
                  border: 'none',
                  boxShadow: '0 4px 15px 0 rgba(255, 145, 77, 0.3)'
                }}
              >
                Đăng ký
              </Button>
            </motion.div>
          </motion.div>

          {/* Toggle to Login */}
          <motion.div 
            className="text-center mt-3 sm:mt-4 pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.8 }}
          >
            <motion.button
              type="button"
              onClick={onToggleForm}
              className="text-white/80 text-xs sm:text-sm hover:text-white transition-colors underline"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Đã có tài khoản? Đăng nhập ngay
            </motion.button>
          </motion.div>
        </Form>
      </motion.div>
    </motion.div>
  );
};

export default RegisterForm;