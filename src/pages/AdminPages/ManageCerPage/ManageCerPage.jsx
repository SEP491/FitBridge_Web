import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Image,
  Card,
  Row,
  Col,
  message,
  Descriptions,
  Input,
  Select,
  Spin,
  ConfigProvider,
  Statistic,
  Typography,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined,
  LoadingOutlined,
  FileProtectOutlined,
  ClockCircleOutlined as ClockIcon,
} from "@ant-design/icons";
import { FaCertificate } from "react-icons/fa";
import FitBridgeModal from "../../../components/FitBridgeModal";
import certificateService from "../../../services/certificateServices";

const { TextArea } = Input;
const { Option } = Select;

export default function ManageCerPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [note, setNote] = useState("");
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Filter state
  const [filterStatus, setFilterStatus] = useState("");
  const [searchText, setSearchText] = useState("");

  // Statistics state
  const [statistics, setStatistics] = useState({
    totalCertificates: 0,
    pendingCertificates: 0,
    approvedCertificates: 0,
    rejectedCertificates: 0,
  });

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        size: pagination.pageSize,
      };

      const response = await certificateService.getCertificates(params);

      if (response.data) {
        const items = response.data.items || [];
        setCertificates(items);

        setPagination((prev) => ({
          ...prev,
          total: response.data.total || 0,
          current: response.data.page || prev.current,
        }));

        // Calculate statistics from all items
        const pending = items.filter(
          (cert) =>
            cert.certificateStatus === "WaitingForReview" ||
            cert.certificateStatus === "Pending"
        ).length;
        const approved = items.filter(
          (cert) =>
            cert.certificateStatus === "Approved" ||
            cert.certificateStatus === "Active"
        ).length;
        const rejected = items.filter(
          (cert) => cert.certificateStatus === "Rejected"
        ).length;

        setStatistics({
          totalCertificates: response.data.total || 0,
          pendingCertificates: pending,
          approvedCertificates: approved,
          rejectedCertificates: rejected,
        });
      }
    } catch (error) {
      message.error("Không thể tải danh sách chứng chỉ");
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const getStatusTag = (status) => {
    const statusConfig = {
      Pending: {
        color: "orange",
        icon: <CloseCircleOutlined />,
        label: "Chờ duyệt",
      },
      WaitingForReview: {
        color: "orange",
        icon: <CloseCircleOutlined />,
        label: "Chờ duyệt",
      },
      Approved: {
        color: "green",
        icon: <CheckCircleOutlined />,
        label: "Đã duyệt",
      },
      Active: {
        color: "green",
        icon: <CheckCircleOutlined />,
        label: "Đã duyệt",
      },
      Rejected: {
        color: "red",
        icon: <CloseCircleOutlined />,
        label: "Từ chối",
      },
      Expired: {
        color: "default",
        icon: <CloseCircleOutlined />,
        label: "Hết hạn",
      },
    };

    const config = statusConfig[status] || { color: "default", label: status };
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.label}
      </Tag>
    );
  };

  const handleViewDetails = (record) => {
    setSelectedCertificate(record);
    setDetailModalVisible(true);
  };

  const handleStatusAction = (record, action) => {
    setSelectedCertificate(record);
    setActionType(action);
    setNote("");
    setStatusModalVisible(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedCertificate) return;

    setUpdateLoading(true);
    try {
      const data = {
        certificateStatus: actionType === "approve" ? "Active" : "Rejected",
        note: note || undefined,
      };

      await certificateService.updateCertificateStatus(
        selectedCertificate.id,
        data
      );

      message.success(
        `${actionType === "approve" ? "Duyệt" : "Từ chối"} chứng chỉ thành công`
      );
      setStatusModalVisible(false);
      setNote("");
      fetchCertificates();
    } catch (error) {
      message.error(
        `Không thể ${actionType === "approve" ? "duyệt" : "từ chối"} chứng chỉ`
      );
      console.error("Error updating certificate status:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Frontend filtering
  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch = searchText
      ? (cert.ptName?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
        (cert.certificateMetadata?.certName?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        ) ||
        (cert.certificateMetadata?.certCode?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        )
      : true;

    let matchesStatus = true;
    if (filterStatus) {
      if (filterStatus === "Pending") {
        matchesStatus =
          cert.certificateStatus === "Pending" ||
          cert.certificateStatus === "WaitingForReview";
      } else if (filterStatus === "Approved") {
        matchesStatus =
          cert.certificateStatus === "Approved" ||
          cert.certificateStatus === "Active";
      } else {
        matchesStatus = cert.certificateStatus === filterStatus;
      }
    }

    return matchesSearch && matchesStatus;
  });

  const handleTableChange = (paginationConfig) => {
    setPagination({
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      total: pagination.total,
    });
  };

  const columns = [
    {
      title: "Thông tin PT",
      key: "ptInfo",
      width: 250,
      render: (_, record) => (
        <Space>
          <Image
            src={record.ptImageUrl}
            alt={record.ptName}
            width={50}
            height={50}
            style={{ borderRadius: "50%", objectFit: "cover" }}
            preview={false}
          />
          <div>
            <div style={{ fontWeight: "bold" }}>{record.ptName}</div>
            <div style={{ fontSize: "12px", color: "#888" }}>
              ID: {record.ptId.slice(0, 8)}...
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Chứng chỉ",
      key: "certificate",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>
            {record.certificateMetadata?.certName}
          </div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.certificateMetadata?.certCode}
          </div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            {record.certificateMetadata?.providerName}
          </div>
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: ["certificateMetadata", "certificateType"],
      key: "type",
      width: 120,
      render: (type) => (
        <Tag color={type === "International" ? "blue" : "purple"}>{type}</Tag>
      ),
    },
    {
      title: "Ngày cấp",
      dataIndex: "providedDate",
      key: "providedDate",
      width: 120,
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expirationDate",
      key: "expirationDate",
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "certificateStatus",
      key: "status",
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Xem
          </Button>
          {record.certificateStatus === "WaitingForReview" && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleStatusAction(record, "approve")}
              >
                Duyệt
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleStatusAction(record, "reject")}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  if (loading && certificates.length === 0) {
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#ED2A46] mb-2 flex items-center gap-2">
          <FaCertificate className="text-orange-500" />
          Quản Lý Chứng Chỉ
        </h1>
        <p className="text-gray-600">
          Quản lý và xét duyệt chứng chỉ của Personal Trainer
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[20, 20]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  Tổng Số Chứng Chỉ
                </span>
              }
              value={statistics.totalCertificates}
              prefix={<FileProtectOutlined className="text-blue-500" />}
              valueStyle={{
                color: "#1890ff",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">Chờ Duyệt</span>
              }
              value={statistics.pendingCertificates}
              prefix={<ClockIcon className="text-orange-500" />}
              valueStyle={{
                color: "#fa8c16",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">Đã Duyệt</span>
              }
              value={statistics.approvedCertificates}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{
                color: "#52c41a",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 to-red-100">
            <Statistic
              title={<span className="text-gray-600 font-medium">Từ Chối</span>}
              value={statistics.rejectedCertificates}
              prefix={<CloseCircleOutlined className="text-red-500" />}
              valueStyle={{
                color: "#ff4d4f",
                fontSize: "28px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card className="border-0 shadow-xl">
        <ConfigProvider
          theme={{ components: { Table: { headerBg: "#FFE5E9" } } }}
        >
          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Input
                placeholder="Tìm kiếm theo tên PT..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                size="large"
                className="rounded-lg shadow-sm"
                style={{ maxWidth: "300px" }}
              />
              <Select
                placeholder="Lọc theo trạng thái"
                style={{ width: "200px" }}
                size="large"
                value={filterStatus || undefined}
                onChange={(value) => setFilterStatus(value || "")}
                allowClear
                className="rounded-lg"
              >
                <Option value="Pending">Chờ duyệt</Option>
                <Option value="Approved">Đã duyệt</Option>
                <Option value="Rejected">Từ chối</Option>
                <Option value="Expired">Hết hạn</Option>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
            <Typography.Text className="text-gray-600">
              Hiển thị{" "}
              <span className="font-semibold text-orange-600">
                {filteredCertificates.length}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold">{pagination.total}</span> chứng
              chỉ
              {searchText && (
                <span className="ml-2">
                  | Tìm kiếm: "
                  <span className="font-semibold text-blue-600">
                    {searchText}
                  </span>
                  "
                </span>
              )}
              {filterStatus && (
                <span className="ml-2">
                  | Trạng thái: {getStatusTag(filterStatus)}
                </span>
              )}
            </Typography.Text>
          </div>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={filteredCertificates}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} mục`,
              position: ["bottomCenter"],
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            className="rounded-lg overflow-hidden"
            size="middle"
          />
        </ConfigProvider>
      </Card>

      {/* Detail Modal */}
      <FitBridgeModal
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        title="Chi tiết chứng chỉ"
        titleIcon={<FaCertificate className="text-orange-500" />}
        width={800}
        logoSize="medium"
        bodyStyle={{ padding: 0, maxHeight: "70vh", overflowY: "auto" }}
        footer={
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
            <Button onClick={() => setDetailModalVisible(false)}>Đóng</Button>
            {selectedCertificate?.certificateStatus === "WaitingForReview" && (
              <>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    setDetailModalVisible(false);
                    handleStatusAction(selectedCertificate, "approve");
                  }}
                  className="bg-gradient-to-r from-orange-400 to-orange-600 border-0 px-4 shadow-lg"
                >
                  Duyệt
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => {
                    setDetailModalVisible(false);
                    handleStatusAction(selectedCertificate, "reject");
                  }}
                >
                  Từ chối
                </Button>
              </>
            )}
          </div>
        }
      >
        {selectedCertificate && (
          <div className="p-6 space-y-6">
            <Row gutter={16}>
              <Col span={8}>
                <Image
                  src={selectedCertificate.ptImageUrl}
                  alt={selectedCertificate.ptName}
                  style={{ borderRadius: "8px" }}
                />
              </Col>
              <Col span={16}>
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Tên PT">
                    {selectedCertificate.ptName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    {getStatusTag(selectedCertificate.certificateStatus)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghi chú">
                    {selectedCertificate.note || "Không có"}
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>

            <h3 className="mt-6 mb-4 font-semibold text-gray-800">
              Thông tin chứng chỉ
            </h3>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Tên chứng chỉ" span={2}>
                {selectedCertificate.certificateMetadata?.certName}
              </Descriptions.Item>
              <Descriptions.Item label="Mã">
                {selectedCertificate.certificateMetadata?.certCode}
              </Descriptions.Item>
              <Descriptions.Item label="Loại">
                <Tag
                  color={
                    selectedCertificate.certificateMetadata?.certificateType ===
                    "International"
                      ? "blue"
                      : "purple"
                  }
                >
                  {selectedCertificate.certificateMetadata?.certificateType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Nhà cung cấp" span={2}>
                {selectedCertificate.certificateMetadata?.providerName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cấp">
                {selectedCertificate.providedDate}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày hết hạn">
                {selectedCertificate.expirationDate}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                {selectedCertificate.certificateMetadata?.description}
              </Descriptions.Item>
              <Descriptions.Item label="Chuyên môn" span={2}>
                {selectedCertificate.certificateMetadata?.specializations?.map(
                  (spec, index) => (
                    <Tag key={index} color="cyan">
                      {spec}
                    </Tag>
                  )
                )}
              </Descriptions.Item>
            </Descriptions>

            <h3 className="mt-6 mb-4 font-semibold text-gray-800">
              Hình ảnh chứng chỉ
            </h3>
            <Image
              src={selectedCertificate.certUrl}
              alt="Certificate"
              style={{ width: "100%" }}
            />
          </div>
        )}
      </FitBridgeModal>

      {/* Status Update Modal */}
      <FitBridgeModal
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        title={`${actionType === "approve" ? "Duyệt" : "Từ chối"} chứng chỉ`}
        titleIcon={<FaCertificate className="text-orange-500" />}
        width={600}
        logoSize="medium"
        bodyStyle={{ padding: 0, maxHeight: "60vh", overflowY: "auto" }}
        footer={
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
            <Button onClick={() => setStatusModalVisible(false)}>Hủy</Button>
            <Button
              type="primary"
              onClick={handleUpdateStatus}
              loading={updateLoading}
              danger={actionType === "reject"}
              className={
                actionType === "approve"
                  ? "bg-gradient-to-r from-orange-400 to-orange-600 border-0 px-6 shadow-lg"
                  : undefined
              }
            >
              {actionType === "approve" ? "Duyệt" : "Từ chối"}
            </Button>
          </div>
        }
      >
        <div className="p-6 space-y-4">
          <p>
            Bạn có chắc chắn muốn{" "}
            <strong>{actionType === "approve" ? "duyệt" : "từ chối"}</strong>{" "}
            chứng chỉ này không?
          </p>
          {selectedCertificate && (
            <Card size="small" className="mb-4">
              <p>
                <strong>PT:</strong> {selectedCertificate.ptName}
              </p>
              <p>
                <strong>Chứng chỉ:</strong>{" "}
                {selectedCertificate.certificateMetadata?.certName}
              </p>
            </Card>
          )}
          <TextArea
            rows={4}
            placeholder="Thêm ghi chú (tùy chọn)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </FitBridgeModal>
    </div>
  );
}
