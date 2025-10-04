import React, { useRef, useState } from "react";
import { Card, Tag, Divider, Button, InputNumber, Space } from "antd";
import {
  GiftOutlined,
  DollarOutlined,
  NumberOutlined,
  CheckCircleOutlined,
  StopOutlined,
  PercentageOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { selectUser } from "../../../redux/features/userSlice";
import { useSelector } from "react-redux";
import logoColor from "../../../assets/LogoColor.png";
import { QRCodeCanvas } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import toast from "react-hot-toast";

const DetailVoucher = ({ selectedCoupon, allowPrint = true }) => {
  const contentRef = useRef(null);
  const [printQuantity, setPrintQuantity] = useState(1);
  const user = useSelector(selectUser);
  
  // Voucher Card Component
  const VoucherCard = () => (
    <div
      className="voucher-container relative overflow-hidden shadow-2xl mb-4"
      style={{ borderRadius: "20px" }}
    >
      {/* Left Side - Discount Section */}
      <div className="flex">
        <div
          className="voucher-left p-8 relative"
          style={{
            background: "linear-gradient(135deg, #FF914D 0%, #ED2A46 100%)",
            color: "white",
            flex: "4",
          }}
        >
          {/* Decorative elements */}
          <div className="absolute top-4 left-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white/30 rounded-full"></div>
              <div className="w-2 h-2 bg-white/30 rounded-full"></div>
              <div className="w-2 h-2 bg-white/30 rounded-full"></div>
            </div>
          </div>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="text-2xl font-extrabold text-white/90">
                FITBRIDGE - {user?.fullName || "Personal Trainer"}
              </span>
            </div>
            <h2 className="text-sm font-bold text-white m-0 uppercase tracking-wide">
              Gift Voucher
            </h2>
          </div>

          {/* Main Discount */}
          <div className="text-center my-2">
            <div className="text-6xl font-bold text-white mb-2">
              GIẢM {selectedCoupon.discountPercent}%
            </div>
          </div>

          {/* Expiry or validity info */}
          <div className="mt-8">
            <div className="text-white/80 text-xs">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                ✨ Áp dụng cho tất cả gói tập của{" "}
                {user?.fullName || "Personal Trainer"} trên FitBridge
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Details Section */}
        <div
          className="voucher-right p-8 bg-white relative border-l-2 border-dashed border-gray-200"
          style={{ minHeight: "300px", flex: "2" }}
        >
          {/* Voucher Code */}
          <div className="mb-6">
            <div className="border-2 items-center flex flex-col border-gray-300 rounded-lg p-3 bg-gray-50">
              <div className="text-xs text-gray-600 mb-1 uppercase font-semibold">
                Voucher Code
              </div>
              <div className="text-xl font-bold text-gray-800 tracking-wider">
                {selectedCoupon.couponCode}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 border-b flex justify-end border-gray-200 pb-4 mb-4">
            <div>
              <div className="text-xs text-gray-600 mb-1 uppercase font-semibold">
                Giá trị tối đa
              </div>
              <div className="text-sm font-medium justify-end flex text-gray-800">
                {selectedCoupon.maxDiscount?.toLocaleString("vi", {
                  style: "currency",
                  currency: "VND",
                })}
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="mb-6">
            <div className="w-full h-24 flex items-center justify-center rounded-lg">
              <QRCodeCanvas
                bgColor="#ffffff"
                fgColor="#000000"
                value={selectedCoupon.couponCode}
                size={80}
              />
            </div>
          </div>

          {/* Website */}
          <div className="absolute flex flex-row items-center bottom-1 right-1">
            <div className="text-xs font-bold text-gray-600">
              fitbridge.shop
            </div>
            <img src={logoColor} alt="FitBridge Logo" className="w-12 h-12" />
          </div>
        </div>
      </div>
    </div>
  );
  
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `${printQuantity} Voucher_${user?.fullName || 'Freelance Personal Trainer'}_${selectedCoupon?.couponCode || 'Detail'}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 3mm;
        
        
      }
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        body { 
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        .print-container {
          display: flex;
          flex-direction: column;
          gap: 1mm;
        }
        .voucher-container { 
          box-shadow: none !important;
          max-width: 190mm !important;
          width: 190mm !important;
          height: auto !important;
          page-break-inside: avoid;
        }
      }
    `,
    onAfterPrint: () => toast.success("In voucher thành công!")
  });

  if (!selectedCoupon) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không có dữ liệu coupon
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Print Controls - Only show if allowPrint is true */}
      {allowPrint && (
        <div className="text-center mb-6">
          <Space size="large" direction="vertical">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lượng voucher muốn in:
              </label>
              <InputNumber
                min={1}
                max={30}
                value={printQuantity}
                onChange={(value) => setPrintQuantity(value || 1)}
                className="w-20"
              />
            </div>
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={reactToPrintFn}
              className="bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600"
              size="large"
            >
              In {printQuantity} Voucher{printQuantity > 1 ? 's' : ''}
            </Button>
          </Space>
        </div>
      )}
      
      {/* Preview Voucher */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          {allowPrint ? 'Xem trước voucher:' : 'Chi tiết voucher:'}
        </h3>
        <VoucherCard />
      </div>
      
      {/* Hidden Print Content - Only include if allowPrint is true */}
      {allowPrint && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div
            ref={contentRef}
            className="print-container"
          >
            {Array.from({ length: printQuantity }, (_, index) => (
              <VoucherCard key={index} />
            ))}
          </div>
        </div>
      )}




      <style jsx>{`
        .voucher-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          position: relative;
        }

        .voucher-left {
          position: relative;
          border-top-left-radius: 20px;
          border-bottom-left-radius: 20px;
        }

        .voucher-right {
          position: relative;
          border-top-right-radius: 20px;
          border-bottom-right-radius: 20px;
          border-top: 3px solid  #e5e7eb;
          border-right: 3px solid  #e5e7eb;
          border-bottom: 3px solid  #e5e7eb;
        }

        .voucher-left::after {
          content: "";
          position: absolute;
          top: 0;
          right: -1px;
          bottom: 0;
          width: 2px;
          background: repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent 8px,
            #e5e7eb 8px,
            #e5e7eb 16px
          );
        }

        @media (max-width: 640px) {
          .voucher-container .flex {
            flex-direction: column;
          }

          .voucher-left {
            border-radius: 20px 20px 0 0;
          }

          .voucher-right {
            border-radius: 0 0 20px 20px;
            border-top: none;
            border-left: 3px solid  #e5e7eb;
          border-right: 3px solid  #e5e7eb;
          border-bottom: 3px solid  #e5e7eb;
          }

          .voucher-left::after {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default DetailVoucher;
