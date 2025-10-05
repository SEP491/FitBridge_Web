import React, { useRef, useState } from "react";
import { Card, Tag, Divider, Button, InputNumber, Space, Statistic, Modal, Input, message } from "antd";
import {
  GiftOutlined,
  DollarOutlined,
  NumberOutlined,
  CheckCircleOutlined,
  StopOutlined,
  PercentageOutlined,
  PrinterOutlined,
  ShareAltOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { selectUser } from "../../../redux/features/userSlice";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import toast from "react-hot-toast";
import VoucherCard from "../../../components/VoucherCard/VoucherCard";

const DetailVoucher = ({ selectedCoupon, allowPrint = true }) => {
  const contentRef = useRef(null);
  const [printQuantity, setPrintQuantity] = useState(1);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const user = useSelector(selectUser);
  
  // Generate share link
  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/voucher?voucherId=${selectedCoupon.id}`;
  };

  // Handle copy link
  const handleCopyLink = () => {
    const shareLink = generateShareLink();
    navigator.clipboard.writeText(shareLink).then(() => {
      message.success('Đã sao chép link chia sẻ!');
    }).catch(() => {
      message.error('Không thể sao chép link!');
    });
  };

  // Handle share button click
  const handleShareClick = () => {
    setShareModalVisible(true);
  };
  
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
    <div className="">
      {/* Print Controls - Only show if allowPrint is true */}
      {allowPrint && (
        <div className="text-center flex-col items-center  flex mb-6">
          <div className="mb-4">
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
          <div className="w-full justify-end flex flex-row items-center">
            <Button
              type="primary"
              icon={<PrinterOutlined />}
              onClick={reactToPrintFn}
              className="bg-blue-500 hover:bg-blue-600 border-blue-500 hover:border-blue-600"
              size="large"
            >
              In {printQuantity} Voucher{printQuantity > 1 ? 's' : ''}
            </Button>
            <Button
              type="default"
              icon={<ShareAltOutlined />}
              onClick={handleShareClick}
              className="ml-4"
              style={{ background: "linear-gradient(135deg, #FF914D 0%, #ED2A46 100%)", color: 'white' }}
              size="large"
            >
              Chia sẻ nhanh
            </Button>
          </div>
        {/* Statistic Cards */}
        <div className="mt-4 flex flex-col md:flex-row gap-4 justify-center">
          <Card>
            <Statistic
              title="Số lượng voucher đã phát hành"
              value={100}
              prefix={<GiftOutlined />}
            />
          </Card>
          <Card>
            <Statistic
              title="Trang thái voucher"
              value={selectedCoupon.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
              valueStyle={{ color: selectedCoupon.isActive ? '#3f8600' : '#cf1322' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </div>
        </div>
      )}
      
      {/* Preview Voucher */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          {allowPrint ? 'Xem trước voucher:' : 'Chi tiết voucher:'}
        </h3>
        <VoucherCard selectedCoupon={selectedCoupon} />
      </div>
      
      {/* Hidden Print Content - Only include if allowPrint is true */}
      {allowPrint && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div
            ref={contentRef}
            className="print-container"
          >
            {Array.from({ length: printQuantity }, (_, index) => (
              <VoucherCard key={index} selectedCoupon={selectedCoupon} />
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      <Modal
        title="Chia sẻ voucher"
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setShareModalVisible(false)}>
            Đóng
          </Button>,
          <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={handleCopyLink}>
            Sao chép link
          </Button>
        ]}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Chia sẻ voucher này với khách hàng bằng cách gửi link bên dưới:
          </p>
          <Input.TextArea
            value={generateShareLink()}
            readOnly
            rows={3}
            className="font-mono text-sm"
          />
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-600 mb-0">
              💡 <strong>Lưu ý:</strong> Khách hàng có thể xem voucher và sử dụng mã này khi mua gói tập.
            </p>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default DetailVoucher;
