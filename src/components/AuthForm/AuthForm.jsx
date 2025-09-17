import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "../LoginForm/LoginForm";
import RegisterForm from "../RegisterForm/RegisterForm";

const AuthForm = ({ title = "FitBridge" }) => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const formVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <AnimatePresence mode="wait">
      {isLogin ? (
        <motion.div
          key="login"
          variants={formVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full h-full pt-[20%]"
        >
          <LoginForm 
            title={title} 
            subtitle="Đăng Nhập" 
            onToggleForm={toggleForm} 
          />
        </motion.div>
      ) : (
        <motion.div
          key="register"
          variants={formVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full h-full pt-[20%]"
        >
          <RegisterForm 
            title={title} 
            subtitle="Đăng Ký" 
            onToggleForm={toggleForm} 
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthForm;