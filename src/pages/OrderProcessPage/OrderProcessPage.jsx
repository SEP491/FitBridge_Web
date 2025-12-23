import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const THEME_COLORS = {
  primary: "#ED2A46",
  secondary: "#FF914D",
  white: "#FFFFFF",
  black: "#000000",
  gray: "#F5F5F5",
  lightGray: "#E0E0E0",
  success: "#4CAF50",
};

export default function OrderProcessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderStatus, setOrderStatus] = useState("processing");
  const [orderData, setOrderData] = useState(null);

  // Parse URL parameters from webhook
  useEffect(() => {
    const code = searchParams.get("code");
    const status = searchParams.get("status");
    const cancel = searchParams.get("cancel");
    const orderCode = searchParams.get("orderCode");
    const amount = searchParams.get("amount");
    const id = searchParams.get("id");
    const message = searchParams.get("message");

    // Small delay to show processing state
    const timer = setTimeout(() => {
      // Determine if payment was successful
      // Success: code=00, status=PAID, cancel=false
      const isSuccess = code === "00" && status === "PAID" && cancel !== "true";
      const isCancelled = cancel === "true";

      if (isSuccess) {
        setOrderStatus("success");
        setOrderData({
          orderCode: orderCode || "N/A",
          amount: parseInt(amount) || 0,
          transactionId: id || "N/A",
          message: message || "Thanh toán thành công",
          status: status,
        });
      } else {
        setOrderStatus("failed");
        setOrderData({
          orderCode: orderCode || "N/A",
          amount: parseInt(amount) || 0,
          transactionId: id || "N/A",
          message:
            message ||
            (isCancelled ? "Giao dịch đã bị hủy" : "Thanh toán thất bại"),
          status: status || "FAILED",
          isCancelled: isCancelled,
        });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoToOrders = () => {
    navigate("/orders");
  };

  // Processing State
  if (orderStatus === "processing") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-5">
        <div className="text-center max-w-sm w-full">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-black mb-3">
            Đang xử lý thanh toán...
          </h2>
          <p className="text-gray-600 text-lg">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  // Success State
  if (orderStatus === "success") {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto px-5 pt-16 pb-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-4xl text-white font-bold">✓</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-green-500 text-center mb-3">
            Thanh toán thành công!
          </h1>
          <p className="text-gray-600 text-center mb-8 text-lg">
            Đơn hàng của bạn đã được xử lý thành công
          </p>

          {/* Order Details */}
          {orderData && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 shadow-sm">
              <h3 className="text-xl font-bold text-black mb-4">
                Chi tiết đơn hàng
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-semibold text-black">
                    {orderData.orderCode}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-semibold text-black text-lg">
                    {formatAmount(orderData.amount)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Mã giao dịch:</span>
                  <span className="font-semibold text-black text-sm">
                    {orderData.transactionId}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="font-semibold text-green-500">
                    {orderData.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-6">
            <p className="text-gray-700 text-lg font-medium leading-tight">
              Bạn đã thanh toán thành công và có thể quay lại
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white text-lg transition-all hover:opacity-90"
              style={{ backgroundColor: THEME_COLORS.primary }}
            >
              Về trang chủ
            </button>
            <button
              onClick={handleGoToOrders}
              className="w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all border-2 hover:bg-gray-50"
              style={{
                borderColor: THEME_COLORS.primary,
                color: THEME_COLORS.primary,
              }}
            >
              Xem đơn hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Failed State
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-5 pt-16 pb-8">
        {/* Failed Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: THEME_COLORS.primary }}
          >
            <span className="text-4xl text-white font-bold">✕</span>
          </div>
        </div>

        <h1
          className="text-3xl font-bold text-center mb-3"
          style={{ color: THEME_COLORS.primary }}
        >
          {orderData?.isCancelled
            ? "Giao dịch đã hủy!"
            : "Thanh toán thất bại!"}
        </h1>
        <p className="text-gray-600 text-center mb-8 text-lg">
          {orderData?.isCancelled
            ? "Bạn đã hủy giao dịch thanh toán"
            : "Đã xảy ra lỗi khi xử lý thanh toán của bạn"}
        </p>

        {/* Order Details */}
        {orderData && (
          <div className="bg-gray-50 rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-xl font-bold text-black mb-4">
              Thông tin đơn hàng
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-semibold text-black">
                  {orderData.orderCode}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-semibold text-black text-lg">
                  {formatAmount(orderData.amount)}
                </span>
              </div>

              {orderData.transactionId && orderData.transactionId !== "N/A" && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Mã giao dịch:</span>
                  <span className="font-semibold text-black text-sm">
                    {orderData.transactionId}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Trạng thái:</span>
                <span
                  className="font-semibold"
                  style={{ color: THEME_COLORS.primary }}
                >
                  {orderData.isCancelled ? "Đã hủy" : "Thất bại"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <p className="text-gray-700 text-lg font-medium leading-relaxed">
            Vui lòng thử lại hoặc liên hệ hotline để được hỗ trợ
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoHome}
            className="w-full py-3 px-6 rounded-xl font-semibold text-white text-lg transition-all hover:opacity-90"
            style={{ backgroundColor: THEME_COLORS.primary }}
          >
            Về trang chủ
          </button>
          <button
            onClick={handleGoToOrders}
            className="w-full py-3 px-6 rounded-xl font-semibold text-lg transition-all border-2 hover:bg-gray-50"
            style={{
              borderColor: THEME_COLORS.primary,
              color: THEME_COLORS.primary,
            }}
          >
            Xem đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
}
