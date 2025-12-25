import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Button,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Space,
  Tag,
  InputNumber,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  ConfigProvider,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  FileTextOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  FileProtectOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import contractService from "../../../services/contractService";
import ContractTemplate from "../../../components/ContractTemplate/ContractTemplate";
import SignaturePad from "../../../components/SignaturePad/SignaturePad";
import FitBridgeModal from "../../../components/FitBridgeModal";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

const ManageContractPage = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isSignatureModalVisible, setIsSignatureModalVisible] = useState(false);
  const [previewContract, setPreviewContract] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [adminSignature, setAdminSignature] = useState(null);
  const [signing, setSigning] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const contractRef = useRef();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await contractService.getAllContracts({
        page,
        size: pageSize,
      });
      const { items, total, page: currentPage } = response.data || {};
      setContracts(items || []);
      setPagination({
        current: currentPage || page,
        pageSize,
        total: total || 0,
      });
    } catch (error) {
      message.error("Không thể tải danh sách hợp đồng");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (paginationConfig) => {
    fetchContracts(paginationConfig.current, paginationConfig.pageSize);
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await contractService.getCustomersToCreateContract({
        page: 1,
        size: 200,
        doApplyPaging: false,
      });
      setUsers(response.data?.items || []);
    } catch (error) {
      message.error("Không thể tải danh sách người dùng");
      console.error(error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateContract = () => {
    form.resetFields();
    setSelectedUser(null);
    setIsModalVisible(true);
    fetchUsers();
  };

  const handleUserSelect = (userId) => {
    const user = users.find((u) => u.id === userId);
    setSelectedUser(user);
    if (user) {
      form.setFieldsValue({
        customerId: user.id,
        gymOwnerName: user.fullName,
      });
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        customerId: values.customerId,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        extraRules: values.extraRules || [],
      };

      await contractService.createContract(payload);
      message.success("Tạo hợp đồng thành công!");
      fetchContracts();

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || "Không thể tạo hợp đồng");
      console.error(error);
    }
  };

  const handleViewPDF = async (contract) => {
    if (contract.contractUrl || contract.pdfFileId) {
      try {
        const url = contract.contractUrl || contract.pdfFileId;
        window.open(url, "_blank");
      } catch (error) {
        message.error("Không thể xem hợp đồng");
        console.error("View PDF error:", error);
      }
    } else {
      // Nếu chưa có PDF, hiển thị preview modal
      handlePreviewContract(contract);
    }
  };

  const handlePreviewContract = (contract) => {
    setPreviewContract(contract);
    setIsPreviewVisible(true);
  };

  const handleOpenSignatureModal = (contract) => {
    setSelectedContract(contract);
    setAdminSignature(contract.companySignatureUrl || null);
    setIsSignatureModalVisible(true);
  };

  const handleAdminSignatureSave = (signatureData) => {
    setAdminSignature(signatureData);
    message.success("Đã lưu chữ ký");
  };

  // Helper function to convert base64 to Blob
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

  const handleSignAsAdmin = async () => {
    if (!adminSignature) {
      message.warning("Vui lòng ký vào hợp đồng trước!");
      return;
    }

    setSigning(true);
    try {
      // Convert base64 signature to Blob
      const signatureBlob = base64ToBlob(adminSignature);

      // Prepare FormData - PUT /api/v1/contracts
      const formData = new FormData();
      formData.append("contractId", selectedContract.id);
      formData.append(
        "companySignatureUrl",
        signatureBlob,
        `admin_signature_${selectedContract.id}.png`
      );

      // Call API to update contract
      await contractService.updateContract(formData);

      message.success("Ký hợp đồng thành công!");
      setIsSignatureModalVisible(false);
      setAdminSignature(null);
      setSelectedContract(null);
      fetchContracts();
    } catch (error) {
      message.error("Không thể ký hợp đồng. Vui lòng thử lại!");
      console.error(error);
    } finally {
      setSigning(false);
    }
  };

  const handleConfirmContract = async (contractId) => {
    try {
      await contractService.confirmContract(contractId);
      message.success("Xác nhận hợp đồng thành công!");
      fetchContracts();
    } catch (error) {
      message.error("Không thể xác nhận hợp đồng. Vui lòng thử lại!");
      console.error(error);
    }
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

      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`hop_dong_${previewContract.contractNumber || "preview"}.pdf`);
      message.success("Tải xuống thành công!");
    } catch (error) {
      message.error("Không thể tải xuống hợp đồng");
      console.error("Download preview error:", error);
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
    created: contracts.filter((c) => c.contractStatus === "Created").length,
    pending: contracts.filter((c) => c.contractStatus === "CompanySigned")
      .length,
    signed: contracts.filter(
      (c) =>
        c.contractStatus === "BothSigned" || c.contractStatus === "Finished"
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
      width: 250,
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
          {record.contractStatus === "Created" && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleOpenSignatureModal(record)}
            >
              Ký hợp đồng
            </Button>
          )}
          {record.contractStatus === "BothSigned" && (
            <Popconfirm
              title="Xác nhận hợp đồng"
              description="Bạn có chắc chắn muốn xác nhận hợp đồng này?"
              onConfirm={() => handleConfirmContract(record.id)}
              okText="Có"
              cancelText="Không"
            >
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                style={{ backgroundColor: "#52c41a" }}
              >
                Xác nhận
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#ED2A46] flex items-center gap-2 mb-2">
          <FileTextOutlined />
          Quản Lý Hợp Đồng
        </h1>
        <p className="text-gray-600">
          Quản lý và theo dõi các hợp đồng với Gym Owner và Freelance PT
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title="Tổng hợp đồng"
              value={statistics.total}
              prefix={<FileTextOutlined style={{ color: "#FF914D" }} />}
              valueStyle={{
                color: "#FF914D",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title="Mới tạo"
              value={statistics.created}
              prefix={<FileProtectOutlined style={{ color: "#8c8c8c" }} />}
              valueStyle={{
                color: "#8c8c8c",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title="Chờ khách ký"
              value={statistics.pending}
              prefix={<ClockCircleOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{
                color: "#1890ff",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title="Đã hoàn thành"
              value={statistics.signed}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{
                color: "#52c41a",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Card */}
      <Card className="border-0 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 m-0 flex items-center gap-2">
            <FileTextOutlined className="text-[#ED2A46]" />
            Danh Sách Hợp Đồng
          </h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateContract}
            className="bg-gradient-to-r from-orange-400 to-orange-600 border-0 rounded-lg px-4 shadow-lg hover:shadow-xl"
          >
            Tạo Hợp Đồng Mới
          </Button>
        </div>

        <ConfigProvider
          theme={{ components: { Table: { headerBg: "#FFE5E9" } } }}
        >
          <Table
            columns={columns}
            dataSource={contracts}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1200 }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} hợp đồng`,
              position: ["bottomCenter"],
            }}
            onChange={handleTableChange}
          />
        </ConfigProvider>
      </Card>

      <FitBridgeModal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        title="Tạo Hợp Đồng Mới"
        titleIcon={<PlusOutlined />}
        width={750}
        logoSize="medium"
        footer={
          <div className="flex justify-end gap-3 px-6 py-4  border-t">
            <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              className="bg-gradient-to-r from-orange-400 to-orange-600 border-0 px-6 shadow-lg"
            >
              Tạo Hợp Đồng
            </Button>
          </div>
        }
        bodyStyle={{ padding: 0, maxHeight: "70vh", overflowY: "auto" }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="p-6"
        >
          <Form.Item
            name="customerId"
            label="Chọn Gym Owner / Freelance PT"
            rules={[{ required: true, message: "Vui lòng chọn người dùng" }]}
          >
            <Select
              showSearch
              placeholder="Tìm kiếm và chọn người dùng"
              loading={loadingUsers}
              onChange={handleUserSelect}
              filterOption={(input, option) => {
                const label = option?.label || "";
                return label.toLowerCase().includes(input.toLowerCase());
              }}
              options={users.map((user) => ({
                value: user.id,
                label: `${user.fullName} - ${user.role}`,
              }))}
            />
          </Form.Item>

          {selectedUser && (
            <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm mb-1">
                <strong>Họ tên:</strong> {selectedUser.fullName}
              </p>
              <p className="text-sm mb-1">
                <strong>Vai trò:</strong>{" "}
                <Tag
                  color={selectedUser.role === "GymOwner" ? "blue" : "green"}
                >
                  {selectedUser.role === "GymOwner"
                    ? "Chủ phòng gym"
                    : "PT Freelance"}
                </Tag>
              </p>
            </div>
          )}

          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            rules={[{ required: true, message: "Vui lòng chọn ngày kết thúc" }]}
          >
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            name="extraRules"
            label="Điều khoản bổ sung (tùy chọn)"
            tooltip="Thêm các điều khoản đặc biệt cho hợp đồng này"
          >
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Nhập và nhấn Enter để thêm điều khoản"
              tokenSeparators={[","]}
            />
          </Form.Item>
        </Form>
      </FitBridgeModal>

      {/* Preview Modal */}
      <FitBridgeModal
        open={isPreviewVisible}
        onCancel={() => setIsPreviewVisible(false)}
        title="Xem Trước Hợp Đồng"
        titleIcon={<EyeOutlined />}
        width={950}
        logoSize="medium"
        footer={
          <div className="flex justify-end gap-3 px-6 py-4  border-t">
            <Button onClick={() => setIsPreviewVisible(false)}>Đóng</Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownloadPreviewPDF}
              className="bg-gradient-to-r from-orange-400 to-orange-600 border-0 px-6 shadow-lg"
            >
              Tải xuống PDF
            </Button>
          </div>
        }
        bodyStyle={{ padding: 0, maxHeight: "75vh", overflowY: "auto" }}
      >
        <div className="max-h-[70vh] overflow-y-auto">
          {previewContract && (
            <ContractTemplate
              ref={contractRef}
              contractData={previewContract}
              signature={null}
            />
          )}
        </div>
      </FitBridgeModal>

      {/* Admin Signature Modal */}
      <FitBridgeModal
        open={isSignatureModalVisible}
        onCancel={() => {
          setIsSignatureModalVisible(false);
          setAdminSignature(null);
          setSelectedContract(null);
        }}
        title="Ký Hợp Đồng (Admin)"
        titleIcon={<FileTextOutlined />}
        width={950}
        logoSize="medium"
        footer={
          <div className="flex justify-end gap-3 px-6 py-4  border-t">
            <Button
              onClick={() => {
                setIsSignatureModalVisible(false);
                setAdminSignature(null);
                setSelectedContract(null);
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              loading={signing}
              onClick={handleSignAsAdmin}
              disabled={!adminSignature}
              className="bg-gradient-to-r from-orange-400 to-orange-600 border-0 px-6 shadow-lg"
            >
              Xác nhận ký
            </Button>
          </div>
        }
        bodyStyle={{
          padding: "0 0 16px",
          maxHeight: "75vh",
          overflowY: "auto",
        }}
      >
        <div className="p-6 space-y-4">
          {selectedContract && (
            <div className=" p-4 rounded-lg border">
              <p>
                <strong>Hợp đồng:</strong>{" "}
                {selectedContract.id?.substring(0, 15)}...
              </p>
              <p>
                <strong>Khách hàng:</strong> {selectedContract.fullName}
              </p>
              <p className="flex items-center gap-2">
                <strong>Trạng thái:</strong>{" "}
                {getStatusTag(selectedContract.contractStatus)}
              </p>
            </div>
          )}

          <SignaturePad
            onSave={handleAdminSignatureSave}
            title="Chữ ký của Admin"
          />

          {adminSignature && (
            <div className="mt-2 text-center">
              <p className="font-semibold mb-2">Xem trước chữ ký:</p>
              <img
                src={adminSignature}
                alt="Admin Signature Preview"
                className="max-w-md border border-gray-300 rounded p-2 inline-block"
              />
            </div>
          )}
        </div>
      </FitBridgeModal>
    </div>
  );
};

export default ManageContractPage;
