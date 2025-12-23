import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Space,
  Table,
  Row,
  Col,
  Statistic,
  Tag,
  Tooltip,
  Avatar,
  Typography,
  Upload,
  Spin,
  Empty,
  Image,
} from "antd";
import {
  LoadingOutlined,
  SearchOutlined,
  EditOutlined,
  CrownOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  FireOutlined,
  PictureOutlined,
  UploadOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { FaGem } from "react-icons/fa";
import toast from "react-hot-toast";
import hotResearchService from "../../../services/hotResearchService";
import FitBridgeModal from "../../../components/FitBridgeModal";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function ManagePremiumPage() {
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formEdit] = Form.useForm();
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [statistics, setStatistics] = useState({
    totalPlans: 0,
    averageCharge: 0,
    averageDuration: 0,
  });

  // Fetch subscription plans
  const fetchSubscriptionPlans = async () => {
    setLoading(true);
    try {
      const response = await hotResearchService.getSubscriptionPlan();
      const plans = response.data || [];

      setSubscriptionPlans(plans);

      // Calculate statistics
      const totalPlans = plans.length;
      const avgCharge =
        totalPlans > 0
          ? plans.reduce((sum, plan) => sum + (plan.planCharge || 0), 0) /
            totalPlans
          : 0;
      const avgDuration =
        totalPlans > 0
          ? plans.reduce((sum, plan) => sum + (plan.duration || 0), 0) /
            totalPlans
          : 0;

      setStatistics({
        totalPlans,
        averageCharge: Math.round(avgCharge),
        averageDuration: Math.round(avgDuration),
      });
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      toast.error("Lỗi khi lấy danh sách gói đăng ký");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  // Handle open edit modal
  const handleOpenEditModal = (record) => {
    setSelectedPlan(record);
    setImagePreview(record.imageUrl);
    setImageFile(null);
    formEdit.setFieldsValue({
      name: record.planName,
      charge: record.planCharge,
      duration: record.duration,
      description: record.description,
    });
    setIsModalEditOpen(true);
  };

  // Handle open detail modal
  const handleOpenDetailModal = (record) => {
    setSelectedPlan(record);
    setIsModalDetailOpen(true);
  };

  // Handle edit subscription plan
  const handleEditPlan = async (values) => {
    setLoadingEdit(true);

    const formData = new FormData();
    formData.append("id", selectedPlan.id);
    formData.append("name", values.name);
    formData.append("charge", values.charge);
    formData.append("duration", values.duration);
    formData.append("description", values.description || "");

    if (imageFile) {
      formData.append("imageUrl", imageFile);
    }

    try {
      await hotResearchService.editSubscriptionPlan(formData);
      toast.success("Cập nhật gói đăng ký thành công!");
      setIsModalEditOpen(false);
      formEdit.resetFields();
      setImageFile(null);
      setImagePreview(null);
      fetchSubscriptionPlans();
    } catch (error) {
      console.error("Error updating subscription plan:", error);
      toast.error(
        error.response?.data?.message || "Không thể cập nhật gói đăng ký"
      );
    } finally {
      setLoadingEdit(false);
    }
  };

  // Handle image upload
  const handleImageChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Table columns
  const columns = [
    {
      title: "Gói Đăng Ký",
      dataIndex: "planName",
      key: "planName",
      width: 250,
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.imageUrl}
            size={48}
            shape="square"
            icon={<CrownOutlined />}
            className="bg-gradient-to-r from-orange-400 to-red-500"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-800 truncate">{text}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <ThunderboltOutlined className="text-orange-500" />
              {record.featureKeyName || "N/A"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Giá",
      dataIndex: "planCharge",
      key: "planCharge",
      width: 150,
      align: "center",
      render: (charge) => (
        <Tag
          color="green"
          className="text-sm font-semibold px-3 py-1"
          icon={<DollarOutlined />}
        >
          {formatCurrency(charge)}
        </Tag>
      ),
    },
    {
      title: "Thời Hạn",
      dataIndex: "duration",
      key: "duration",
      width: 120,
      align: "center",
      render: (duration) => (
        <div className="flex items-center justify-center gap-1 text-blue-600">
          <ClockCircleOutlined />
          <span className="font-semibold">{duration} ngày</span>
        </div>
      ),
    },
    {
      title: "Mô Tả",
      dataIndex: "description",
      key: "description",
      width: 300,
      render: (description) => (
        <Tooltip title={description}>
          <div className="text-gray-600 line-clamp-2 text-sm">
            {description || "Không có mô tả"}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Tính Năng",
      dataIndex: "featureKeyName",
      key: "featureKeyName",
      width: 150,
      align: "center",
      render: (feature) => (
        <Tag
          color={feature === "HotResearch" ? "volcano" : "blue"}
          icon={feature === "HotResearch" ? <FireOutlined /> : <FaGem />}
        >
          {feature || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Hành Động",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<FileTextOutlined />}
              className="text-blue-500 hover:bg-blue-50"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDetailModal(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-orange-500 hover:bg-orange-50"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditModal(record);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Filter data
  const filteredData = searchText
    ? subscriptionPlans.filter(
        (item) =>
          (item.planName?.toLowerCase() || "").includes(
            searchText.toLowerCase()
          ) ||
          (item.description?.toLowerCase() || "").includes(
            searchText.toLowerCase()
          ) ||
          (item.featureKeyName?.toLowerCase() || "").includes(
            searchText.toLowerCase()
          )
      )
    : subscriptionPlans;

  // Upload props
  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        toast.error("Chỉ được upload file ảnh!");
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        toast.error("Ảnh phải nhỏ hơn 5MB!");
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    maxCount: 1,
    showUploadList: false,
    onChange: handleImageChange,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#ED2A46] flex items-center gap-2 mb-2">
          <CrownOutlined />
          Quản Lý Gói Đăng Ký Premium
        </h1>
        <p className="text-gray-600">
          Quản lý và cấu hình các gói đăng ký dịch vụ premium trong hệ thống
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title="Tổng Số Gói"
              value={statistics.totalPlans}
              prefix={<CrownOutlined style={{ color: "#FF914D" }} />}
              valueStyle={{
                color: "#FF914D",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title="Giá Trung Bình"
              value={formatCurrency(statistics.averageCharge)}
              prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{
                color: "#52c41a",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title="Thời Hạn Trung Bình"
              value={`${statistics.averageDuration} ngày`}
              prefix={<ClockCircleOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{
                color: "#1890ff",
                fontSize: "24px",
                fontWeight: "bold",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Table */}
      <Card className="border-0 shadow-lg">
        {/* Search Bar */}
        <div className="mb-4 flex justify-between items-center">
          <Input
            placeholder="Tìm kiếm theo tên, mô tả, tính năng..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
            allowClear
          />
          <Button
            type="default"
            icon={<LoadingOutlined spin={loading} />}
            onClick={fetchSubscriptionPlans}
            disabled={loading}
          >
            Làm mới
          </Button>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} gói`,
            pageSizeOptions: ["10", "20", "50"],
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có gói đăng ký nào"
              />
            ),
          }}
          scroll={{ x: 1000 }}
          className="custom-table"
        />
      </Card>

      {/* Edit Modal */}
      <FitBridgeModal
        open={isModalEditOpen}
        onCancel={() => {
          setIsModalEditOpen(false);
          formEdit.resetFields();
          setImageFile(null);
          setImagePreview(null);
        }}
        title="Chỉnh Sửa Gói Đăng Ký"
        titleIcon={<EditOutlined />}
        width={600}
        footer={null}
      >
        <Form
          form={formEdit}
          layout="vertical"
          onFinish={handleEditPlan}
          className="mt-4"
        >
          {/* Image Upload */}
          <Form.Item label="Hình Ảnh Gói">
            <div className="flex items-start gap-4">
              <div className="relative">
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={120}
                    height={120}
                    className="rounded-lg object-cover border-2 border-gray-200"
                    preview={false}
                  />
                ) : (
                  <div className="w-[120px] h-[120px] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <PictureOutlined className="text-3xl text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Chọn ảnh mới</Button>
                </Upload>
                <p className="text-xs text-gray-500 mt-2">
                  Định dạng: JPG, PNG. Tối đa 5MB.
                </p>
              </div>
            </div>
          </Form.Item>

          {/* Plan Name */}
          <Form.Item
            name="name"
            label="Tên Gói"
            rules={[
              { required: true, message: "Vui lòng nhập tên gói!" },
              { max: 100, message: "Tên gói không được quá 100 ký tự!" },
            ]}
          >
            <Input
              placeholder="Nhập tên gói đăng ký"
              prefix={<CrownOutlined className="text-gray-400" />}
              size="large"
            />
          </Form.Item>

          {/* Charge */}
          <Form.Item
            name="charge"
            label="Giá (VNĐ)"
            rules={[
              { required: true, message: "Vui lòng nhập giá gói!" },
              {
                type: "number",
                min: 0,
                message: "Giá phải lớn hơn hoặc bằng 0!",
              },
            ]}
          >
            <InputNumber
              placeholder="Nhập giá gói"
              className="w-full"
              size="large"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              addonAfter="VNĐ"
            />
          </Form.Item>

          {/* Duration */}
          <Form.Item
            name="duration"
            label="Thời Hạn (ngày)"
            rules={[
              { required: true, message: "Vui lòng nhập thời hạn!" },
              {
                type: "number",
                min: 1,
                message: "Thời hạn phải ít nhất 1 ngày!",
              },
            ]}
          >
            <InputNumber
              placeholder="Nhập số ngày"
              className="w-full"
              size="large"
              min={1}
              addonAfter="ngày"
            />
          </Form.Item>

          {/* Description */}
          <Form.Item
            name="description"
            label="Mô Tả"
            rules={[{ max: 500, message: "Mô tả không được quá 500 ký tự!" }]}
          >
            <TextArea
              placeholder="Nhập mô tả chi tiết về gói đăng ký..."
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>

          {/* Submit Buttons */}
          <Form.Item className="mb-0 mt-6">
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  setIsModalEditOpen(false);
                  formEdit.resetFields();
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loadingEdit}
                className="bg-gradient-to-r from-orange-400 to-red-500 border-0"
              >
                Cập Nhật
              </Button>
            </div>
          </Form.Item>
        </Form>
      </FitBridgeModal>

      {/* Detail Modal */}
      <FitBridgeModal
        open={isModalDetailOpen}
        onCancel={() => {
          setIsModalDetailOpen(false);
          setSelectedPlan(null);
        }}
        title="Chi Tiết Gói Đăng Ký"
        titleIcon={<FileTextOutlined />}
        width={600}
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={() => setIsModalDetailOpen(false)}>Đóng</Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setIsModalDetailOpen(false);
                handleOpenEditModal(selectedPlan);
              }}
              className="bg-gradient-to-r from-orange-400 to-red-500 border-0"
            >
              Chỉnh Sửa
            </Button>
          </div>
        }
      >
        {selectedPlan && (
          <div className="mt-4">
            {/* Header with Image */}
            <div className="flex items-start gap-4 mb-6">
              <Avatar
                src={selectedPlan.imageUrl}
                size={100}
                shape="square"
                icon={<CrownOutlined />}
                className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg"
              />
              <div className="flex-1">
                <Title level={4} className="mb-1">
                  {selectedPlan.planName}
                </Title>
                <Tag
                  color={
                    selectedPlan.featureKeyName === "HotResearch"
                      ? "volcano"
                      : "blue"
                  }
                  icon={
                    selectedPlan.featureKeyName === "HotResearch" ? (
                      <FireOutlined />
                    ) : (
                      <FaGem />
                    )
                  }
                  className="text-sm"
                >
                  {selectedPlan.featureKeyName || "N/A"}
                </Tag>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card size="small" className="bg-green-50 border-green-200">
                <div className="text-center">
                  <DollarOutlined className="text-2xl text-green-600 mb-2" />
                  <div className="text-sm text-gray-600">Giá</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(selectedPlan.planCharge)}
                  </div>
                </div>
              </Card>
              <Card size="small" className="bg-blue-50 border-blue-200">
                <div className="text-center">
                  <ClockCircleOutlined className="text-2xl text-blue-600 mb-2" />
                  <div className="text-sm text-gray-600">Thời Hạn</div>
                  <div className="text-lg font-bold text-blue-600">
                    {selectedPlan.duration} ngày
                  </div>
                </div>
              </Card>
            </div>

            {/* Description */}
            <div className="mb-4">
              <Text strong className="text-gray-700 block mb-2">
                Mô Tả:
              </Text>
              <Paragraph className="text-gray-600 bg-gray-50 p-3 rounded-lg mb-0">
                {selectedPlan.description || "Không có mô tả"}
              </Paragraph>
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <Text strong className="text-gray-700 block mb-3">
                Thông Tin Bổ Sung:
              </Text>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID:</span>
                  <span className="text-gray-700 font-mono text-xs">
                    {selectedPlan.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Feature Key ID:</span>
                  <span className="text-gray-700 font-mono text-xs">
                    {selectedPlan.featureKeyId || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Giới Hạn Sử Dụng:</span>
                  <span className="text-gray-700">
                    {selectedPlan.limitUsage || "Không giới hạn"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </FitBridgeModal>
    </div>
  );
}
