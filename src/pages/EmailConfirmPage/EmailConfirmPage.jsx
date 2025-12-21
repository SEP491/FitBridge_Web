import React, { useState, useEffect } from "react";
import bg1 from "../../assets/BackGroundLogin1.jpg";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import LoadingLogo from "../../components/LoadingLogo/LoadingLogo";
import EmailConfirmForm from "../../components/EmailConfirmForm/EmailConfirmForm";

const EmailConfirmPage = () => {
  const [windowSize, setWindowSize] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  const logoScale = windowSize.width < 480 ? 1 : windowSize.width < 640 ? 2.8 : 2.5;
  const logoScaleAnimation = windowSize.width < 480 ? 0.8 : windowSize.width < 640 ? 0.9 : 1;
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
        {/* Content Layer - Glass Email Confirm Form */}
        <motion.div
          className="z-20 relative overflow-hidden shadow-2xl mx-4 sm:mx-0"
          style={{
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          }}
          initial={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            opacity: 1,
          }}
          animate={{
            height: ["0%", "5%", windowSize.width < 640 ? "80%" : windowSize.width < 1024 ? "85%" : "85%"],
            width: ["0%", 
              windowSize.width < 640 ? "95%" : windowSize.width < 768 ? "90%" : windowSize.width < 1024 ? "75%" : "35%", 
              windowSize.width < 640 ? "95%" : windowSize.width < 768 ? "90%" : windowSize.width < 1024 ? "75%" : "35%"
            ],
            y: [-200, -200, 0],
            paddingTop: ["0px", "0px", windowSize.width < 640 ? "5vh" : "8vh"],
            backgroundColor: ["rgba(255, 255, 255, 0.1)"],
            borderRadius: ["0%", "0%", "3%"],
          }}
          transition={{
            duration: 1.4,
            delay: 5.5,
            times: [0, 0.5, 1],
          }}
        >
          <EmailConfirmForm title="FitBridge" />
        </motion.div>

         {/* Background Layer */}
        <motion.div
          className="text-2xl sm:text-3xl md:text-4xl font-bold h-screen w-screen flex fixed items-center justify-center z-10"
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
            y: [0, 0, 0, -230],
          }}
          transition={{
            duration: 4,
            delay: 1.5,
            times: [0, 0.5, 0.8, 1],
            ease: "easeInOut",
          }}
        >
          <motion.div
            initial={{ scale: logoScale }}
            animate={{ scale: logoScaleAnimation }}
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

export default EmailConfirmPage;