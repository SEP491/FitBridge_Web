import {
  ConfigProvider,
  Input,
  Spin,
  Table,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  Tag,
  Tooltip,
  message,
  Image,
  Select,
  Upload,
} from "antd";
import React, { useEffect, useState, useCallback } from "react";
import paymentService from "../../../services/paymentService";
import uploadService from "../../../services/uploadService";
import {
  LoadingOutlined,
  SearchOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  BankOutlined,
  UserOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  MoneyCollectOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import FitBridgeModal from "../../../components/FitBridgeModal";

const { TextArea } = Input;

export default function ManageWithdrawalPage() {
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Approval modal states
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [approvalImage, setApprovalImage] = useState(null);
  const [approvalImageUrl, setApprovalImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState(null);

  // Rejection modal states
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [requestToReject, setRequestToReject] = useState(null);

  // Statistics
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    rejected: 0,
    totalAmount: 0,
  });

  // Fetch withdrawal requests
  const fetchWithdrawalRequests = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await paymentService.getAllWithdrawalRequests({
        page,
        size: pageSize,
      });

      const { items, total, page: currentPage, totalPages } = response.data;

      setWithdrawalRequests(items || []);
      setPagination({
        current: currentPage,
        pageSize,
        total,
        totalPages,
      });

      calculateStatistics(items || []);
    } catch (error) {
      console.error("Error fetching withdrawal requests:", error);
      message.error("Không thể tải danh sách yêu cầu rút tiền");
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateStatistics = (data) => {
    const stats = {
      total: data.length,
      pending: data.filter((item) => item.status === "Pending").length,
      completed: data.filter((item) => item.status === "Completed").length,
      rejected: data.filter((item) => item.status === "Rejected").length,
      totalAmount: data.reduce((sum, item) => sum + (item.amount || 0), 0),
    };
    setStatistics(stats);
  };

  useEffect(() => {
    fetchWithdrawalRequests();
  }, [fetchWithdrawalRequests]);

  const handleTableChange = (pagination) => {
    fetchWithdrawalRequests(pagination.current, pagination.pageSize);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle approve
  const handleApprove = (record) => {
    setRequestToApprove(record);
    setApprovalModalVisible(true);
  };

  // Handle image upload
  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const response = await uploadService.uploadFile(file);
      // The API returns the URL directly in response.data as a string
      const imageUrl = response.data;
      setApprovalImageUrl(imageUrl);
      setApprovalImage(file);
      message.success("Tải lên hình ảnh thành công!");
    } catch (error) {
      console.error("Error uploading image:", error);
      message.error("Không thể tải lên hình ảnh");
    } finally {
      setUploadingImage(false);
    }
    return false; // Prevent default upload behavior
  };

  // Submit approval
  const submitApproval = async () => {
    if (!approvalImageUrl) {
      message.error("Vui lòng tải lên hình ảnh chứng từ chuyển tiền!");
      return;
    }

    try {
      await paymentService.approveWithdrawalRequest(
        requestToApprove.id,
        approvalImageUrl
      );
      message.success("Đã duyệt yêu cầu rút tiền thành công!");
      setApprovalModalVisible(false);
      setDetailModalVisible(false);
      setApprovalImageUrl("");
      setApprovalImage(null);
      setRequestToApprove(null);
      setSelectedRequest(null);
      fetchWithdrawalRequests(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error approving withdrawal request:", error);
      message.error("Không thể duyệt yêu cầu rút tiền");
    }
  };

  // Handle reject
  const handleReject = (record) => {
    setRequestToReject(record);
    setRejectionModalVisible(true);
  };

  // Submit rejection
  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      message.error("Vui lòng nhập lý do từ chối!");
      return;
    }

    try {
      await paymentService.rejectWithdrawalRequest(
        requestToReject.id,
        rejectionReason
      );
      message.success("Đã từ chối yêu cầu rút tiền!");
      setRejectionModalVisible(false);
      setDetailModalVisible(false);
      setRejectionReason("");
      setRequestToReject(null);
      setSelectedRequest(null);
      fetchWithdrawalRequests(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error rejecting withdrawal request:", error);
      message.error("Không thể từ chối yêu cầu rút tiền");
    }
  };

  // View details
  const handleViewDetails = (record) => {
    setSelectedRequest(record);
    setDetailModalVisible(true);
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      Pending: { color: "gold", text: "Chờ duyệt" },
      Completed: { color: "blue", text: "Đã xác nhận" },
      Rejected: { color: "red", text: "Đã từ chối" },
    };
    const config = statusConfig[status] || {
      color: "default",
      text: status,
    };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: "Người yêu cầu",
      key: "account",
      align: "left",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <UserOutlined className="text-white text-lg" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {record.accountFullName}
            </div>
            <div className="text-xs text-gray-500">ID: {record.accountId}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      align: "center",
      sorter: (a, b) => (a.amount || 0) - (b.amount || 0),
      render: (amount) => (
        <div className="font-semibold text-green-600 text-lg">
          {formatCurrency(amount)}
        </div>
      ),
    },
    {
      title: "Ngân hàng",
      key: "bank",
      align: "left",
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">{record.bankName}</div>
          <div className="text-xs text-gray-600">{record.accountNumber}</div>
          <div className="text-xs text-gray-500">{record.accountName}</div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      filters: [
        { text: "Chờ duyệt", value: "Pending" },
        { text: "Đã xác nhận", value: "Completed" },
        { text: "Đã từ chối", value: "Rejected" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (date) => (
        <div className="text-sm text-gray-600">{formatDateTime(date)}</div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              className="bg-blue-500 hover:bg-blue-600"
              onClick={() => handleViewDetails(record)}
            >
              Chi tiết
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredData = withdrawalRequests.filter((item) => {
    const matchesSearch = searchText
      ? (item.accountFullName?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        ) ||
        (item.accountName?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        ) ||
        (item.bankName?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        ) ||
        (item.accountNumber || "").includes(searchText)
      : true;

    const matchesStatus =
      statusFilter === "All" ? true : item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading && withdrawalRequests.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 48, color: "#FF914D" }} spin />
          }
          tip="Đang tải dữ liệu..."
          size="large"
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#ED2A46] mb-2 flex items-center gap-2">
          <MoneyCollectOutlined className="text-orange-500" />
          Quản Lý Yêu Cầu Rút Tiền
        </h1>
        <p className="text-gray-600">
          Quản lý và xử lý các yêu cầu rút tiền từ người dùng
        </p>
      </div>

      <div className="">
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Tổng yêu cầu"
                value={statistics.total}
                prefix={<MoneyCollectOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Chờ duyệt"
                value={statistics.pending}
                prefix={
                  <ExclamationCircleOutlined style={{ color: "#faad14" }} />
                }
                valueStyle={{
                  color: "#faad14",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Đã xác nhận"
                value={statistics.completed}
                prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{
                  color: "#52c41a",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Tổng số tiền"
                value={statistics.totalAmount}
                prefix={<DollarOutlined style={{ color: "#FF914D" }} />}
                formatter={(value) => formatCurrency(value)}
                valueStyle={{
                  color: "#FF914D",
                  fontSize: "20px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Card */}
        <Card className="border-0 shadow-lg">
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Tìm kiếm theo tên, ngân hàng, số tài khoản..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 350 }}
                allowClear
                className="rounded-lg"
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 180 }}
                options={[
                  { value: "All", label: "Tất cả trạng thái" },
                  { value: "Pending", label: "Chờ duyệt" },
                  { value: "Completed", label: "Đã xác nhận" },
                  { value: "Rejected", label: "Đã từ chối" },
                ]}
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">
              Hiển thị{" "}
              <span className="font-semibold text-orange-600">
                {filteredData.length}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold">{statistics.total}</span> yêu cầu
              {searchText && (
                <span>
                  {" "}
                  | Tìm kiếm: "
                  <span className="font-semibold text-blue-600">
                    {searchText}
                  </span>
                  "
                </span>
              )}
              {statusFilter !== "All" && (
                <span>
                  {" "}
                  | Trạng thái:{" "}
                  <span className="font-semibold text-blue-600">
                    {statusFilter}
                  </span>
                </span>
              )}
            </span>
          </div>

          {/* Table */}
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  headerBg: "linear-gradient(90deg, #FFE5E9 0%, #FFF0F2 100%)",
                  headerColor: "#333",
                  rowHoverBg: "#FFF9FA",
                },
              },
            }}
          >
            <Table
              dataSource={filteredData}
              columns={columns}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} mục`,
                position: ["bottomCenter"],
                className: "custom-pagination",
              }}
              onChange={handleTableChange}
              className="rounded-lg overflow-hidden"
              scroll={{ x: 1200 }}
              rowKey="id"
            />
          </ConfigProvider>
        </Card>

        {/* Detail Modal */}
        <FitBridgeModal
          open={detailModalVisible}
          onCancel={() => {
            setDetailModalVisible(false);
            setSelectedRequest(null);
          }}
          title="Chi Tiết Yêu Cầu Rút Tiền"
          titleIcon={<EyeOutlined />}
          width={780}
          logoSize="medium"
          footer={
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
              <Button
                onClick={() => {
                  setDetailModalVisible(false);
                  setSelectedRequest(null);
                }}
              >
                Đóng
              </Button>
              {selectedRequest?.status === "Pending" && (
                <>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleReject(selectedRequest)}
                  >
                    Từ chối
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    className="bg-gradient-to-r from-orange-400 to-orange-600 border-0 px-6 shadow-lg"
                    onClick={() => handleApprove(selectedRequest)}
                  >
                    Xác nhận
                  </Button>
                </>
              )}
            </div>
          }
          bodyStyle={{ padding: 0, maxHeight: "70vh", overflowY: "auto" }}
        >
          {selectedRequest && (
            <div className="space-y-4">
              {/* Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trạng thái:</span>
                  <div>{getStatusTag(selectedRequest.status)}</div>
                </div>
              </div>

              {/* User Information */}
              <Card title="Thông tin người yêu cầu" size="small">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên đầy đủ:</span>
                    <span className="font-semibold">
                      {selectedRequest.accountFullName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID tài khoản:</span>
                    <span className="font-mono text-sm">
                      {selectedRequest.accountId}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Amount */}
              <Card title="Thông tin số tiền" size="small">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Số tiền yêu cầu:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedRequest.amount)}
                  </span>
                </div>
              </Card>

              {/* Bank Information */}
              <Card title="Thông tin ngân hàng" size="small">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngân hàng:</span>
                    <span className="font-semibold">
                      {selectedRequest.bankName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tên tài khoản:</span>
                    <span className="font-semibold">
                      {selectedRequest.accountName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tài khoản:</span>
                    <span className="font-mono font-semibold">
                      {selectedRequest.accountNumber}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Image */}
              {selectedRequest.imageUrl && (
                <Card title="Hình ảnh chứng từ" size="small">
                  <Image
                    src={selectedRequest.imageUrl}
                    alt="Withdrawal proof"
                    className="w-full rounded-lg"
                  />
                </Card>
              )}

              {/* Reason */}
              {selectedRequest.reason && (
                <Card title="Lý do / Ghi chú" size="small">
                  <p className="text-gray-700">{selectedRequest.reason}</p>
                </Card>
              )}

              {/* Created Date */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    <CalendarOutlined className="mr-2" />
                    Ngày tạo:
                  </span>
                  <span className="font-semibold">
                    {formatDateTime(selectedRequest.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </FitBridgeModal>

        {/* Approval Modal */}
        <FitBridgeModal
          open={approvalModalVisible}
          onCancel={() => {
            setApprovalModalVisible(false);
            setApprovalImageUrl("");
            setApprovalImage(null);
            setRequestToApprove(null);
          }}
          title="Duyệt Yêu Cầu Rút Tiền"
          titleIcon={<CheckCircleOutlined />}
          width={700}
          logoSize="medium"
          footer={
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
              <Button
                onClick={() => {
                  setApprovalModalVisible(false);
                  setApprovalImageUrl("");
                  setApprovalImage(null);
                  setRequestToApprove(null);
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                onClick={submitApproval}
                disabled={!approvalImageUrl}
                className="bg-gradient-to-r from-orange-400 to-orange-600 border-0 px-6 shadow-lg"
              >
                Xác nhận duyệt
              </Button>
            </div>
          }
          bodyStyle={{ padding: 0, maxHeight: "70vh", overflowY: "auto" }}
        >
          {requestToApprove && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Thông tin yêu cầu
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Người yêu cầu:</span>
                    <span className="font-semibold">
                      {requestToApprove.accountFullName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(requestToApprove.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngân hàng:</span>
                    <span className="font-semibold">
                      {requestToApprove.bankName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tài khoản:</span>
                    <span className="font-mono font-semibold">
                      {requestToApprove.accountNumber}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <p className="text-orange-800 font-medium">
                  ⚠️ Vui lòng tải lên hình ảnh chứng từ chuyển tiền
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Hình ảnh chứng từ chuyển tiền *
                </label>
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  beforeUpload={handleImageUpload}
                  customRequest={({ onSuccess }) => {
                    setTimeout(() => {
                      onSuccess("ok");
                    }, 0);
                  }}
                  onRemove={() => {
                    setApprovalImageUrl("");
                    setApprovalImage(null);
                  }}
                  fileList={
                    approvalImage
                      ? [
                          {
                            uid: "-1",
                            name: approvalImage.name,
                            status: "done",
                            url: approvalImageUrl,
                          },
                        ]
                      : []
                  }
                  accept="image/*"
                >
                  {!approvalImage && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>
                        {uploadingImage ? "Đang tải..." : "Tải lên"}
                      </div>
                    </div>
                  )}
                </Upload>
                <p className="text-gray-500 text-sm mt-2">
                  Tải lên hình ảnh chứng từ chuyển tiền (PNG, JPG, JPEG)
                </p>
              </div>

              {approvalImageUrl && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <p className="text-green-800">
                    ✓ Hình ảnh đã được tải lên thành công
                  </p>
                </div>
              )}
            </div>
          )}
        </FitBridgeModal>

        {/* Rejection Modal */}
        <FitBridgeModal
          open={rejectionModalVisible}
          onCancel={() => {
            setRejectionModalVisible(false);
            setRejectionReason("");
            setRequestToReject(null);
          }}
          title="Từ Chối Yêu Cầu Rút Tiền"
          titleIcon={<CloseCircleOutlined />}
          width={700}
          logoSize="medium"
          footer={
            <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
              <Button
                onClick={() => {
                  setRejectionModalVisible(false);
                  setRejectionReason("");
                  setRequestToReject(null);
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                danger
                onClick={submitRejection}
                disabled={!rejectionReason.trim()}
                className="px-6"
              >
                Xác nhận từ chối
              </Button>
            </div>
          }
          bodyStyle={{ padding: 0, maxHeight: "70vh", overflowY: "auto" }}
        >
          {requestToReject && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Thông tin yêu cầu
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Người yêu cầu:</span>
                    <span className="font-semibold">
                      {requestToReject.accountFullName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(requestToReject.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngân hàng:</span>
                    <span className="font-semibold">
                      {requestToReject.bankName}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-red-800 font-medium">
                  ⚠️ Vui lòng nhập lý do từ chối yêu cầu rút tiền
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Lý do từ chối *
                </label>
                <TextArea
                  rows={4}
                  placeholder="Nhập lý do từ chối yêu cầu rút tiền..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  maxLength={500}
                  showCount
                />
                <p className="text-gray-500 text-sm mt-2">
                  Lý do từ chối sẽ được gửi đến người yêu cầu
                </p>
              </div>
            </div>
          )}
        </FitBridgeModal>
      </div>

      <style jsx>{`
        .custom-pagination .ant-pagination-item-active {
          background: #ff914d;
          border-color: #ff914d;
        }
        .custom-pagination .ant-pagination-item-active a {
          color: white;
        }
        .custom-pagination .ant-pagination-item:hover {
          border-color: #ff914d;
        }
        .custom-pagination .ant-pagination-item:hover a {
          color: #ff914d;
        }
      `}</style>
    </div>
  );
}
