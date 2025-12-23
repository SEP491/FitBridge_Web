import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Input,
  Select,
  DatePicker,
  ConfigProvider,
  Spin,
  Tag,
  Tooltip,
  Row,
  Col,
  Descriptions,
  Avatar,
  Button,
  Form,
  Modal,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { MdReport } from "react-icons/md";
import { FaFilter, FaInfoCircle, FaUserCircle } from "react-icons/fa";
import adminService from "../../../services/adminServices";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import FitBridgeModal from "../../../components/FitBridgeModal";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

export default function ManageReportPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalReportDetailOpen, setIsModalReportDetailOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState([]);
  const [replyForm] = Form.useForm();
  const currentStatus = selectedReport?.status || "Pending";

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch all reports
  const fetchReports = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await adminService.getAllReports({
        page,
        size: pageSize,
      });

      const { items, total, page: currentPage, totalPages } = response.data;
      setReports(items || []);
      setPagination({
        current: currentPage,
        pageSize,
        total,
        totalPages,
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Không thể tải danh sách báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleTableChange = (newPagination) => {
    fetchReports(newPagination.current, newPagination.pageSize);
  };

  // Handle reply to report
  const handleReplyReport = async () => {
    try {
      const values = await replyForm.validateFields();
      setReplyLoading(true);

      await adminService.updateReportStatus(selectedReport.id, {
        note: values.note,
        status: values.status,
      });

      toast.success("Phản hồi báo cáo thành công");
      setIsReplyModalOpen(false);
      replyForm.resetFields();

      // Refresh reports list
      await fetchReports(pagination.current, pagination.pageSize);

      // Update selected report status
      if (selectedReport) {
        setSelectedReport({
          ...selectedReport,
          status: values.status,
          resolvedAt:
            values.status !== "Pending" ? new Date().toISOString() : null,
        });
      }
    } catch (error) {
      console.error("Error replying to report:", error);
      if (error.name !== "ValidationError") {
        toast.error("Không thể phản hồi báo cáo");
      }
    } finally {
      setReplyLoading(false);
    }
  };

  // Open reply modal
  const openReplyModal = () => {
    replyForm.setFieldsValue({
      status: selectedReport?.status || "Pending",
      note: "",
    });
    setIsReplyModalOpen(true);
  };

  // Filter reports based on search and filters
  const filteredReports = reports.filter((report) => {
    // Search filter
    const matchesSearch =
      !searchText ||
      report.reporterName?.toLowerCase().includes(searchText.toLowerCase()) ||
      report.reportedUserName
        ?.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      report.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchText.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;

    // Type filter
    const matchesType =
      typeFilter === "all" || report.reportType === typeFilter;

    // Date range filter
    const matchesDateRange =
      !dateRange ||
      dateRange.length === 0 ||
      !dateRange[0] ||
      !dateRange[1] ||
      (dayjs(report.createdAt).isAfter(dateRange[0]) &&
        dayjs(report.createdAt).isBefore(dateRange[1]));

    return matchesSearch && matchesStatus && matchesType && matchesDateRange;
  });

  // Get status tag
  const getStatusTag = (status) => {
    const statusConfig = {
      Pending: {
        color: "orange",
        icon: <ClockCircleOutlined />,
        text: "Chờ xử lý",
      },
      Processing: {
        color: "blue",
        icon: <LoadingOutlined />,
        text: "Đang xử lý",
      },
      Resolved: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Đã xử lý",
      },
      Rejected: {
        color: "red",
        icon: <CloseCircleOutlined />,
        text: "Từ chối",
      },
      FraudConfirmed: {
        color: "volcano",
        icon: <CloseCircleOutlined />,
        text: "Xác nhận gian lận",
      },
    };
    const config = statusConfig[status] || statusConfig.Pending;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // Get report type tag
  const getReportTypeTag = (type) => {
    const typeConfig = {
      GymCourseReport: { color: "blue", text: "Báo cáo Gói Tập Gym" },
      FreelancePTReport: { color: "purple", text: "Báo cáo PT Tự Do" },
      GymReport: { color: "cyan", text: "Báo cáo Phòng Gym" },
      UserReport: { color: "magenta", text: "Báo cáo Người Dùng" },
    };
    const config = typeConfig[type] || { color: "default", text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: "Ngày Tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      width: 150,
      sorter: (a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateA - dateB;
      },
      render: (date) => (
        <div>
          <div className="font-semibold">
            {date ? dayjs(date).format("DD/MM/YYYY") : "N/A"}
          </div>
          <div className="text-xs text-gray-500">
            {date ? dayjs(date).format("HH:mm") : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Người Báo Cáo",
      key: "reporter",
      align: "center",
      width: 200,
      render: (record) => (
        <div className="flex items-center gap-2 justify-start">
          <Avatar
            src={record.reporterAvatarUrl}
            icon={<UserOutlined />}
            size={40}
            style={{ backgroundColor: "#1890ff" }}
          />
          <div className="text-left">
            <div className="font-medium">
              {record.reporterName || "Chưa có thông tin"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Người Bị Báo Cáo",
      key: "reportedUser",
      align: "center",
      width: 200,
      render: (record) => (
        <div className="flex items-center gap-2 justify-start">
          <Avatar
            src={record.reportedUserAvatarUrl}
            icon={<UserOutlined />}
            size={40}
            style={{ backgroundColor: "#ff4d4f" }}
          />
          <div className="text-left">
            <div className="font-medium">
              {record.reportedUserName || "Chưa có thông tin"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Tiêu Đề",
      dataIndex: "title",
      key: "title",
      align: "center",
      width: 200,
      render: (title) => (
        <Tooltip title={title}>
          <div className="font-semibold text-gray-800 truncate max-w-[200px]">
            {title || "N/A"}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Loại Báo Cáo",
      dataIndex: "reportType",
      key: "reportType",
      align: "center",
      width: 180,
      render: (type) => getReportTypeTag(type),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      fixed: "right",
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Ngày Xử Lý",
      dataIndex: "resolvedAt",
      key: "resolvedAt",
      align: "center",
      fixed: "right",
      width: 150,
      render: (date) => (
        <div>
          {date ? (
            <>
              <div className="font-semibold">
                {dayjs(date).format("DD/MM/YYYY")}
              </div>
              <div className="text-xs text-gray-500">
                {dayjs(date).format("HH:mm")}
              </div>
            </>
          ) : (
            <span className="text-gray-400">Chưa xử lý</span>
          )}
        </div>
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    total: filteredReports.length,
    pending: filteredReports.filter((r) => r.status === "Pending").length,
    processing: filteredReports.filter((r) => r.status === "Processing").length,
    resolved: filteredReports.filter((r) => r.status === "Resolved").length,
    rejected: filteredReports.filter((r) => r.status === "Rejected").length,
    fraudConfirmed: filteredReports.filter((r) => r.status === "FraudConfirmed")
      .length,
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin
          indicator={
            <LoadingOutlined style={{ fontSize: 48, color: "#FF914D" }} spin />
          }
          tip="Đang tải báo cáo..."
          size="large"
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#ED2A46] flex items-center gap-2 mb-4">
          <MdReport />
          Quản Lý Báo Cáo
        </h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-gray-600 text-sm">Tổng báo cáo</div>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pending}
            </div>
            <div className="text-gray-600 text-sm">Chờ xử lý</div>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-2xl font-bold text-blue-500">
              {stats.processing}
            </div>
            <div className="text-gray-600 text-sm">Đang xử lý</div>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-2xl font-bold text-green-600">
              {stats.resolved}
            </div>
            <div className="text-gray-600 text-sm">Đã xử lý</div>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected}
            </div>
            <div className="text-gray-600 text-sm">Từ chối</div>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-2xl font-bold text-red-700">
              {stats.fraudConfirmed}
            </div>
            <div className="text-gray-600 text-sm">Gian lận</div>
          </Card>
        </div>
      </div>

      <ConfigProvider
        theme={{ components: { Table: { headerBg: "#FFE5E9" } } }}
      >
        {/* Advanced Filters */}
        <Card
          className="mb-4"
          title={
            <span className="flex items-center gap-2">
              <FaFilter /> Bộ lọc nâng cao
            </span>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Tìm kiếm theo tên, tiêu đề, mô tả..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />

            <Select
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="Pending">Chờ xử lý</Select.Option>
              <Select.Option value="Processing">Đang xử lý</Select.Option>
              <Select.Option value="Resolved">Đã xử lý</Select.Option>
              <Select.Option value="Rejected">Từ chối</Select.Option>
              <Select.Option value="FraudConfirmed">
                Xác nhận gian lận
              </Select.Option>
            </Select>

            <Select
              placeholder="Lọc theo loại báo cáo"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: "100%" }}
            >
              <Select.Option value="all">Tất cả loại</Select.Option>
              <Select.Option value="GymCourseReport">
                Báo cáo Gói Tập Gym
              </Select.Option>
              <Select.Option value="FreelancePTReport">
                Báo cáo PT Tự Do
              </Select.Option>
              <Select.Option value="GymReport">Báo cáo Phòng Gym</Select.Option>
              <Select.Option value="UserReport">
                Báo cáo Người Dùng
              </Select.Option>
            </Select>

            <RangePicker
              placeholder={["Từ ngày", "Đến ngày"]}
              value={dateRange}
              onChange={(dates) => setDateRange(dates || [])}
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
            />
          </div>
        </Card>

        <Table
          dataSource={filteredReports}
          columns={columns}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            position: ["bottomCenter"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} báo cáo`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 900 }}
          size="middle"
          rowKey="id"
          onRow={(record) => ({
            onClick: () => {
              setSelectedReport(record);
              setIsModalReportDetailOpen(true);
            },
            style: { cursor: "pointer" },
          })}
        />
      </ConfigProvider>

      {/* Report Detail Modal - Enhanced UI */}
      <FitBridgeModal
        open={isModalReportDetailOpen}
        onCancel={() => setIsModalReportDetailOpen(false)}
        title="Chi Tiết Báo Cáo"
        titleIcon={<EyeOutlined />}
        width={950}
        logoSize="medium"
        bodyStyle={{ padding: "0", maxHeight: "65vh", overflowY: "auto" }}
        footer={
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
            <Button
              size="large"
              onClick={() => setIsModalReportDetailOpen(false)}
            >
              Đóng
            </Button>
            {selectedReport?.status !== "FraudConfirmed" && (
              <Button
                type="primary"
                size="large"
                icon={<SendOutlined />}
                onClick={openReplyModal}
                className="bg-[#FF914D] border-0 hover:bg-[#e8823d]"
              >
                Phản Hồi
              </Button>
            )}
          </div>
        }
      >
        {selectedReport && (
          <div className="flex flex-col">
            {/* Header Section with Key Info */}
            <div className="bg-gradient-to-r from-[#FFF9FA] to-[#FFF5F0] p-6 border-b-2 border-gray-100">
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <MdReport className="text-[#FF914D]" />
                      <span>Tiêu Đề Báo Cáo</span>
                    </div>
                    <div className="text-2xl font-bold text-[#ED2A46]">
                      {selectedReport.title || "N/A"}
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <ClockCircleOutlined className="text-[#FF914D]" />
                      <span>Trạng Thái</span>
                    </div>
                    <div className="text-2xl">
                      {getStatusTag(selectedReport.status)}
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Main Content */}
            <div className="p-6 flex flex-col gap-5 space-y-6">
              {/* Report Info Card */}
              <Card
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title={
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <FaInfoCircle />
                    Thông Tin Báo Cáo
                  </span>
                }
                bordered={true}
                style={{ borderColor: "#FFE5E9" }}
              >
                <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                  <Descriptions.Item label="Mã Báo Cáo" span={2}>
                    <div className="font-mono text-xs bg-gray-50 p-2 rounded inline-block">
                      {selectedReport.id}
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label="Loại Báo Cáo">
                    {getReportTypeTag(selectedReport.reportType)}
                  </Descriptions.Item>

                  <Descriptions.Item label="Trạng Thái">
                    {getStatusTag(selectedReport.status)}
                  </Descriptions.Item>

                  <Descriptions.Item label="Tiêu Đề" span={2}>
                    <div className="font-semibold text-gray-800">
                      {selectedReport.title || "N/A"}
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label="Mô Tả" span={2}>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {selectedReport.description || "Không có mô tả"}
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label="Ngày Tạo">
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {selectedReport.createdAt
                          ? dayjs(selectedReport.createdAt).format("DD/MM/YYYY")
                          : "N/A"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {selectedReport.createdAt
                          ? dayjs(selectedReport.createdAt).format("HH:mm:ss")
                          : ""}
                      </span>
                    </div>
                  </Descriptions.Item>

                  <Descriptions.Item label="Ngày Xử Lý">
                    {selectedReport.resolvedAt ? (
                      <div className="flex flex-col">
                        <span className="font-semibold">
                          {dayjs(selectedReport.resolvedAt).format(
                            "DD/MM/YYYY"
                          )}
                        </span>
                        <span className="text-xs text-gray-500">
                          {dayjs(selectedReport.resolvedAt).format("HH:mm:ss")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Chưa xử lý</span>
                    )}
                  </Descriptions.Item>

                  <Descriptions.Item label="ID Sản Phẩm" span={2}>
                    <div className="font-mono text-xs bg-blue-50 p-2 rounded inline-block">
                      {selectedReport.orderItemId || "N/A"}
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Reporter Info Card */}
              <Card
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title={
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <FaUserCircle />
                    Thông Tin Người Báo Cáo
                  </span>
                }
                bordered={true}
                style={{ borderColor: "#FFE5E9" }}
              >
                <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <Avatar
                    src={selectedReport.reporterAvatarUrl}
                    icon={<UserOutlined />}
                    size={80}
                    style={{
                      backgroundColor: "#1890ff",
                      border: "4px solid white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">
                      Người Báo Cáo
                    </div>
                    <div className="text-xl font-bold text-gray-800">
                      {selectedReport.reporterName || "Chưa có thông tin"}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Reported User Info Card */}
              <Card
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title={
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <UserOutlined />
                    Thông Tin Người Bị Báo Cáo
                  </span>
                }
                bordered={true}
                style={{ borderColor: "#FFE5E9" }}
              >
                <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                  <Avatar
                    src={selectedReport.reportedUserAvatarUrl}
                    icon={<UserOutlined />}
                    size={80}
                    style={{
                      backgroundColor: "#ff4d4f",
                      border: "4px solid white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">
                      Người Bị Báo Cáo
                    </div>
                    <div className="text-xl font-bold text-gray-800">
                      {selectedReport.reportedUserName || "Chưa có thông tin"}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </FitBridgeModal>

      {/* Reply Modal */}
      <FitBridgeModal
        open={isReplyModalOpen}
        onCancel={() => {
          setIsReplyModalOpen(false);
          replyForm.resetFields();
        }}
        title="Phản Hồi Báo Cáo"
        titleIcon={<SendOutlined />}
        width={650}
        logoSize="medium"
        footer={
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
            <Button
              size="large"
              onClick={() => {
                setIsReplyModalOpen(false);
                replyForm.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              loading={replyLoading}
              onClick={handleReplyReport}
              className="bg-gradient-to-r from-orange-400 to-orange-600 border-0 px-6 shadow-lg"
            >
              Gửi Phản Hồi
            </Button>
          </div>
        }
        bodyStyle={{ padding: 0, maxHeight: "70vh", overflowY: "auto" }}
      >
        <Form form={replyForm} layout="vertical" className="p-6">
          <Form.Item
            name="status"
            label={
              <span className="font-semibold text-gray-700">
                Trạng Thái Mới
              </span>
            }
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select
              size="large"
              placeholder="Chọn trạng thái"
              onChange={(value) => {
                // Trigger note field validation when status changes
                if (value === "FraudConfirmed") {
                  replyForm.setFieldsValue({
                    note: replyForm.getFieldValue("note") || "",
                  });
                }
              }}
            >
              {currentStatus !== "Processing" &&
                currentStatus !== "Resolved" && (
                  <Select.Option value="Processing">
                    <span className="flex items-center gap-2">
                      <LoadingOutlined className="text-blue-500" />
                      Đang xử lý
                    </span>
                  </Select.Option>
                )}
              {currentStatus !== "Resolved" && (
                <Select.Option value="Resolved">
                  <span className="flex items-center gap-2">
                    <CheckCircleOutlined className="text-green-500" />
                    Đã xử lý
                  </span>
                </Select.Option>
              )}
              <Select.Option value="FraudConfirmed">
                <span className="flex items-center gap-2">
                  <CloseCircleOutlined className="text-red-700" />
                  Xác nhận gian lận
                </span>
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.status !== currentValues.status
            }
          >
            {({ getFieldValue }) => {
              const selectedStatus = getFieldValue("status");
              const isFraudConfirmed = selectedStatus === "FraudConfirmed";

              return (
                <>
                  <Form.Item
                    name="note"
                    label={
                      <span className="font-semibold text-gray-700">
                        Ghi Chú / Phản Hồi
                        {isFraudConfirmed && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </span>
                    }
                    rules={[
                      {
                        required: isFraudConfirmed,
                        message: isFraudConfirmed
                          ? "Ghi chú bắt buộc khi xác nhận gian lận"
                          : "Vui lòng nhập ghi chú",
                      },
                      {
                        min: 10,
                        message: "Ghi chú phải có ít nhất 10 ký tự",
                      },
                    ]}
                  >
                    <TextArea
                      rows={6}
                      placeholder={
                        isFraudConfirmed
                          ? "Vui lòng nhập chi tiết về hành vi gian lận và bằng chứng (bắt buộc)..."
                          : "Nhập ghi chú hoặc phản hồi chi tiết về báo cáo này..."
                      }
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>

                  {isFraudConfirmed && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
                      <div className="flex items-start gap-2">
                        <CloseCircleOutlined className="text-red-500 mt-1" />
                        <div className="text-sm text-red-700">
                          <div className="font-semibold mb-1">
                            ⚠️ Cảnh báo quan trọng:
                          </div>
                          <div>
                            Khi xác nhận gian lận, bạn phải cung cấp ghi chú chi
                            tiết về hành vi gian lận và bằng chứng liên quan.
                            Quyết định này sẽ ảnh hưởng nghiêm trọng đến tài
                            khoản người bị báo cáo.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            }}
          </Form.Item>

          {selectedReport && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <div className="text-sm text-blue-700">
                <div className="font-semibold mb-2">Thông tin báo cáo:</div>
                <div className="space-y-1">
                  <div>
                    <strong>Tiêu đề:</strong> {selectedReport.title}
                  </div>
                  <div>
                    <strong>Người báo cáo:</strong>{" "}
                    {selectedReport.reporterName}
                  </div>
                  <div>
                    <strong>Trạng thái hiện tại:</strong>{" "}
                    {getStatusTag(selectedReport.status)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Form>
      </FitBridgeModal>
    </div>
  );
}
