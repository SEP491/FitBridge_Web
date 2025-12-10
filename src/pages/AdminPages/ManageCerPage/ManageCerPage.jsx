import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Image,
  Card,
  Row,
  Col,
  Pagination,
  message,
  Descriptions,
  Input,
  Select,
  Spin,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Filter state
  const [filterStatus, setFilterStatus] = useState("");
  const [searchText, setSearchText] = useState("");

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
      };

      if (filterStatus) {
        params.status = filterStatus;
      }

      const response = await certificateService.getCertificates(params);

      if (response.data) {
        setCertificates(response.data.items || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      message.error("Không thể tải danh sách chứng chỉ");
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filterStatus]);

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

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCertificates();
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

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <h1 style={{ marginBottom: "24px" }}>Quản lý chứng chỉ</h1>

        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: "16px" }}>
          <Col span={6}>
            <Input
              placeholder="Tìm kiếm theo tên PT..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              style={{ width: "100%" }}
              value={filterStatus}
              onChange={(value) => {
                setFilterStatus(value);
                setCurrentPage(1);
              }}
              allowClear
            >
              <Option value="">Tất cả trạng thái</Option>
              <Option value="Pending">Chờ duyệt</Option>
              <Option value="WaitingForReview">Chờ duyệt</Option>
              <Option value="Approved">Đã duyệt</Option>
              <Option value="Active">Đã duyệt</Option>
              <Option value="Rejected">Từ chối</Option>
              <Option value="Expired">Hết hạn</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
            >
              Tìm kiếm
            </Button>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={certificates}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1200 }}
        />

        {/* Pagination */}
        <div style={{ marginTop: "16px", textAlign: "right" }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            showSizeChanger
            showTotal={(total) => `Tổng ${total} chứng chỉ`}
          />
        </div>
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết chứng chỉ"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
          selectedCertificate?.certificateStatus === "WaitingForReview" && (
            <>
              <Button
                key="approve"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setDetailModalVisible(false);
                  handleStatusAction(selectedCertificate, "approve");
                }}
              >
                Duyệt
              </Button>
              <Button
                key="reject"
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
          ),
        ]}
        width={800}
      >
        {selectedCertificate && (
          <div>
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

            <h3 style={{ marginTop: "24px", marginBottom: "16px" }}>
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

            <h3 style={{ marginTop: "24px", marginBottom: "16px" }}>
              Hình ảnh chứng chỉ
            </h3>
            <Image
              src={selectedCertificate.certUrl}
              alt="Certificate"
              style={{ width: "100%" }}
            />
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        title={`${actionType === "approve" ? "Duyệt" : "Từ chối"} chứng chỉ`}
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        onOk={handleUpdateStatus}
        confirmLoading={updateLoading}
        okText={actionType === "approve" ? "Duyệt" : "Từ chối"}
        cancelText="Hủy"
        okButtonProps={{
          danger: actionType === "reject",
        }}
      >
        <p>
          Bạn có chắc chắn muốn{" "}
          <strong>{actionType === "approve" ? "duyệt" : "từ chối"}</strong>{" "}
          chứng chỉ này không?
        </p>
        {selectedCertificate && (
          <Card size="small" style={{ marginBottom: "16px" }}>
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
      </Modal>
    </div>
  );
}
