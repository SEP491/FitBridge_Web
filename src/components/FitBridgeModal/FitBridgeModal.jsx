import React from "react";
import { Modal } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import LogoColor from "../../assets/LogoColor.png";

const FitBridgeModal = ({
  open,
  onCancel,
  title,
  children,
  footer = null,
  width = 600,
  centered = true,
  closable = true,
  maskClosable = true,
  className = "",
  bodyStyle = {},
  headerStyle = {},
  titleIcon,
  titleColor = "#ED2A46",
  logoSize = "small", // "small", "medium", "large"
  ...props
}) => {
  // Logo size mapping
  const logoSizes = {
    small: { width: 32, height: 32 },
    medium: { width: 48, height: 48 },
    large: { width: 64, height: 64 },
  };

  const currentLogoSize = logoSizes[logoSize] || logoSizes.small;

  // Custom header with logo
  const customTitle = (
    <div className="flex items-center gap-3">
      {/* FitBridge Logo */}
      <img
        src={LogoColor}
        alt="FitBridge"
        style={{
          width: currentLogoSize.width,
          height: currentLogoSize.height,
          objectFit: "contain",
        }}
        className="flex-shrink-0"
      />
      
      {/* Title with optional icon */}
      <div className="flex-1 min-w-0">
        <div 
          className="flex items-center gap-2 text-xl font-bold truncate"
          style={{ color: titleColor, ...headerStyle }}
        >
          {titleIcon && <span className="flex-shrink-0">{titleIcon}</span>}
          <span className="truncate">{title}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          FitBridge Management System
        </div>
      </div>
    </div>
  );

  // Default body styles with FitBridge branding
  const defaultBodyStyle = {
    padding: "24px",
    borderRadius: "8px",
    ...bodyStyle,
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={customTitle}
      footer={footer}
      width={width}
      centered={centered}
      closable={closable}
      maskClosable={maskClosable}
      className={`fitbridge-modal ${className}`}
      styles={{
        header: {
          padding: "20px 24px 16px 24px",
          borderBottom: "2px solid #f0f0f0",
          marginBottom: 0,
          background: "linear-gradient(135deg, #FFF9FA 0%, #FFFFFF 100%)",
          borderRadius: "8px 8px 0 0",
        },
        body: defaultBodyStyle,
        content: {
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
        },
        mask: {
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
        },
      }}
      closeIcon={
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <CloseOutlined style={{ fontSize: "14px", color: "#666" }} />
        </div>
      }
      {...props}
    >
      {children}
      
      {/* Custom styles for the modal */}
      <style jsx global>{`
        .fitbridge-modal .ant-modal-header {
          background: linear-gradient(135deg, #FFF9FA 0%, #FFFFFF 100%);
        }
        
        .fitbridge-modal .ant-modal-header .ant-modal-title {
          color: ${titleColor};
          margin: 0;
        }
        
        .fitbridge-modal .ant-modal-close {
          top: 16px;
          right: 16px;
        }
        
        .fitbridge-modal .ant-modal-close:hover {
          background-color: rgba(255, 145, 77, 0.1);
        }
        
        /* Custom scrollbar for modal body */
        .fitbridge-modal .ant-modal-body::-webkit-scrollbar {
          width: 6px;
        }
        
        .fitbridge-modal .ant-modal-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        
        .fitbridge-modal .ant-modal-body::-webkit-scrollbar-thumb {
          background: #FF914D;
          border-radius: 3px;
        }
        
        .fitbridge-modal .ant-modal-body::-webkit-scrollbar-thumb:hover {
          background: #ED2A46;
        }
      `}</style>
    </Modal>
  );
};

export default FitBridgeModal;