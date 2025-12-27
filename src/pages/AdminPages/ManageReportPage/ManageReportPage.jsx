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
  Image,
  Upload,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileImageOutlined,
  UploadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { MdReport } from "react-icons/md";
import { FaInfoCircle, FaUserCircle } from "react-icons/fa";
import adminService from "../../../services/adminServices";
import reportService from "../../../services/reportService";
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
  const [isUploadRefundProofModalOpen, setIsUploadRefundProofModalOpen] =
    useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isConfirmFraudModalOpen, setIsConfirmFraudModalOpen] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadRefundForm] = Form.useForm();
  const [resolveForm] = Form.useForm();
  const [confirmFraudForm] = Form.useForm();
  const [refundProofFileList, setRefundProofFileList] = useState([]);
  const [checkingCompletion, setCheckingCompletion] = useState(false);
  const [summary, setSummary] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [completionPercentage, setCompletionPercentage] = useState(null);

  // Fetch all reports
  const fetchReports = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await adminService.getAllReports({
        page,
        size: pageSize,
      });

      const {
        items,
        total,
        page: currentPage,
        totalPages,
        summary,
      } = response.data;
      setReports(items || []);
      setSummary(summary || {});
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

  // Reload all data
  const handleReloadAll = () => {
    fetchReports(pagination.current, pagination.pageSize);
  };

  // Filter reports based on search text
  const filteredReports = reports.filter((report) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      report.reporterName?.toLowerCase().includes(searchLower) ||
      report.reportedUserName?.toLowerCase().includes(searchLower) ||
      report.title?.toLowerCase().includes(searchLower) ||
      report.description?.toLowerCase().includes(searchLower)
    );
  });

  // Handle process report (Pending -> Processing)
  const handleProcessReport = async () => {
    try {
      setActionLoading(true);
      await reportService.processReport(selectedReport.id);
      toast.success("Đã bắt đầu xử lý báo cáo");
      await fetchReports(pagination.current, pagination.pageSize);
      setSelectedReport({ ...selectedReport, status: "Processing" });
    } catch (error) {
      console.error("Error processing report:", error);
      toast.error("Không thể xử lý báo cáo");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle resolve report (Processing -> Resolved)
  const handleResolveReport = async () => {
    try {
      const values = await resolveForm.validateFields();
      setActionLoading(true);
      await reportService.resolveReport(selectedReport.id, {
        note: values.note,
      });
      toast.success("Đã giải quyết báo cáo thành công");
      setIsResolveModalOpen(false);
      resolveForm.resetFields();
      await fetchReports(pagination.current, pagination.pageSize);
      setSelectedReport({
        ...selectedReport,
        status: "Resolved",
        resolvedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error resolving report:", error);
      if (error.name !== "ValidationError") {
        toast.error("Không thể giải quyết báo cáo");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Open resolve modal
  const openResolveModal = () => {
    resolveForm.resetFields();
    setIsResolveModalOpen(true);
  };

  // Handle confirm fraud (Processing -> FraudConfirmed)
  const handleConfirmFraud = async () => {
    try {
      const values = await confirmFraudForm.validateFields();
      setActionLoading(true);
      await reportService.confirmReport(selectedReport.id, {
        note: values.note,
      });

      toast.success("Đã xác nhận gian lận");
      setIsConfirmFraudModalOpen(false);
      confirmFraudForm.resetFields();
      await fetchReports(pagination.current, pagination.pageSize);
      setSelectedReport({ ...selectedReport, status: "FraudConfirmed" });
    } catch (error) {
      console.error("Error confirming fraud:", error);
      if (error.name !== "ValidationError") {
        toast.error("Không thể xác nhận gian lận");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Open confirm fraud modal with completion check
  const openConfirmFraudModal = async () => {
    if (!selectedReport?.orderItemId) {
      confirmFraudForm.resetFields();
      setIsConfirmFraudModalOpen(true);
      return;
    }

    try {
      setCheckingCompletion(true);
      const response = await reportService.checkCompletion(
        selectedReport.orderItemId
      );

      if (response.data !== null) {
        const { completionPercentage } = response.data;
        setCompletionPercentage(completionPercentage);
        if (completionPercentage > 50) {
          toast.error(
            `Không thể xác nhận gian lận: Người dùng đã hoàn thành ${completionPercentage.toFixed(
              2
            )}% khóa học (vượt quá 50%).`
          );
          return;
        }
      }

      confirmFraudForm.resetFields();
      setIsConfirmFraudModalOpen(true);
    } catch (error) {
      console.error("Error checking completion:", error);
      toast.error("Không thể kiểm tra tiến độ hoàn thành khóa học");
    } finally {
      setCheckingCompletion(false);
    }
  };

  // Handle upload refund proof (FraudConfirmed -> Resolved)
  const handleUploadRefundProof = async () => {
    try {
      const values = await uploadRefundForm.validateFields();

      // Check if file is selected
      if (!refundProofFileList.length) {
        toast.error("Vui lòng chọn hình ảnh bằng chứng hoàn tiền");
        return;
      }

      setReplyLoading(true);

      // Create FormData with the image file and note
      const formData = new FormData();
      formData.append("reportId", selectedReport.id);
      formData.append(
        "resolvedEvidenceImage",
        refundProofFileList[0].originFileObj
      );
      formData.append("note", values.note || "");

      // Submit the refund proof
      await reportService.uploadRefundProofReport(formData);

      toast.success("Đã tải lên bằng chứng hoàn tiền thành công");
      setIsUploadRefundProofModalOpen(false);
      uploadRefundForm.resetFields();
      setRefundProofFileList([]);
      await fetchReports(pagination.current, pagination.pageSize);
      setSelectedReport({
        ...selectedReport,
        status: "Resolved",
        resolvedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error uploading refund proof:", error);
      if (error.name !== "ValidationError") {
        toast.error("Không thể tải lên bằng chứng hoàn tiền");
      }
    } finally {
      setReplyLoading(false);
    }
  };

  // Open upload refund proof modal
  const openUploadRefundProofModal = () => {
    uploadRefundForm.resetFields();
    setRefundProofFileList([]);
    setIsUploadRefundProofModalOpen(true);
  };

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
      ProductReport: {
        color: "volcano",
        icon: <CloseCircleOutlined />,
        text: "Báo cáo Sản Phẩm",
      },
      GymReport: {
        color: "volcano",
        icon: <CloseCircleOutlined />,
        text: "Báo cáo Phòng Gym",
      },
      UserReport: {
        color: "volcano",
        icon: <CloseCircleOutlined />,
        text: "Báo cáo Người Dùng",
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
      FreelancePtReport: { color: "purple", text: "Báo cáo PT Tự Do" },
      GymReport: { color: "cyan", text: "Báo cáo Phòng Gym" },
      UserReport: { color: "magenta", text: "Báo cáo Người Dùng" },
      ProductReport: { color: "cyan", text: "Báo cáo Sản Phẩm" },
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
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <RangePicker
            style={{ width: 300, display: "block" }}
            value={
              selectedKeys[0]
                ? [dayjs(selectedKeys[0][0]), dayjs(selectedKeys[0][1])]
                : null
            }
            onChange={(dates) => {
              setSelectedKeys(
                dates
                  ? [
                      [
                        dates[0].format("YYYY-MM-DD"),
                        dates[1].format("YYYY-MM-DD"),
                      ],
                    ]
                  : []
              );
              confirm();
            }}
            format="DD/MM/YYYY"
          />
        </div>
      ),
      onFilter: (value, record) => {
        if (!value || value.length === 0) return true;
        const [startDate, endDate] = value[0];
        const recordDate = dayjs(record.createdAt).format("YYYY-MM-DD");
        return recordDate >= startDate && recordDate <= endDate;
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
      title: "Đối Tượng Bị Báo Cáo",
      key: "reportedUser",
      align: "center",
      width: 200,
      render: (record) => (
        <div className="flex items-center gap-2 justify-start">
          <Avatar
            src={record.reportedUserAvatarUrl || record.reportedProductImageUrl}
            icon={<UserOutlined />}
            size={40}
            style={{ backgroundColor: "#ff4d4f" }}
          />
          <div className="text-left">
            <div className="font-medium">
              {record.reportedUserName
                ? record.reportedUserName
                : record.reportedProduct || "Chưa có thông tin"}
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
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Select
            style={{ width: 200, display: "block" }}
            placeholder="Chọn loại báo cáo"
            value={selectedKeys[0]}
            onChange={(value) => {
              setSelectedKeys(value ? [value] : []);
              confirm();
            }}
            allowClear
          >
            <Select.Option value="GymCourseReport">
              Báo cáo Gói Tập Gym
            </Select.Option>
            <Select.Option value="FreelancePtReport">
              Báo cáo PT Tự Do
            </Select.Option>
            <Select.Option value="GymReport">Báo cáo Phòng Gym</Select.Option>
            <Select.Option value="UserReport">Báo cáo Người Dùng</Select.Option>
            <Select.Option value="ProductReport">
              Báo cáo Sản Phẩm
            </Select.Option>
          </Select>
        </div>
      ),
      onFilter: (value, record) => {
        if (!value) return true;
        return record.reportType === value;
      },
      render: (type) => getReportTypeTag(type),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      fixed: "right",
      width: 120,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Select
            style={{ width: 200, display: "block" }}
            placeholder="Chọn trạng thái"
            value={selectedKeys[0]}
            onChange={(value) => {
              setSelectedKeys(value ? [value] : []);
              confirm();
            }}
            allowClear
          >
            <Select.Option value="Pending">Chờ xử lý</Select.Option>
            <Select.Option value="Processing">Đang xử lý</Select.Option>
            <Select.Option value="Resolved">Đã xử lý</Select.Option>
            <Select.Option value="FraudConfirmed">
              Xác nhận gian lận
            </Select.Option>
          </Select>
        </div>
      ),
      onFilter: (value, record) => {
        if (!value) return true;
        return record.status === value;
      },
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
    <div className="">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#ED2A46] flex items-center gap-2 mb-4">
          <MdReport />
          Quản Lý Báo Cáo
        </h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-2xl font-bold text-blue-600">
              {summary?.totalReports}
            </div>
            <div className="text-gray-600 text-sm">Tổng báo cáo</div>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-2xl font-bold text-orange-600">
              {summary?.productReportCount}
            </div>
            <div className="text-gray-600 text-sm">Báo cáo Sản Phẩm</div>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-2xl font-bold text-blue-500">
              {summary?.freelancePtReportCount}
            </div>
            <div className="text-gray-600 text-sm">Báo cáo PT Tự Do</div>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-2xl font-bold text-green-600">
              {summary?.gymCourseReportCount}
            </div>
            <div className="text-gray-600 text-sm">Báo cáo Gói Tập Gym</div>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-2xl font-bold text-red-600">
              {summary?.pendingCount}
            </div>
            <div className="text-gray-600 text-sm">Dang Cho Xử Lý</div>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-2xl font-bold text-red-700">
              {summary?.processingCount}
            </div>
            <div className="text-gray-600 text-sm">Đang Xử Lý</div>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-2xl font-bold text-red-700">
              {summary?.resolvedCount}
            </div>
            <div className="text-gray-600 text-sm">Đã Xử Lý</div>
          </Card>
          <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-2xl font-bold text-red-700">
              {summary?.fraudConfirmedCount}
            </div>
            <div className="text-gray-600 text-sm">Xác Nhận Gian Lận</div>
          </Card>
        </div>
      </div>

      <ConfigProvider
        theme={{ components: { Table: { headerBg: "#FFE5E9" } } }}
      >
        {/* Search and Refresh Row */}
        <Card className="mb-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tìm kiếm theo tên, tiêu đề, mô tả..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ flex: 1 }}
              size="large"
            />
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleReloadAll}
              size="large"
              style={{ backgroundColor: "#ED2A46", borderColor: "#ED2A46" }}
            >
              Làm mới
            </Button>
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
            onClick: async () => {
              setSelectedReport(record);
              setIsModalReportDetailOpen(true);

              // Fetch completion percentage if orderItemId exists and it's not a product report
              if (
                record.orderItemId &&
                record.reportType !== "ProductReport" &&
                !record.isProductReport
              ) {
                try {
                  const response = await reportService.checkCompletion(
                    record.orderItemId
                  );
                  if (response.data !== null) {
                    const { completionPercentage } = response.data;
                    setCompletionPercentage(completionPercentage);
                  } else {
                    setCompletionPercentage(null);
                  }
                } catch (error) {
                  console.error("Error checking completion:", error);
                  setCompletionPercentage(null);
                }
              } else {
                setCompletionPercentage(null);
              }
            },
            style: { cursor: "pointer" },
          })}
        />
      </ConfigProvider>

      {/* Report Detail Modal - Enhanced UI */}
      <FitBridgeModal
        open={isModalReportDetailOpen}
        onCancel={() => {
          setIsModalReportDetailOpen(false);
          setCompletionPercentage(null);
        }}
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
            {/* Pending -> Processing */}
            {selectedReport?.status === "Pending" && (
              <Button
                type="primary"
                size="large"
                icon={<LoadingOutlined />}
                loading={actionLoading}
                onClick={handleProcessReport}
                className="bg-blue-500 border-0 hover:bg-blue-600"
              >
                Bắt Đầu Xử Lý
              </Button>
            )}
            {/* Processing -> Resolved or FraudConfirmed */}
            {selectedReport?.status === "Processing" && (
              <>
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={openResolveModal}
                  className="bg-green-500 border-0 hover:bg-green-600"
                >
                  Giải Quyết
                </Button>
                <Button
                  type="primary"
                  danger
                  size="large"
                  icon={<CloseCircleOutlined />}
                  loading={checkingCompletion}
                  onClick={openConfirmFraudModal}
                >
                  {selectedReport?.isProductReport
                    ? "Xác Nhận Báo Cáo"
                    : "Xác Nhận Gian Lận"}
                </Button>
              </>
            )}
            {/* FraudConfirmed -> Upload refund proof -> Resolved */}
            {selectedReport?.status === "FraudConfirmed" && (
              <Button
                type="primary"
                size="large"
                icon={<FileImageOutlined />}
                onClick={openUploadRefundProofModal}
                className="bg-[#FF914D] border-0 hover:bg-[#e8823d]"
              >
                Tải Lên Bằng Chứng Hoàn Tiền
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
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Mã Báo Cáo">
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

                  {selectedReport?.reportType !== "ProductReport" &&
                    !selectedReport?.isProductReport && (
                      <Descriptions.Item label="Tiến Độ Hoàn Thành Khóa Học">
                        {completionPercentage !== null ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-blue-600">
                              {completionPercentage.toFixed(2)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            Không có thông tin
                          </span>
                        )}
                      </Descriptions.Item>
                    )}

                  <Descriptions.Item label="Tiêu Đề" span={2}>
                    <div className="font-semibold text-gray-800">
                      {selectedReport.title || "N/A"}
                    </div>
                  </Descriptions.Item>
                  {selectedReport.status === "FraudConfirmed" && (
                    <Descriptions.Item label="Số Tiền Hoàn Trả" span={2}>
                      <div className="font-semibold text-green-600">
                        {selectedReport.refundAmount?.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }) || "N/A"}
                      </div>
                    </Descriptions.Item>
                  )}
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
                    Thông Tin Đối Tượng Bị Báo Cáo
                  </span>
                }
                bordered={true}
                style={{ borderColor: "#FFE5E9" }}
              >
                <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                  <Avatar
                    src={
                      selectedReport.reportedUserAvatarUrl ||
                      selectedReport.reportedProductImageUrl
                    }
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
                      Đối Tượng Bị Báo Cáo
                    </div>
                    <div className="text-xl font-bold text-gray-800">
                      {selectedReport.reportedUserName
                        ? selectedReport.reportedUserName
                        : selectedReport.reportedProduct || "Chưa có thông tin"}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Evidence Images Card */}
              {selectedReport.evidenceImageUrls &&
                selectedReport.evidenceImageUrls.length > 0 && (
                  <Card
                    size="small"
                    className="shadow-sm hover:shadow-md transition-shadow"
                    title={
                      <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                        <FileImageOutlined />
                        Hình Ảnh Bằng Chứng (
                        {selectedReport.evidenceImageUrls.length})
                      </span>
                    }
                    bordered={true}
                    style={{ borderColor: "#FFE5E9" }}
                  >
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Image.PreviewGroup>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {selectedReport.evidenceImageUrls.map(
                            (url, index) => (
                              <div
                                key={index}
                                className="relative overflow-hidden rounded-lg border border-gray-200 hover:border-[#FF914D] transition-colors"
                              >
                                <Image
                                  src={url}
                                  alt={`Bằng chứng ${index + 1}`}
                                  className="object-cover"
                                  style={{
                                    width: "100%",
                                    objectFit: "cover",
                                  }}
                                  placeholder={
                                    <div className="flex items-center justify-center h-[120px] bg-gray-100">
                                      <LoadingOutlined className="text-2xl text-gray-400" />
                                    </div>
                                  }
                                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgesAADcsSURBVHic7d15fFTVvf/x13dmksm+ECAhrAnIJm6A7AQFVKy21rW1amttba1dvPdWu9y2t/Xetra/3tvWWq221rpRpdWioihoFRBk3zdZA0lIICHJJJnMev7+yCQECJBkkjkzyef5eMxjMjNnzvmckHfOnDlzjhhjUEq1Xg59F0ApBSoESqlAhaCUQqFCME0Z5bq++iFZwQAAAABJRU5ErkJggg=="
                                />
                              </div>
                            )
                          )}
                        </div>
                      </Image.PreviewGroup>
                    </div>
                  </Card>
                )}

              {/* Resolved Evidence Image Card */}
              {selectedReport.resolvedEvidenceImageUrls && (
                <Card
                  size="small"
                  className="shadow-sm hover:shadow-md transition-shadow"
                  title={
                    <span className="flex items-center gap-2 text-base font-semibold text-green-600">
                      <CheckCircleOutlined />
                      Hình Ảnh Bằng Chứng Hoàn Tiền
                    </span>
                  }
                  bordered={true}
                  style={{ borderColor: "#D1FAE5" }}
                >
                  <div className="p-3 bg-green-50 rounded-lg">
                    <Image.PreviewGroup>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        <div className="relative overflow-hidden rounded-lg border border-gray-200 hover:border-green-500 transition-colors">
                          <Image
                            src={selectedReport.resolvedEvidenceImageUrls}
                            alt="Bằng chứng hoàn tiền"
                            className="object-cover"
                            style={{
                              width: "100%",
                              objectFit: "cover",
                            }}
                            placeholder={
                              <div className="flex items-center justify-center h-[120px] bg-gray-100">
                                <LoadingOutlined className="text-2xl text-gray-400" />
                              </div>
                            }
                            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgesAADcsSURBVHic7d15fFTVvf/x13dmksm+ECAhrAnIJm6A7AQFVKy21rW1amttba1dvPdWu9y2t/Xetra/3tvWWq221rpRpdWioihoFRBk3zdZA0lIICHJJJnMev7+yCQECJBkkjkzyef5eMxjMjNnzvmckHfOnDlzjhhjUEq1Xg59F0ApBSoESqlAhaCUQqFCME0Z5bq++iFZwQAAAABJRU5ErkJggg=="
                          />
                        </div>
                      </div>
                    </Image.PreviewGroup>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </FitBridgeModal>

      {/* Resolve Report Modal */}
      <FitBridgeModal
        open={isResolveModalOpen}
        onCancel={() => {
          setIsResolveModalOpen(false);
          resolveForm.resetFields();
        }}
        title="Giải Quyết Báo Cáo"
        titleIcon={<CheckCircleOutlined />}
        width={650}
        logoSize="medium"
        footer={
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
            <Button
              size="large"
              onClick={() => {
                setIsResolveModalOpen(false);
                resolveForm.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              loading={actionLoading}
              onClick={handleResolveReport}
              className="bg-gradient-to-r from-green-500 to-green-600 border-0 px-6 shadow-lg"
            >
              Xác Nhận Giải Quyết
            </Button>
          </div>
        }
        bodyStyle={{ padding: 0, maxHeight: "70vh", overflowY: "auto" }}
      >
        <Form form={resolveForm} layout="vertical" className="p-6">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4">
            <div className="flex items-start gap-2">
              <CheckCircleOutlined className="text-green-500 mt-1" />
              <div className="text-sm text-green-700">
                <div className="font-semibold mb-1">✅ Giải quyết báo cáo:</div>
                <div>
                  Xác nhận rằng báo cáo này đã được xem xét và không có hành vi
                  gian lận. Việc phân phối lợi nhuận sẽ được tiếp tục bình
                  thường.
                </div>
              </div>
            </div>
          </div>

          <Form.Item
            name="note"
            label={
              <span className="font-semibold text-gray-700">
                Ghi Chú Giải Quyết <span className="text-red-500">*</span>
              </span>
            }
            rules={[
              {
                required: true,
                message: "Vui lòng nhập ghi chú giải quyết",
              },
              {
                min: 10,
                message: "Ghi chú phải có ít nhất 10 ký tự",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập ghi chú về việc giải quyết báo cáo này..."
              showCount
              maxLength={500}
            />
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

      {/* Confirm Fraud Modal */}
      <FitBridgeModal
        open={isConfirmFraudModalOpen}
        onCancel={() => {
          setIsConfirmFraudModalOpen(false);
          confirmFraudForm.resetFields();
        }}
        title="Xác Nhận Gian Lận"
        titleIcon={<CloseCircleOutlined />}
        width={650}
        logoSize="medium"
        footer={
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
            <Button
              size="large"
              onClick={() => {
                setIsConfirmFraudModalOpen(false);
                confirmFraudForm.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              danger
              size="large"
              icon={<CloseCircleOutlined />}
              loading={actionLoading}
              onClick={handleConfirmFraud}
              className="px-6 shadow-lg"
            >
              Xác Nhận Gian Lận
            </Button>
          </div>
        }
        bodyStyle={{ padding: 0, maxHeight: "70vh", overflowY: "auto" }}
      >
        <Form form={confirmFraudForm} layout="vertical" className="p-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
            <div className="flex items-start gap-2">
              <CloseCircleOutlined className="text-red-500 mt-1" />
              <div className="text-sm text-red-700">
                <div className="font-semibold mb-1">
                  ⚠️ Cảnh báo quan trọng:
                </div>
                <div>
                  Khi xác nhận gian lận, việc thanh toán sẽ bị tạm dừng và bạn
                  sẽ cần tải lên bằng chứng hoàn tiền để hoàn tất quy trình.
                  Quyết định này sẽ ảnh hưởng nghiêm trọng đến tài khoản người
                  bị báo cáo.
                </div>
              </div>
            </div>
          </div>

          <Form.Item
            name="note"
            label={
              <span className="font-semibold text-gray-700">
                Ghi Chú{" "}
                {selectedReport?.isProductReport
                  ? "Xác Nhận Báo Cáo"
                  : "Xác Nhận Gian Lận"}{" "}
                <span className="text-red-500">*</span>
              </span>
            }
            rules={[
              {
                required: true,
                message: `Vui lòng nhập ghi chú ${
                  selectedReport?.isProductReport
                    ? "xác nhận báo cáo"
                    : "xác nhận gian lận"
                }`,
              },
              {
                min: 10,
                message: `Ghi chú ${
                  selectedReport?.isProductReport ? "báo cáo" : "gian lận"
                } phải có ít nhất 10 ký tự`,
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập chi tiết về hành vi gian lận và bằng chứng liên quan..."
              showCount
              maxLength={500}
            />
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

      {/* Upload Refund Proof Modal */}
      <FitBridgeModal
        open={isUploadRefundProofModalOpen}
        onCancel={() => {
          setIsUploadRefundProofModalOpen(false);
          uploadRefundForm.resetFields();
        }}
        title="Tải Lên Bằng Chứng Hoàn Tiền"
        titleIcon={<FileImageOutlined />}
        width={650}
        logoSize="medium"
        footer={
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
            <Button
              size="large"
              onClick={() => {
                setIsUploadRefundProofModalOpen(false);
                uploadRefundForm.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              loading={replyLoading}
              onClick={handleUploadRefundProof}
              className="bg-gradient-to-r from-green-500 to-green-600 border-0 px-6 shadow-lg"
            >
              Xác Nhận Hoàn Tiền
            </Button>
          </div>
        }
        bodyStyle={{ padding: 0, maxHeight: "70vh", overflowY: "auto" }}
      >
        <Form form={uploadRefundForm} layout="vertical" className="p-6">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded mb-4">
            <div className="flex items-start gap-2">
              <FileImageOutlined className="text-orange-500 mt-1" />
              <div className="text-sm text-orange-700">
                <div className="font-semibold mb-1">📋 Hướng dẫn:</div>
                <div>
                  Sau khi đã hoàn tiền cho khách hàng, vui lòng tải lên hình ảnh
                  bằng chứng giao dịch hoàn tiền để hoàn tất quy trình xử lý báo
                  cáo.
                </div>
              </div>
            </div>
          </div>

          <Form.Item
            label={
              <span className="font-semibold text-gray-700">
                Hình Ảnh Bằng Chứng Hoàn Tiền{" "}
                <span className="text-red-500">*</span>
              </span>
            }
            required
          >
            <Upload
              listType="picture-card"
              fileList={refundProofFileList}
              onChange={({ fileList }) => setRefundProofFileList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
            >
              {refundProofFileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh</div>
                </div>
              )}
            </Upload>
            {refundProofFileList.length === 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Chấp nhận các định dạng: JPG, PNG, GIF
              </div>
            )}
          </Form.Item>

          <Form.Item
            name="note"
            label={
              <span className="font-semibold text-gray-700">
                Ghi Chú (Tùy chọn)
              </span>
            }
          >
            <TextArea
              rows={4}
              placeholder="Nhập ghi chú về việc hoàn tiền (nếu có)..."
              showCount
              maxLength={500}
            />
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
