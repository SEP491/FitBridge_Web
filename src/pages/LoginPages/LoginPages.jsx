import React, { useState, useEffect } from "react";
import bg1 from "../../assets/BackGroundLogin1.jpg";
import { motion } from "framer-motion";
import LoadingLogo from "../../components/LoadingLogo/LoadingLogo";
import AuthForm from "../../components/AuthForm/AuthForm";

const LoginPages = () => {
  const [windowSize, setWindowSize] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className="w-full h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${bg1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <motion.div className="h-screen w-screen flex-col absolute flex items-center justify-center">
        {/* Content Layer - Glass Login Form */}
        <motion.div
          className="z-10 relative overflow-hidden shadow-2xl mx-4 sm:mx-0"
          style={{
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          }}
          initial={{
            // backgroundColor: "rgba(255, 255, 255, 0.1)",
            backgroundColor: "#0C2A28",
            opacity: 1,
          }}
          animate={{
            height: ["0%", "5%", windowSize.width < 640 ? "65%" : windowSize.width < 1024 ? "80%" : "80%"],
            width: ["0%", 
              windowSize.width < 640 ? "85%" : windowSize.width < 768 ? "85%" : windowSize.width < 1024 ? "65%" : "40%", 
              windowSize.width < 640 ? "85%" : windowSize.width < 768 ? "85%" : windowSize.width < 1024 ? "65%" : "40%"
            ],
            y: [-200, -200, 0],
            paddingTop: ["0px", "0px", windowSize.width < 640 ? "18vh" : "22vh"],
            backgroundColor: ["rgba(255, 255, 255, 0.1)"],
            borderRadius: ["0%", "0%", "3%"],
          }}
          transition={{
            duration: 1.4,
            delay: 5.5,
            times: [0, 0.5, 1],
          }}
        >
          <AuthForm title="GymRadar" />
        </motion.div>

         {/* Logo Layer - Higher z-index */}
        <motion.div
          className="text-2xl sm:text-3xl md:text-4xl font-bold h-screen w-screen flex fixed items-center justify-center z-[50]"
          initial={{
            opacity: 1,
            height: "100%",
            width: "100%",
            backgroundColor: "#08100C",
          }}
          animate={{
            opacity: [1, 0],
            height: ["100%"],
            width: ["100%"],
          }}
          transition={{
            duration: 4,
            delay: 2.7,
            ease: "easeInOut",
          }}
        >
        </motion.div>

        {/* Logo Layer - Higher z-index */}
        <motion.div
          className="text-2xl sm:text-3xl md:text-4xl font-bold h-screen w-screen flex fixed items-center justify-center z-[100]"
          initial={{
            opacity: 1,
            height: "100%",
            width: "100%",
          }}
          animate={{
            opacity: [1, 1, 1, 1],
            height: ["100%", "100%", "2%", "0%"],
            width: ["100%", "100%", "80%", "80%"],
            y: [0, 0, 0, -200],
          }}
          transition={{
            duration: 4,
            delay: 1.5,
            times: [0, 0.5, 0.8, 1],
            ease: "easeInOut",
          }}
        >
          <motion.div
            initial={{ scale: 3 }}
            animate={{ scale: 1.5 }}
            transition={{
              duration: 1,
              delay: 3.5,
            }}
          >
            <LoadingLogo />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPages;
