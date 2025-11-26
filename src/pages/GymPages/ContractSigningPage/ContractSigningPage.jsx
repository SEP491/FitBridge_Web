import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Button,
  Card,
  message,
  Space,
  Modal,
  Tag,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  FileTextOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  FileProtectOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import ContractTemplate from "../../../components/ContractTemplate/ContractTemplate";
import SignaturePad from "../../../components/SignaturePad/SignaturePad";
import contractService from "../../../services/contractService";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/features/userSlice";

const ContractSigningPage = () => {
  const contractRef = useRef(null);

  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isSignatureModalVisible, setIsSignatureModalVisible] = useState(false);
  const [previewContract, setPreviewContract] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [customerSignature, setCustomerSignature] = useState(null);
  const [signing, setSigning] = useState(false);

  const user = useSelector(selectUser);
  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await contractService.getContractForCustomer(user.id);
      setContracts(response.data?.items || []);
    } catch (error) {
      message.error("Không thể tải danh sách hợp đồng");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTableChange = (newPagination) => {
    fetchContracts(newPagination.current, newPagination.pageSize);
  };

  const handleViewPDF = async (contract) => {
    if (contract.contractUrl) {
      try {
        window.open(contract.contractUrl, "_blank");
      } catch (error) {
        message.error("Không thể xem hợp đồng");
        console.error("View PDF error:", error);
      }
    } else {
      handlePreviewContract(contract);
    }
  };

  const handlePreviewContract = (contract) => {
    setPreviewContract(contract);
    setIsPreviewVisible(true);
  };

  const handleOpenSignatureModal = (contract) => {
    setSelectedContract(contract);
    setCustomerSignature(contract.customerSignatureUrl || null);
    setIsSignatureModalVisible(true);
  };

  const handleCustomerSignatureSave = (signatureData) => {
    setCustomerSignature(signatureData);
    message.success("Đã lưu chữ ký");
  };

  const base64ToBlob = (base64String) => {
    const parts = base64String.split(";base64,");
    const contentType = parts[0].split(":")[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  };

  const handleDownloadPreviewPDF = async () => {
    if (!contractRef.current || !previewContract) return;

    try {
      const canvas = await html2canvas(contractRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`hop_dong_${previewContract.id?.substring(0, 8)}.pdf`);
      message.success("Tải xuống thành công!");
    } catch (error) {
      message.error("Không thể tải xuống hợp đồng");
      console.error("Download preview error:", error);
    }
  };

  const handleSignAsCustomer = async () => {
    if (!customerSignature) {
      message.warning("Vui lòng ký vào hợp đồng trước!");
      return;
    }

    setSigning(true);
    try {
      const signatureBlob = base64ToBlob(customerSignature);
      const formData = new FormData();
      formData.append("contractId", selectedContract.id);
      formData.append(
        "customerSignatureUrl",
        signatureBlob,
        `customer_signature_${selectedContract.id}.png`
      );

      await contractService.updateContract(formData);

      message.success("Ký hợp đồng thành công!");
      setIsSignatureModalVisible(false);
      fetchContracts();
    } catch (error) {
      message.error("Không thể ký hợp đồng. Vui lòng thử lại!");
      console.error(error);
    } finally {
      setSigning(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      Created: {
        color: "default",
        text: "Mới tạo",
        icon: <FileTextOutlined />,
      },
      CompanySigned: {
        color: "processing",
        text: "Công ty đã ký",
        icon: <ClockCircleOutlined />,
      },
      CustomerSigned: {
        color: "warning",
        text: "Khách hàng đã ký",
        icon: <FileDoneOutlined />,
      },
      BothSigned: {
        color: "success",
        text: "Đã ký đầy đủ",
        icon: <CheckCircleOutlined />,
      },
      Finished: {
        color: "success",
        text: "Hoàn thành",
        icon: <FileProtectOutlined />,
      },
    };

    const config = statusConfig[status] || { color: "default", text: status };
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getContractTypeTag = (type) => {
    const types = {
      GymOwner: { color: "blue", text: "Chủ phòng gym" },
      FreelancePT: { color: "green", text: "PT Freelance" },
    };
    const config = types[type] || { color: "default", text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Statistics
  const statistics = {
    total: contracts.length,
    pending: contracts.filter((c) => c.contractStatus === "CompanySigned")
      .length,
    signed: contracts.filter(
      (c) =>
        c.contractStatus === "BothSigned" || c.contractStatus === "Finished"
    ).length,
    waitingForCustomer: contracts.filter(
      (c) => c.contractStatus === "CompanySigned"
    ).length,
  };

  const columns = [
    {
      title: "Mã hợp đồng",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id) => (
        <span className="font-mono text-xs">{id.slice(0, 8)}...</span>
      ),
    },
    {
      title: "Thông tin",
      key: "info",
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.fullName}</div>
          <div className="text-xs text-gray-500">{record.phoneNumber}</div>
          <div className="text-xs text-gray-500">{record.permanentAddress}</div>
        </div>
      ),
    },
    {
      title: "Loại hợp đồng",
      dataIndex: "contractType",
      key: "contractType",
      width: 120,
      align: "center",
      render: (type) => getContractTypeTag(type),
    },
    {
      title: "Thời gian",
      key: "duration",
      width: 150,
      render: (_, record) => (
        <div className="text-xs">
          <div>Từ: {dayjs(record.startDate).format("DD/MM/YYYY")}</div>
          <div>Đến: {dayjs(record.endDate).format("DD/MM/YYYY")}</div>
        </div>
      ),
    },
    {
      title: "Hoa hồng",
      dataIndex: "commissionPercentage",
      key: "commissionPercentage",
      width: 100,
      align: "center",
      render: (commission) => (
        <span className="font-semibold">{commission}%</span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "contractStatus",
      key: "contractStatus",
      width: 150,
      align: "center",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewPDF(record)}
          >
            Xem
          </Button>
          {record.contractStatus === "CompanySigned" && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleOpenSignatureModal(record)}
            >
              Ký hợp đồng
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <FileTextOutlined /> Quản lý hợp đồng
        </h1>

        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng hợp đồng"
                value={statistics.total}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Chờ ký"
                value={statistics.waitingForCustomer}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đã ký"
                value={statistics.signed}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={contracts}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} hợp đồng`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Preview Modal */}
      <Modal
        title="Xem trước hợp đồng"
        open={isPreviewVisible}
        onCancel={() => setIsPreviewVisible(false)}
        width={900}
        footer={[
          <Button key="cancel" onClick={() => setIsPreviewVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadPreviewPDF}
          >
            Tải xuống PDF
          </Button>,
        ]}
      >
        {previewContract && (
          <div className="max-h-[70vh] overflow-y-auto">
            <ContractTemplate
              ref={contractRef}
              contractData={previewContract}
            />
          </div>
        )}
      </Modal>

      {/* Signature Modal */}
      <Modal
        title="Ký hợp đồng"
        open={isSignatureModalVisible}
        onCancel={() => {
          setIsSignatureModalVisible(false);
          setCustomerSignature(null);
          setSelectedContract(null);
        }}
        width={900}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setIsSignatureModalVisible(false);
              setCustomerSignature(null);
              setSelectedContract(null);
            }}
          >
            Hủy
          </Button>,
          <Button
            key="sign"
            type="primary"
            loading={signing}
            onClick={handleSignAsCustomer}
            disabled={!customerSignature}
          >
            Xác nhận ký
          </Button>,
        ]}
      >
        <div className="mb-5">
          {selectedContract && (
            <div>
              <p>
                <strong>Hợp đồng:</strong>{" "}
                {selectedContract.id?.substring(0, 15)}...
              </p>
              <p>
                <strong>Khách hàng:</strong> {selectedContract.fullName}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                {getStatusTag(selectedContract.contractStatus)}
              </p>
            </div>
          )}
        </div>

        <div className="mb-5">
          <SignaturePad
            onSave={handleCustomerSignatureSave}
            title="Chữ ký của bạn"
          />
        </div>

        {customerSignature && (
          <div className="mt-5 text-center">
            <p className="font-semibold mb-2">Xem trước chữ ký:</p>
            <img
              src={customerSignature}
              alt="Customer Signature Preview"
              className="max-w-md border border-gray-300 rounded p-2 inline-block"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContractSigningPage;
