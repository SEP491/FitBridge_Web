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
  Descriptions,
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FitBridgeModal from "../../../components/FitBridgeModal";
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
} from "@ant-design/icons";
import {
  FaGift,
  FaInfoCircle,
  FaTag,
} from "react-icons/fa";
import { couponService } from "../../../services/couponService";

export default function ManageVoucher() {
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
      startDate: values.startDate ? dayjs(values.startDate).format("YYYY-MM-DD") : null,
      expirationDate: values.expirationDate ? dayjs(values.expirationDate).format("YYYY-MM-DD") : null,
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
            <div className="font-medium text-gray-900 text-xs">
              {text}
            </div>
            <div className="text-xs text-gray-500"></div>
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
          <span className="text-xs text-gray-500">giảm</span>
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
        <div className="flex flex-col items-center">
          <NumberOutlined style={{ fontSize: "16px", color: "#722ed1" }} />
          <span className="text-sm font-medium">{quantity}</span>
          <span className="text-xs text-gray-500">coupon</span>
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
      width: 150,
      render: (_, record) => (
        <Space onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-orange-600 hover:bg-orange-50"
              onClick={() => {
                setSelectedCoupon(record);
                formEdit.setFieldsValue(record);
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
        <div className="mb-6">
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
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="% Giảm TB"
                value={statistics.averageDiscountPercent}
                suffix="%"
                prefix={<PercentageOutlined style={{ color: "#722ed1" }} />}
                valueStyle={{
                  color: "#722ed1",
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
              className="bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600 rounded-lg"
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
            theme={{ components: { Table: { headerBg: "#FFE5E9" } } }}
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
              loading={loading}
              size="middle"
              onRow={(record) => ({
                onClick: () => {
                  setSelectedCoupon(record);
                  setIsModalDetailOpen(true);
                },
                style: { cursor: "pointer" },
              })}
            />
          </ConfigProvider>
        </Card>
      </div>

      {/* Add Coupon Modal */}
      <FitBridgeModal
        open={isModalAddCouponOpen}
        onCancel={() => {
          setIsModalAddCouponOpen(false);
          formAdd.resetFields();
        }}
        title="Thêm Coupon Mới"
        titleIcon={<GiftOutlined />}
        width={600}
        logoSize="medium"
      >
        <Form
          form={formAdd}
          layout="vertical"
          requiredMark={false}
          onFinish={handleAddCoupon}
          className="max-h-[65vh] overflow-y-auto !py-5 !px-5"
        >
          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Mã Coupon</p>
            }
            name="couponCode"
            rules={[{ required: true, message: "Vui lòng nhập mã coupon" }]}
          >
            <Input placeholder="Nhập mã coupon" className="!w-full rounded-lg" />
          </Form.Item>
          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Phần trăm giảm giá (%)</p>
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
              className="!w-full rounded-lg"
              addonAfter="%"
            />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Số tiền giảm tối đa (VNĐ)</p>
            }
            name="maxDiscount"
            rules={[{ required: true, message: "Vui lòng nhập số tiền giảm tối đa" }]}
          >
            <InputNumber
              min={1000}
              placeholder="10,000"
              className="!w-full rounded-lg"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Số lượng coupon</p>
            }
            name="quantity"
            rules={[{ required: true, message: "Vui lòng nhập số lượng coupon" }]}
          >
            <InputNumber
              min={1}
              placeholder="100"
              className="!w-full rounded-lg"
              addonAfter="coupon"
            />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Ngày Bắt Đầu</p>
            }
            name="startDate"
            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
          >
            <DatePicker
              className="!w-full rounded-lg"
              format="DD/MM/YYYY"
              placeholder="Chọn ngày bắt đầu"
              disabledDate={(current) => current && current < dayjs().startOf("day")}
            />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Ngày Kết Thúc</p>
            }
            name="expirationDate"
            rules={[
              { required: true, message: "Vui lòng chọn ngày kết thúc" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startDate = getFieldValue("startDate");
                  if (!value || !startDate) {
                    return Promise.resolve();
                  }
                  if (dayjs(value).isBefore(dayjs(startDate), "day")) {
                    return Promise.reject(
                      new Error("Ngày kết thúc phải sau ngày bắt đầu")
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
            dependencies={["startDate"]}
          >
            <DatePicker
              className="!w-full rounded-lg"
              format="DD/MM/YYYY"
              placeholder="Chọn ngày kết thúc"
              disabledDate={(current) => {
                const startDate = formAdd.getFieldValue("startDate");
                if (startDate) {
                  return current && current < dayjs(startDate).startOf("day");
                }
                return current && current < dayjs().startOf("day");
              }}
            />
          </Form.Item>

          <div className="text-center pt-4">
            <Button
              onClick={() => formAdd.submit()}
              loading={loadingAdd}
              className="!w-[60%] !h-12 !rounded-full !font-medium !border-0 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #FF914D 0%, #ED2A46 100%)",
                color: "white",
              }}
            >
              Tạo Coupon
            </Button>
          </div>
        </Form>
      </FitBridgeModal>

      {/* Edit Coupon Modal */}
      <FitBridgeModal
        open={isModalEditOpen}
        onCancel={() => {
          setIsModalEditOpen(false);
          formEdit.resetFields();
          setSelectedCoupon(null);
        }}
        title="Chỉnh Sửa Coupon"
        titleIcon={<EditOutlined />}
        width={600}
        logoSize="medium"
      >
        <Form
          form={formEdit}
          layout="vertical"
          requiredMark={false}
          onFinish={handleEditCoupon}
          className="max-h-[65vh] overflow-y-auto !py-5 !px-5"
        >
          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Phần trăm giảm giá (%)</p>
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
              className="!w-full rounded-lg"
              addonAfter="%"
            />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Số tiền giảm tối đa (VNĐ)</p>
            }
            name="maxDiscount"
            rules={[{ required: true, message: "Vui lòng nhập số tiền giảm tối đa" }]}
          >
            <InputNumber
              min={1000}
              placeholder="10,000"
              className="!w-full rounded-lg"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Số lượng coupon</p>
            }
            name="quantity"
            rules={[{ required: true, message: "Vui lòng nhập số lượng coupon" }]}
          >
            <InputNumber
              min={1}
              placeholder="100"
              className="!w-full rounded-lg"
              addonAfter="coupon"
            />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Trạng thái</p>
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

          <div className="text-center pt-4">
            <Button
              onClick={() => formEdit.submit()}
              loading={loadingEdit}
              className="!w-[60%] !h-12 !rounded-full !font-medium !border-0 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                color: "white",
              }}
            >
              Cập Nhật Coupon
            </Button>
          </div>
        </Form>
      </FitBridgeModal>

      {/* Detail Modal - Enhanced UI */}
      <FitBridgeModal
        open={isModalDetailOpen}
        onCancel={() => {
          setIsModalDetailOpen(false);
          setSelectedCoupon(null);
        }}
        title="Chi Tiết Coupon"
        titleIcon={<EyeOutlined />}
        width={950}
        logoSize="medium"
        bodyStyle={{ padding: "0", maxHeight: "75vh", overflowY: "auto" }}
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={() => setIsModalDetailOpen(false)}>Đóng</Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => {
                setIsModalDetailOpen(false);
                if (selectedCoupon) {
                  formEdit.setFieldsValue(selectedCoupon);
                  setIsModalEditOpen(true);
                }
              }}
            >
              Chỉnh Sửa
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setIsModalDetailOpen(false);
                if (selectedCoupon) {
                  handleDelete(selectedCoupon.id);
                }
              }}
            >
              Xóa
            </Button>
          </div>
        }
      >
        {selectedCoupon && (
          <div className="flex flex-col">
            {/* Header Section with Key Info */}
            <div className="bg-gradient-to-r from-[#FFF9FA] to-[#FFF5F0] p-6 border-b-2 border-gray-100">
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <FaTag className="text-[#FF914D]" />
                      <span>Mã Coupon</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedCoupon.couponCode || "N/A"}
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <FaGift className="text-[#FF914D]" />
                      <span>Trạng Thái</span>
                    </div>
                    <div>
                      <Tag
                        icon={selectedCoupon.isActive ? <CheckCircleOutlined /> : <StopOutlined />}
                        color={selectedCoupon.isActive ? "success" : "error"}
                        className="px-4 py-2 text-base"
                      >
                        {selectedCoupon.isActive ? "Hoạt động" : "Không hoạt động"}
                      </Tag>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Main Content */}
            <div className="p-6 flex flex-col gap-5 space-y-6">
              {/* Coupon Info Card */}
              <Card 
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title={
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <FaInfoCircle />
                    Thông Tin Coupon
                  </span>
                }
                bordered={true}
                style={{ borderColor: "#FFE5E9" }}
              >
                <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                  <Descriptions.Item label="Mã Coupon" span={2}>
                    <div className="font-mono text-xs bg-gray-50 p-2 rounded inline-block">
                      {selectedCoupon.couponCode}
                    </div>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Phần Trăm Giảm Giá">
                    <Tag color="blue" className="text-sm px-3 py-1">
                      <PercentageOutlined className="mr-1" />
                      {selectedCoupon.discountPercent}%
                    </Tag>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Số Tiền Giảm Tối Đa">
                    <span className="text-lg font-bold text-green-600">
                      {selectedCoupon.maxDiscount?.toLocaleString("vi", {
                        style: "currency",
                        currency: "VND",
                      }) || "0 VNĐ"}
                    </span>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Số Lượng">
                    <span className="text-lg font-bold text-purple-600">
                      {selectedCoupon.quantity || 0} coupon
                    </span>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Trạng Thái">
                    <Tag
                      icon={selectedCoupon.isActive ? <CheckCircleOutlined /> : <StopOutlined />}
                      color={selectedCoupon.isActive ? "success" : "error"}
                      className="text-sm px-3 py-1"
                    >
                      {selectedCoupon.isActive ? "Hoạt động" : "Không hoạt động"}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Additional Info Card */}
              <Card 
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title={
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <FaGift />
                    Thông Tin Bổ Sung
                  </span>
                }
                bordered={true}
                style={{ borderColor: "#FFE5E9" }}
              >
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="ID Coupon">
                    <div className="font-mono text-xs bg-blue-50 p-2 rounded inline-block">
                      {selectedCoupon.id}
                    </div>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Giá Trị Giảm Tối Đa">
                    <div className="text-base font-semibold text-green-600">
                      {selectedCoupon.maxDiscount?.toLocaleString("vi", {
                        style: "currency",
                        currency: "VND",
                      }) || "0 VNĐ"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Số tiền tối đa có thể giảm khi sử dụng coupon này
                    </div>
                  </Descriptions.Item>
                  
                  <Descriptions.Item label="Số Lượng Còn Lại">
                    <div className="text-base font-semibold text-purple-600">
                      {selectedCoupon.quantity || 0} coupon
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Số lượng coupon còn có thể sử dụng
                    </div>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </div>
          </div>
        )}
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