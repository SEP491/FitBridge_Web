import React, { useState, useEffect } from "react";
import bg1 from "../../assets/BackGroundLogin1.jpg";
// eslint-disable-next-line no-unused-vars
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
      className="w-full h-screen flex items-center justify-center p-2 sm:p-4 md:p-6"
      style={{
        backgroundImage: `url(${bg1})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <motion.div className="h-screen w-screen   flex-col absolute flex items-center justify-center">
        {/* Content Layer - Glass Login Form */}
        <motion.div
          className="z-20 relative overflow-y-scroll shadow-lg sm:shadow-xl mx-2 sm:mx-4 md:mx-0"
          style={{
            backdropFilter: "blur(15px) sm:blur(20px)",
            WebkitBackdropFilter: "blur(15px) sm:blur(20px)",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 4px 20px 0 rgba(31, 38, 135, 0.3)",
          }}
          initial={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            opacity: 1,
          }}
          animate={{
            height: [
              "0%", 
              "5%", 
              windowSize.width < 480 ? "90%" : windowSize.width < 640 ? "85%" : windowSize.width < 768 ? "80%" : windowSize.width < 1024 ? "75%" : "70%"
            ],
            width: [
              "0%", 
              windowSize.width < 480 ? "98%" : windowSize.width < 640 ? "95%" : windowSize.width < 768 ? "85%" : windowSize.width < 1024 ? "70%" : "40%", 
              windowSize.width < 480 ? "98%" : windowSize.width < 640 ? "95%" : windowSize.width < 768 ? "85%" : windowSize.width < 1024 ? "70%" : "40%"
            ],
            y: [-200, -200, 0],
            paddingTop: [
              "0px", 
              "0px", 
              windowSize.width < 480 ? "2vh" : windowSize.width < 640 ? "3vh" : windowSize.width < 1024 ? "2vh" : "2vh"
            ],
            backgroundColor: ["rgba(255, 255, 255, 0.1)"],
            borderRadius: ["0%", "0%", windowSize.width < 640 ? "2%" : "3%"],
          }}
          transition={{
            duration: 1.4,
            delay: 5.5,
            times: [0, 0.5, 1],
          }}
        >
          <AuthForm title="FitBridge" />
        </motion.div>

         {/* Background Layer */}
        <motion.div
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold h-screen w-screen flex fixed items-center justify-center z-10"
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
          className="text-xl  sm:text-2xl md:text-3xl lg:text-4xl font-bold h-screen w-screen flex fixed items-center justify-center z-[100]"
          initial={{
            opacity: 1,
            height: "100%",
            width: "100%",
          }}
          animate={{
            opacity: [1, 1, 1, 1],
            height: ["100%", "100%", "2%", "0%"],
            width: ["100%", "100%", windowSize.width < 640 ? "90%" : "80%", windowSize.width < 640 ? "90%" : "80%"],
            y: [0, 0, 0, windowSize.width < 640 ? -180 : windowSize.width < 1024 ? -200 : -180],
          }}
          transition={{
            duration: 4,
            delay: 1.5,
            times: [0, 0.5, 0.8, 1],
            ease: "easeInOut",
          }}
        >
          <motion.div
            initial={{ scale: windowSize.width < 480 ? 2.5 : windowSize.width < 640 ? 2.8 : 3 }}
            animate={{ scale: windowSize.width < 480 ? 0.8 : windowSize.width < 640 ? 0.9 : 1 }}
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
