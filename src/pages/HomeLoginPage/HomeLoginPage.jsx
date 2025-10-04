import { motion } from "framer-motion";
import LogoColor from "../../assets/LogoColor.png";
import { Button, Form, Input } from "antd";
import authService from "../../services/authServices";
import toast from "react-hot-toast";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { FaFacebook, FaGoogle, FaApple } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { login } from "../../redux/features/userSlice";
import { useNavigate } from "react-router-dom";
import { route } from "./../../routes/index";
import Cookies from "js-cookie";
import LoadingLogo from "../../components/LoadingLogo/LoadingLogo";
export default function HomeLoginPage() {
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#242424] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Top white section with logo */}
          <div className="pt-6 sm:pt-8 pb-3 sm:pb-4 px-4 sm:px-6 md:px-8 text-center">
            {/* <img
              src={LogoColor}
              alt="GymRadar Logo"
              className="h-30 w-30 items-center justify-center mx-auto"
            /> */}
            <div className="scale-75 sm:scale-90 md:scale-100">
              <LoadingLogo/>
            </div>
            <h1 className="text-[#FF3A50] font-bold text-2xl sm:text-3xl lg:text-4xl">GymRadar</h1>
            <h2 className="text-[#FF3A50] font-bold text-xl sm:text-2xl lg:text-3xl mt-3 sm:mt-5">
              Đăng Nhập
            </h2>
          </div>

          {/* Middle gradient section with form */}
          <div className="!bg-gradient-to-br !from-[#FF914D] !to-[#FF3A50] !py-6 sm:!py-8 md:!py-10 !px-4 sm:!px-8 md:!px-12 lg:!px-20">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleLogin}
              requiredMark={false}
            >
              <Form.Item
                label={
                  <span className="text-base sm:text-lg md:text-xl font-bold text-white">
                    Số điện thoại
                  </span>
                }
                name="phone"
                rules={[
                  {
                    required: true,
                    message: (
                      <p className="text-white !mt-1">
                        Vui lòng nhập số điện thoại
                      </p>
                    ),
                  },
                  {
                    pattern: /^[0-9]+$/,
                    message: (
                      <p className="text-white !mt-1">Vui lòng chỉ nhập số</p>
                    ),
                  },
                ]}
              >
                <Input
                  prefix={
                    <>
                      <PhoneOutlined className="text-gray-400" />
                    </>
                  }
                  placeholder="09XXXXXXXX"
                  type="tel"
                  className="!rounded-lg !py-2 sm:!py-3 !px-3 !border-0 !text-sm sm:!text-base"
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
                  <span className="text-base sm:text-lg md:text-xl font-bold text-white">Mật khẩu</span>
                }
                name="password"
                rules={[
                  {
                    required: true,
                    message: (
                      <p className="text-white !mt-1">Vui lòng nhập mật khẩu</p>
                    ),
                  },
                ]}
                className="mb-0"
              >
                <Input.Password
                  prefix={
                    <>
                      <LockOutlined className="text-gray-400" />
                    </>
                  }
                  placeholder="••••••"
                  className="!rounded-lg !py-2 sm:!py-3 !px-3 !border-0 !text-sm sm:!text-base"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>
            </Form>
          </div>

          {/* Bottom white section with buttons */}
          <div className="px-4 sm:px-6 py-4 sm:py-6 bg-white text-center">
            <Button
              onClick={() => form.submit()}
              loading={loading}
              color="orange"
              variant="solid"
              className="!w-full sm:!w-[60%] md:!w-[50%] lg:!w-[35%] !rounded-full !h-10 sm:!h-12 !font-medium !border-0 !text-sm sm:!text-base"
            >
              Đăng nhập
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
