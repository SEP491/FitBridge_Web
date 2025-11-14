import {
  Button,
  Card,
  ConfigProvider,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Spin,
  Switch,
  Table,
  Row,
  Col,
  Statistic,
  Tag,
  Avatar,
  Tooltip,
  Progress,
  DatePicker,
  Badge,
} from "antd";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FitBridgeModal from "../../../components/FitBridgeModal";
import dayjs from "dayjs";
import { IoBarbell } from "react-icons/io5";
import {
  LoadingOutlined,
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  GiftOutlined,
  DollarOutlined,
  PercentageOutlined,
  NumberOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  StopOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { couponService } from "../../../services/couponService";
import DetailVoucher from "./DetailVoucher";

export default function ManageVoucherPT() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [isModalAddCouponOpen, setIsModalAddCouponOpen] = useState(false);
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);

  const [formAdd] = Form.useForm();
  const [formEdit] = Form.useForm();

  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Statistics data
  const [statistics, setStatistics] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    inactiveCoupons: 0,
    totalQuantity: 0,
    totalMaxDiscount: 0,
    averageDiscountPercent: 0,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await couponService.getCoupons();
      const { items, total, page: currentPage, size } = response.data;
      setCoupons(items);

      // Calculate statistics
      const activeCoupons = items.filter((coupon) => coupon.isActive).length;
      const inactiveCoupons = items.filter((coupon) => !coupon.isActive).length;
      const totalQuantity = items.reduce((sum, coupon) => sum + (coupon.quantity || 0), 0);
      const totalMaxDiscount = items.reduce((sum, coupon) => sum + (coupon.maxDiscount || 0), 0);
      const averageDiscountPercent = items.length > 0 
        ? items.reduce((sum, coupon) => sum + (coupon.discountPercent || 0), 0) / items.length 
        : 0;

      setStatistics({
        totalCoupons: total,
        activeCoupons,
        inactiveCoupons,
        totalQuantity,
        totalMaxDiscount,
        averageDiscountPercent: Math.round(averageDiscountPercent * 100) / 100,
      });

      setPagination({
        current: currentPage,
        pageSize: size,
        total,
      });
    } catch (error) {
      console.error("Error fetching Coupons:", error);
      toast.error("Lỗi khi tải danh sách coupon");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleTableChange = () => {
    fetchCoupons();
  };

  if (loading) {
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

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa coupon này không?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          await couponService.deleteCoupon(id);
          fetchCoupons();
          toast.success("Xóa coupon thành công");
        } catch (error) {
          console.error("Error deleting coupon:", error);
          toast.error(
            error.response?.data?.message || "Lỗi xóa coupon thất bại"
          );
        }
      },
    });
  };

  const handleAddCoupon = async (values) => {
    setLoadingAdd(true);
    
    const requestData = {
      couponCode: values.couponCode,
      maxDiscount: values.maxDiscount,
      discountPercent: values.discountPercent,
      quantity: values.quantity,
      startDate: values.startDate ? dayjs(values.startDate).format("YYYY-MM-DD") : undefined,
      expirationDate: values.expirationDate ? dayjs(values.expirationDate).format("YYYY-MM-DD") : undefined,
    };

    try {
      await couponService.createCoupon(requestData);
      toast.success("Thêm coupon thành công");
      fetchCoupons();
      setIsModalAddCouponOpen(false);
      formAdd.resetFields();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi thêm coupon thất bại");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleEditCoupon = async (values) => {
    setLoadingEdit(true);
    
    const requestData = {
      couponId: selectedCoupon.id,
      maxDiscount: values.maxDiscount,
      discountPercent: values.discountPercent,
      quantity: values.quantity,
      isActive: values.isActive ?? true,
      startDate: values.startDate ? dayjs(values.startDate).format("YYYY-MM-DD") : undefined,
      expirationDate: values.expirationDate ? dayjs(values.expirationDate).format("YYYY-MM-DD") : undefined,
    };

    try {
      await couponService.updateCoupon(selectedCoupon.id, requestData);
      toast.success("Cập nhật coupon thành công");
      fetchCoupons();
      setIsModalEditOpen(false);
      formEdit.resetFields();
      setSelectedCoupon(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật coupon thất bại");
    } finally {
      setLoadingEdit(false);
    }
  };

  const columns = [
    {
      title: "Coupon Code",
      dataIndex: "couponCode",
      key: "couponCode",
      align: "left",
      render: (text) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            icon={<GiftOutlined />}
            style={{ backgroundColor: "#FF914D" }}
          />
          <div>
            <div className="font-medium text-gray-900">
              {text}
            </div>
            <div className="text-xs text-gray-500">Voucher</div>
          </div>
        </div>
      ),
    },
    {
      title: "Giảm Giá",
      dataIndex: "discountPercent",
      key: "discountPercent",
      align: "center",
      render: (percent) => (
        <div className="flex flex-col items-center">
          <PercentageOutlined style={{ fontSize: "16px", color: "#1890ff" }} />
          <span className="text-sm font-medium">{percent}%</span>
        </div>
      ),
    },
    {
      title: "Số Tiền Tối Đa",
      dataIndex: "maxDiscount",
      key: "maxDiscount",
      align: "center",
      render: (maxDiscount) => (
        <div className="flex flex-col items-center">
          <DollarOutlined style={{ fontSize: "16px", color: "#52c41a" }} />
          <span className="text-sm font-medium text-green-600">
            {maxDiscount?.toLocaleString("vi", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        </div>
      ),
    },
    {
      title: "Số Lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      render: (quantity) => (
        <Badge count={quantity || 0} showZero color="#722ed1" />
      ),
    },
    {
      title: "Ngày Bắt Đầu",
      dataIndex: "startDate",
      key: "startDate",
      align: "center",
      render: (date) => (
        <div className="flex flex-col items-center">
          <CalendarOutlined style={{ fontSize: "14px", color: "#1890ff" }} />
          <span className="text-xs text-gray-600">
            {date ? dayjs(date).format("DD/MM/YYYY") : "N/A"}
          </span>
        </div>
      ),
    },
    {
      title: "Ngày Hết Hạn",
      dataIndex: "expirationDate",
      key: "expirationDate",
      align: "center",
      render: (date) => (
        <div className="flex flex-col items-center">
          <CalendarOutlined style={{ fontSize: "14px", color: "#ff4d4f" }} />
          <span className="text-xs text-gray-600">
            {date ? dayjs(date).format("DD/MM/YYYY") : "N/A"}
          </span>
        </div>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      render: (isActive) => (
        <Tag
          icon={isActive ? <CheckCircleOutlined /> : <StopOutlined />}
          color={isActive ? "success" : "error"}
          className="px-3 py-1"
        >
          {isActive ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Thao Tác",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              className="text-blue-600 hover:bg-blue-50"
              onClick={() => {
                setSelectedCoupon(record);
                setIsModalDetailOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-orange-600 hover:bg-orange-50"
              onClick={() => {
                setSelectedCoupon(record);
                formEdit.setFieldsValue({
                  ...record,
                  startDate: record.startDate ? dayjs(record.startDate) : null,
                  expirationDate: record.expirationDate ? dayjs(record.expirationDate) : null,
                });
                setIsModalEditOpen(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600 hover:bg-red-50"
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const filteredData = coupons.filter((item) => {
    const matchesSearch = searchText
      ? item.id?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.discountPercent?.toString().includes(searchText) ||
        item.maxDiscount?.toString().includes(searchText)
      : true;

    return matchesSearch;
  });

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản Lý Coupon Voucher
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi các coupon giảm giá cho khách hàng
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Tổng Coupon"
                value={statistics.totalCoupons}
                prefix={<GiftOutlined style={{ color: "#FF914D" }} />}
                valueStyle={{
                  color: "#FF914D",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Đang Hoạt Động"
                value={statistics.activeCoupons}
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
                title="Không Hoạt Động"
                value={statistics.inactiveCoupons}
                prefix={<StopOutlined style={{ color: "#f5222d" }} />}
                valueStyle={{
                  color: "#f5222d",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Tổng Số Lượng"
                value={statistics.totalQuantity}
                prefix={<NumberOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{
                  color: "#1890ff",
                  fontSize: "24px",
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
                placeholder="Tìm kiếm theo ID, phần trăm giảm giá..."
                prefix={<SearchOutlined className="text-gray-400" />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 280 }}
                allowClear
                className="rounded-lg"
              />
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalAddCouponOpen(true)}
              className="bg-gradient-to-r from-orange-400 to-orange-500 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              size="large"
            >
              Thêm Coupon
            </Button>
          </div>

          {/* Results Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">
              Hiển thị{" "}
              <span className="font-semibold text-orange-600">
                {filteredData.length}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold">{statistics.totalCoupons}</span>{" "}
              coupon
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
      </div>

      {/* Add Coupon Modal */}
      <Modal
        open={isModalAddCouponOpen}
        onCancel={() => {
          setIsModalAddCouponOpen(false);
          formAdd.resetFields();
        }}
        title={
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg">
              <GiftOutlined className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                Thêm Coupon Mới
              </h2>
              <p className="text-sm text-gray-500 m-0">
                Tạo coupon giảm giá cho khách hàng
              </p>
            </div>
          </div>
        }
        footer={null}
        width={800}
        className="top-8"
      >
        <Form
          form={formAdd}
          layout="vertical"
          requiredMark={false}
          onFinish={handleAddCoupon}
          className="max-h-[70vh] overflow-y-auto py-6"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">Mã Coupon</span>
                }
                name="couponCode"
                rules={[{ required: true, message: "Vui lòng nhập mã coupon" }]}
              >
                <Input placeholder="Nhập mã coupon" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">Phần trăm giảm giá (%)</span>
                }
                name="discountPercent"
                rules={[
                  { required: true, message: "Vui lòng nhập phần trăm giảm giá" },
                  { type: "number", min: 1, max: 100, message: "Phần trăm phải từ 1-100" }
                ]}
              >
                <InputNumber
                  min={1}
                  max={100}
                  placeholder="20"
                  className="!w-full"
                  size="large"
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">Số tiền giảm tối đa (VNĐ)</span>
                }
                name="maxDiscount"
                rules={[{ required: true, message: "Vui lòng nhập số tiền giảm tối đa" }]}
              >
                <InputNumber
                  min={1000}
                  placeholder="10,000"
                  className="!w-full"
                  size="large"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">Số lượng coupon</span>
                }
                name="quantity"
                rules={[{ required: true, message: "Vui lòng nhập số lượng coupon" }]}
              >
                <InputNumber
                  min={1}
                  placeholder="100"
                  className="!w-full"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">Ngày Bắt Đầu</span>
                }
                name="startDate"
                rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
              >
                <DatePicker
                  placeholder="Chọn ngày bắt đầu"
                  className="w-full"
                  format="DD/MM/YYYY"
                  size="large"
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf('day');
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">Ngày Hết Hạn</span>
                }
                name="expirationDate"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày hết hạn" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const startDate = getFieldValue('startDate');
                      if (!value || !startDate || dayjs(value).isAfter(dayjs(startDate))) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Ngày hết hạn phải sau ngày bắt đầu'));
                    },
                  }),
                ]}
              >
                <DatePicker
                  placeholder="Chọn ngày hết hạn"
                  className="w-full"
                  format="DD/MM/YYYY"
                  size="large"
                  disabledDate={(current) => {
                    const startDate = formAdd.getFieldValue('startDate');
                    if (startDate) {
                      return current && current <= dayjs(startDate);
                    }
                    return current && current < dayjs().startOf('day');
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="text-center pt-6 border-t border-gray-200">
            <Space size="middle">
              <Button
                size="large"
                onClick={() => {
                  setIsModalAddCouponOpen(false);
                  formAdd.resetFields();
                }}
                className="px-8"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                size="large"
                loading={loadingAdd}
                onClick={() => formAdd.submit()}
                className="px-8 bg-gradient-to-r from-orange-400 to-orange-500 border-0 shadow-lg"
              >
                {loadingAdd ? "Đang xử lý..." : "Thêm Coupon"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Edit Coupon Modal */}
      <Modal
        open={isModalEditOpen}
        onCancel={() => {
          setIsModalEditOpen(false);
          formEdit.resetFields();
          setSelectedCoupon(null);
        }}
        title={
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="p-2 bg-gradient-to-r from-green-400 to-green-500 rounded-lg">
              <EditOutlined className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                Chỉnh Sửa Coupon
              </h2>
              <p className="text-sm text-gray-500 m-0">
                Cập nhật thông tin coupon
              </p>
            </div>
          </div>
        }
        footer={null}
        width={800}
        className="top-8"
      >
        <Form
          form={formEdit}
          layout="vertical"
          requiredMark={false}
          onFinish={handleEditCoupon}
          className="max-h-[70vh] overflow-y-auto py-6"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">Phần trăm giảm giá (%)</span>
                }
                name="discountPercent"
                rules={[
                  { required: true, message: "Vui lòng nhập phần trăm giảm giá" },
                  { type: "number", min: 1, max: 100, message: "Phần trăm phải từ 1-100" }
                ]}
              >
                <InputNumber
                  min={1}
                  max={100}
                  placeholder="20"
                  className="!w-full"
                  size="large"
                  addonAfter="%"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">Số tiền giảm tối đa (VNĐ)</span>
                }
                name="maxDiscount"
                rules={[{ required: true, message: "Vui lòng nhập số tiền giảm tối đa" }]}
              >
                <InputNumber
                  min={1000}
                  placeholder="10,000"
                  className="!w-full"
                  size="large"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">Số lượng coupon</span>
                }
                name="quantity"
                rules={[{ required: true, message: "Vui lòng nhập số lượng coupon" }]}
              >
                <InputNumber
                  min={1}
                  placeholder="100"
                  className="!w-full"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">Trạng thái</span>
                }
                name="isActive"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Hoạt động"
                  unCheckedChildren="Tạm dừng"
                  className="bg-gray-300"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">Ngày Bắt Đầu</span>
                }
                name="startDate"
                rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
              >
                <DatePicker
                  placeholder="Chọn ngày bắt đầu"
                  className="w-full"
                  format="DD/MM/YYYY"
                  size="large"
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf('day');
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">Ngày Hết Hạn</span>
                }
                name="expirationDate"
                rules={[
                  { required: true, message: "Vui lòng chọn ngày hết hạn" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const startDate = getFieldValue('startDate');
                      if (!value || !startDate || dayjs(value).isAfter(dayjs(startDate))) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Ngày hết hạn phải sau ngày bắt đầu'));
                    },
                  }),
                ]}
              >
                <DatePicker
                  placeholder="Chọn ngày hết hạn"
                  className="w-full"
                  format="DD/MM/YYYY"
                  size="large"
                  disabledDate={(current) => {
                    const startDate = formEdit.getFieldValue('startDate');
                    if (startDate) {
                      return current && current <= dayjs(startDate);
                    }
                    return current && current < dayjs().startOf('day');
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="text-center pt-6 border-t border-gray-200">
            <Space size="middle">
              <Button
                size="large"
                onClick={() => {
                  setIsModalEditOpen(false);
                  formEdit.resetFields();
                  setSelectedCoupon(null);
                }}
                className="px-8"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                size="large"
                loading={loadingEdit}
                onClick={() => formEdit.submit()}
                className="px-8 bg-gradient-to-r from-green-400 to-green-500 border-0 shadow-lg"
              >
                {loadingEdit ? "Đang xử lý..." : "Cập Nhật Coupon"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <FitBridgeModal
        open={isModalDetailOpen}
        onCancel={() => {
          setIsModalDetailOpen(false);
          setSelectedCoupon(null);
        }}
        title="Chi Tiết Coupon"
        titleIcon={<EyeOutlined />}
        width={700}
        logoSize="medium"
      >
        <DetailVoucher selectedCoupon={selectedCoupon} />
      </FitBridgeModal>

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