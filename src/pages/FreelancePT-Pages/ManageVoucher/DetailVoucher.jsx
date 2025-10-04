import React from "react";
import { Card, Tag, Divider } from "antd";
import {
  GiftOutlined,
  DollarOutlined,
  NumberOutlined,
  CheckCircleOutlined,
  StopOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import { selectUser } from "../../../redux/features/userSlice";
import { useSelector } from "react-redux";
import logoColor from "../../../assets/LogoColor.png";

const DetailVoucher = ({ selectedCoupon }) => {
  const user = useSelector(selectUser);
  console.log("User in DetailVoucher:", user);
  if (!selectedCoupon) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không có dữ liệu coupon
      </div>
    );
  }

  return (
    <div className="py-4">
      {/* Split Voucher Card */}
      <div
        className="voucher-container relative overflow-hidden shadow-2xl"
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
                {selectedCoupon.discountPercent}%
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

            {/* ID */}
            <div className="absolute bottom-2 left-4">
              <div className="text-xs text-gray-400">
                ID: {selectedCoupon.id}
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
            <div className="space-y-4 border-b border-gray-200 pb-4 mb-6">
              <div>
                <div className="text-xs text-gray-600 mb-1 uppercase font-semibold">
                  Giá trị tối đa
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {selectedCoupon.maxDiscount?.toLocaleString("vi", {
                    style: "currency",
                    currency: "VND",
                  })}
                </div>
              </div>
            </div>

            {/* Terms */}
            {/* <div className="border-t border-gray-200 pt-4">
              <div className="text-xs text-gray-500 leading-relaxed">
                • Voucher chỉ được sử dụng một lần duy nhất
                <br />
                • Không thể đổi lấy tiền mặt
                <br />
                • Liên hệ support để được hỗ trợ
              </div>
            </div> */}

            {/* Website */}
            <div className="absolute flex flex-row items-center bottom-1 right-1">
              <div className="text-xs font-bold text-gray-600">
                fitbridge.shop
              </div>
              <img src={logoColor} alt="FitBridge Logo" className="w-12 h-12" />
            </div>
          </div>
        </div>

        {/* Perforated edge circles */}
        <div className="absolute top-[0%] left-[calc(100%-14rem)] transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 bg-gray-300 rounded-full border-4 border-gray-100 shadow-lg"></div>
        </div>
        <div className="absolute top-[100%] left-[calc(100%-14rem)] transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 bg-gray-300 rounded-full border-4 border-gray-100 shadow-lg"></div>
        </div>
      </div>

      <style jsx>{`
        .voucher-container {
          max-width: 600px;
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
            border-left: none;
            border-top: 2px dashed #e5e7eb;
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
