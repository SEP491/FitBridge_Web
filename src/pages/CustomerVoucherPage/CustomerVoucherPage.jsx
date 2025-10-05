import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Button, Spin, Alert, Typography } from "antd";
import { ArrowLeftOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import VoucherCard from "../../components/VoucherCard/VoucherCard";
import logoColor from "../../assets/LogoColor.png";
import { couponService } from "../../services/couponService";

const { Title, Text } = Typography;

const CustomerVoucherPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock function to fetch voucher data
  // In real implementation, you would call your API here
  const fetchVoucherData = async (voucherId) => {
    try {
      setLoading(true);
      
      const response = await couponService.getCouponById(voucherId);
      if (response && response.data) {
        setVoucher(response.data);
        setError(null);
      } else {
        throw new Error("Voucher không tồn tại hoặc đã hết hạn");
      }
      
    } catch (err) {
      setError(err.message);
      setVoucher(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get voucherId from URL params
    const getVoucherIdFromParams = () => {
      const params = new URLSearchParams(location.search);
      return params.get('voucherId');
    };

    const voucherId = getVoucherIdFromParams();
    if (voucherId) {
      fetchVoucherData(voucherId);
    } else {
      setError("Không tìm thấy mã voucher trong đường dẫn");
      setLoading(false);
    }
  }, [location.search]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleUseVoucher = () => {
    // In real implementation, this would redirect to booking/purchase page
    // with the voucher code pre-filled
    alert(`Sử dụng voucher: ${voucher.couponCode}\n\nTrong ứng dụng thực tế, bạn sẽ được chuyển đến trang đặt lịch/mua gói tập.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Đang tải thông tin voucher...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="text-center">
            <ExclamationCircleOutlined className="text-5xl text-red-500 mb-4" />
            <Title level={3} className="text-red-600">Lỗi</Title>
            <Alert
              message={error}
              type="error"
              className="mb-4"
            />
            <Button type="primary" onClick={handleGoBack}>
              Quay lại
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleGoBack}
                type="text"
              >
                Quay lại
              </Button>
              <div className="flex items-center space-x-2">
                <img src={logoColor} alt="FitBridge" className="w-8 h-8" />
                <Title level={4} className="mb-0">FitBridge Voucher</Title>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* Voucher Status */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
            <CheckCircleOutlined />
            <Text strong>Voucher hợp lệ</Text>
          </div>
        </div>

        {/* Voucher Card Display */}
        <div className="mb-8">
          <VoucherCard selectedCoupon={voucher} />
        </div>

        {/* Voucher Details */}
        <Card className="mb-6">
          <Title level={4}>Thông tin voucher</Title>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Text className="text-gray-600">Mã voucher:</Text>
              <Text strong className="font-mono">{voucher.couponCode}</Text>
            </div>
            <div className="flex justify-between">
              <Text className="text-gray-600">Giảm giá:</Text>
              <Text strong className="text-green-600">{voucher.discountPercent}%</Text>
            </div>
            <div className="flex justify-between">
              <Text className="text-gray-600">Giá trị tối đa:</Text>
              <Text strong>
                {voucher.maxDiscount?.toLocaleString("vi", {
                  style: "currency",
                  currency: "VND",
                })}
              </Text>
            </div>
            <div className="flex justify-between">
              <Text className="text-gray-600">Trạng thái:</Text>
              <Text className={voucher.isActive ? "text-green-600" : "text-red-600"} strong>
                {voucher.isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
              </Text>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="mb-6">
          <Title level={4}>Cách sử dụng</Title>
          <div className="space-y-2 text-gray-600">
            <p>1. Chọn gói tập phù hợp với bạn trên ứng dụng FitBridge</p>
            <p>2. Tại trang thanh toán, nhập mã voucher: <Text strong className="font-mono bg-gray-100 px-2 py-1 rounded">{voucher.couponCode}</Text></p>
            <p>3. Hệ thống sẽ tự động áp dụng giảm giá cho đơn hàng của bạn</p>
            <p>4. Hoàn tất thanh toán và bắt đầu tập luyện!</p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-x-4">
          <Button
            type="primary"
            size="large"
            onClick={handleUseVoucher}
            className="min-w-[200px]"
            style={{ background: "linear-gradient(135deg, #FF914D 0%, #ED2A46 100%)", border: "none" }}
          >
            Sử dụng voucher ngay
          </Button>
          <Button size="large" onClick={handleGoBack}>
            Để sau
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2024 FitBridge. Voucher chỉ có giá trị khi sử dụng trên ứng dụng FitBridge.</p>
          <p>Mọi thắc mắc vui lòng liên hệ hotline: 1900-1234</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerVoucherPage;