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
  Table,
  Row,
  Col,
  Statistic,
  Tag,
  Avatar,
  Tooltip,
  Upload,
} from "antd";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  LoadingOutlined,
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  AppstoreOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { IoBarbell } from "react-icons/io5";
import freelanceptPackageService from "../../../services/freelancept-packageService";

export default function ManagePackageFPT() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isModalAddPackageOpen, setIsModalAddPackageOpen] = useState(false);
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);

  const [formAdd] = Form.useForm();
  const [formEdit] = Form.useForm();

  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [fileList, setFileList] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Statistics data
  const [statistics, setStatistics] = useState({
    totalPackages: 0,
    totalRevenue: 0,
    averagePrice: 0,
    totalSessions: 0,
    averageDuration: 0,
  });

  const fetchPackages = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = { page, size: pageSize };
      const response = await freelanceptPackageService.getPackages(params);
      const { items, total, page: currentPage, size } = response.data;
      setPackages(items);

      // Calculate statistics
      const totalRevenue = items.reduce((sum, pkg) => sum + (pkg.price || 0), 0);
      const averagePrice = items.length > 0 ? totalRevenue / items.length : 0;
      const totalSessions = items.reduce((sum, pkg) => sum + (pkg.numOfSessions || 0), 0);
      const averageDuration = items.length > 0 
        ? items.reduce((sum, pkg) => sum + (pkg.durationInDays || 0), 0) / items.length 
        : 0;

      setStatistics({
        totalPackages: total,
        totalRevenue,
        averagePrice: Math.round(averagePrice),
        totalSessions,
        averageDuration: Math.round(averageDuration),
      });

      setPagination({
        current: currentPage,
        pageSize: size,
        total,
      });
    } catch (error) {
      console.error("Error fetching Packages:", error);
      toast.error("Lỗi khi tải danh sách gói tập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleTableChange = (pagination) => {
    fetchPackages(pagination.current, pagination.pageSize);
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
      title: "Bạn có chắc chắn muốn xóa gói tập này không?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          await freelanceptPackageService.deletePackage(id);
          fetchPackages();
          toast.success("Xóa gói tập thành công");
        } catch (error) {
          console.error("Error deleting package:", error);
          toast.error(
            error.response?.data?.message || "Lỗi xóa gói tập thất bại"
          );
        }
      },
    });
  };

  const handleAddPackage = async (values) => {
    setLoadingAdd(true);
    
    // Get image URL from uploaded files
    let imageUrl = "https://via.placeholder.com/400x300?text=PT+Package";
    if (fileList.length > 0 && fileList[0].response) {
      imageUrl = fileList[0].response.url;
    } else if (fileList.length > 0 && fileList[0].url) {
      imageUrl = fileList[0].url;
    }

    const requestData = {
      name: values.name,
      price: values.price,
      durationInDays: values.durationInDays,
      sessionDurationInMinutes: values.sessionDurationInMinutes,
      numOfSessions: values.numOfSessions,
      description: values.description,
      imageUrl: imageUrl,
    };

    try {
      await freelanceptPackageService.createPackage(requestData);
      toast.success("Thêm gói tập thành công");
      fetchPackages();
      setIsModalAddPackageOpen(false);
      formAdd.resetFields();
      setFileList([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi thêm gói tập thất bại");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleEditPackage = async (values) => {
    setLoadingEdit(true);
    
    // Get image URL from uploaded files or keep existing
    let imageUrl = selectedPackage.imageUrl;
    if (fileList.length > 0 && fileList[0].response) {
      imageUrl = fileList[0].response.url;
    } else if (fileList.length > 0 && fileList[0].url) {
      imageUrl = fileList[0].url;
    }

    const requestData = {
      name: values.name,
      price: values.price,
      durationInDays: values.durationInDays,
      sessionDurationInMinutes: values.sessionDurationInMinutes,
      numOfSessions: values.numOfSessions,
      description: values.description,
      imageUrl: imageUrl,
    };

    try {
      await freelanceptPackageService.updatePackage(selectedPackage.id, requestData);
      toast.success("Cập nhật gói tập thành công");
      fetchPackages();
      setIsModalEditOpen(false);
      formEdit.resetFields();
      setSelectedPackage(null);
      setFileList([]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật gói tập thất bại");
    } finally {
      setLoadingEdit(false);
    }
  };

  // Upload handlers
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp';
    if (!isJpgOrPng) {
      toast.error('Chỉ có thể tải lên file JPG/PNG/WEBP!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      toast.error('Hình ảnh phải nhỏ hơn 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const columns = [
    {
      title: "Gói Tập",
      dataIndex: "name",
      key: "name",
      align: "left",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            icon={<IoBarbell />}
            style={{ backgroundColor: "#FF914D" }}
          />
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-sm text-gray-500">{record.durationInDays} ngày</div>
          </div>
        </div>
      ),
    },
    {
      title: "Giá Tiền",
      dataIndex: "price",
      key: "price",
      align: "center",
      render: (price) => (
        <div className="flex flex-col items-center">
          <DollarOutlined style={{ fontSize: "16px", color: "#52c41a" }} />
          <span className="text-sm font-medium text-green-600">
            {price?.toLocaleString("vi", {
              style: "currency",
              currency: "VND",
            })}
          </span>
        </div>
      ),
    },
    {
      title: "Thời Lượng",
      dataIndex: "durationInDays",
      key: "durationInDays",
      align: "center",
      render: (duration) => (
        <div className="flex flex-col items-center">
          <CalendarOutlined style={{ fontSize: "16px", color: "#1890ff" }} />
          <span className="text-sm font-medium">{duration}</span>
          <span className="text-xs text-gray-500">ngày</span>
        </div>
      ),
    },
    {
      title: "Số Buổi",
      dataIndex: "numOfSessions",
      key: "numOfSessions",
      align: "center",
      render: (sessions) => (
        <div className="flex flex-col items-center">
          <PlayCircleOutlined style={{ fontSize: "16px", color: "#722ed1" }} />
          <span className="text-sm font-medium">{sessions}</span>
          <span className="text-xs text-gray-500">buổi</span>
        </div>
      ),
    },
    {
      title: "Thời Gian/Buổi",
      dataIndex: "sessionDurationInMinutes",
      key: "sessionDurationInMinutes",
      align: "center",
      render: (minutes) => (
        <div className="flex flex-col items-center">
          <ClockCircleOutlined style={{ fontSize: "16px", color: "#fa8c16" }} />
          <span className="text-sm font-medium">{minutes}</span>
          <span className="text-xs text-gray-500">phút</span>
        </div>
      ),
    },
    {
      title: "Mô Tả",
      dataIndex: "description",
      key: "description",
      align: "center",
      render: (description) => (
        <Tooltip title={description}>
          <span className="text-gray-600 max-w-xs truncate block">
            {description || "Chưa có mô tả"}
          </span>
        </Tooltip>
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
                setSelectedPackage(record);
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
                setSelectedPackage(record);
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

  const filteredData = packages.filter((item) => {
    const matchesSearch = searchText
      ? item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchText.toLowerCase())
      : true;

    return matchesSearch;
  });

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản Lý Gói Tập PT Freelance
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi các gói tập luyện cá nhân
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Tổng Gói Tập"
                value={statistics.totalPackages}
                prefix={<AppstoreOutlined style={{ color: "#FF914D" }} />}
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
                title="Tổng Doanh Thu"
                value={statistics.totalRevenue}
                formatter={(value) => `${value?.toLocaleString("vi")}₫`}
                prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
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
                title="Tổng Buổi Tập"
                value={statistics.totalSessions}
                prefix={<PlayCircleOutlined style={{ color: "#1890ff" }} />}
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
                title="Giá TB"
                value={statistics.averagePrice}
                formatter={(value) => `${value?.toLocaleString("vi")}₫`}
                prefix={<DollarOutlined style={{ color: "#722ed1" }} />}
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
                placeholder="Tìm kiếm theo tên gói tập, mô tả..."
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
              onClick={() => setIsModalAddPackageOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600 rounded-lg"
            >
              Thêm Gói Tập
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
              <span className="font-semibold">{statistics.totalPackages}</span>{" "}
              gói tập
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

      {/* Add Package Modal */}
      <Modal
        open={isModalAddPackageOpen}
        onCancel={() => {
          setIsModalAddPackageOpen(false);
          formAdd.resetFields();
          setFileList([]);
        }}
        title={
          <p className="text-2xl font-bold text-[#ED2A46] flex items-center gap-2">
            <IoBarbell />
            Thêm Gói Tập Mới
          </p>
        }
        footer={null}
        width={700}
      >
        <Form
          form={formAdd}
          layout="vertical"
          requiredMark={false}
          onFinish={handleAddPackage}
          className="max-h-[65vh] overflow-y-auto !py-5 !px-5"
        >
          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Tên gói tập</p>
            }
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên gói" }]}
          >
            <Input placeholder="Tập cơ ngực" className="rounded-lg" />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Mô tả gói tập</p>
            }
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea
              placeholder="Mô tả chi tiết về gói tập..."
              autoSize={{ minRows: 3, maxRows: 5 }}
              className="rounded-lg"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <p className="text-xl font-bold text-[#ED2A46]">
                    Giá tiền (VNĐ)
                  </p>
                }
                name="price"
                rules={[{ required: true, message: "Vui lòng nhập giá tiền" }]}
              >
                <InputNumber
                  min={1000}
                  placeholder="500,000"
                  className="!w-full rounded-lg"
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
                  <p className="text-xl font-bold text-[#ED2A46]">
                    Thời lượng (Ngày)
                  </p>
                }
                name="durationInDays"
                rules={[
                  { required: true, message: "Vui lòng nhập thời lượng" },
                ]}
              >
                <InputNumber
                  min={1}
                  placeholder="90"
                  className="!w-full rounded-lg"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <p className="text-xl font-bold text-[#ED2A46]">Số buổi tập</p>
                }
                name="numOfSessions"
                rules={[{ required: true, message: "Vui lòng nhập số buổi tập" }]}
              >
                <InputNumber
                  min={1}
                  placeholder="30"
                  className="!w-full rounded-lg"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <p className="text-xl font-bold text-[#ED2A46]">
                    Thời gian/buổi (Phút)
                  </p>
                }
                name="sessionDurationInMinutes"
                rules={[
                  { required: true, message: "Vui lòng nhập thời gian buổi tập" },
                ]}
              >
                <InputNumber
                  min={15}
                  placeholder="30"
                  className="!w-full rounded-lg"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Hình ảnh gói tập</p>
            }
            name="imageUrl"
          >
            <Upload
              action="https://68cd19feda4697a7f304bc9f.mockapi.io/upload"
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={beforeUpload}
              maxCount={1}
              accept="image/*"
              className="upload-list-inline"
            >
              {fileList.length < 1 && (
                <div className="flex flex-col items-center justify-center p-2">
                  <UploadOutlined style={{ fontSize: '24px', color: '#FF914D' }} />
                  <div className="mt-2 text-sm text-gray-600">Tải lên hình ảnh</div>
                  <div className="text-xs text-gray-400">JPG, PNG, WEBP &lt; 2MB</div>
                </div>
              )}
            </Upload>
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
              Tạo Gói Tập
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Package Modal */}
      <Modal
        open={isModalEditOpen}
        onCancel={() => {
          setIsModalEditOpen(false);
          formEdit.resetFields();
          setSelectedPackage(null);
          setFileList([]);
        }}
        title={
          <p className="text-2xl font-bold text-[#ED2A46] flex items-center gap-2">
            <EditOutlined />
            Chỉnh Sửa Gói Tập
          </p>
        }
        footer={null}
        width={700}
      >
        <Form
          form={formEdit}
          layout="vertical"
          requiredMark={false}
          onFinish={handleEditPackage}
          className="max-h-[65vh] overflow-y-auto !py-5 !px-5"
        >
          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Tên gói tập</p>
            }
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên gói" }]}
          >
            <Input placeholder="Tập cơ ngực" className="rounded-lg" />
          </Form.Item>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Mô tả gói tập</p>
            }
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea
              placeholder="Mô tả chi tiết về gói tập..."
              autoSize={{ minRows: 3, maxRows: 5 }}
              className="rounded-lg"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <p className="text-xl font-bold text-[#ED2A46]">
                    Giá tiền (VNĐ)
                  </p>
                }
                name="price"
                rules={[{ required: true, message: "Vui lòng nhập giá tiền" }]}
              >
                <InputNumber
                  min={1000}
                  placeholder="500,000"
                  className="!w-full rounded-lg"
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
                  <p className="text-xl font-bold text-[#ED2A46]">
                    Thời lượng (Ngày)
                  </p>
                }
                name="durationInDays"
                rules={[
                  { required: true, message: "Vui lòng nhập thời lượng" },
                ]}
              >
                <InputNumber
                  min={1}
                  placeholder="90"
                  className="!w-full rounded-lg"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <p className="text-xl font-bold text-[#ED2A46]">Số buổi tập</p>
                }
                name="numOfSessions"
                rules={[{ required: true, message: "Vui lòng nhập số buổi tập" }]}
              >
                <InputNumber
                  min={1}
                  placeholder="30"
                  className="!w-full rounded-lg"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <p className="text-xl font-bold text-[#ED2A46]">
                    Thời gian/buổi (Phút)
                  </p>
                }
                name="sessionDurationInMinutes"
                rules={[
                  { required: true, message: "Vui lòng nhập thời gian buổi tập" },
                ]}
              >
                <InputNumber
                  min={15}
                  placeholder="30"
                  className="!w-full rounded-lg"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={
              <p className="text-xl font-bold text-[#ED2A46]">Hình ảnh gói tập</p>
            }
            name="imageUrl"
          >
            <Upload
              action="https://68cd19feda4697a7f304bc9f.mockapi.io/upload"
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={beforeUpload}
              maxCount={1}
              accept="image/*"
              className="upload-list-inline"
            >
              {fileList.length < 1 && (
                <div className="flex flex-col items-center justify-center p-2">
                  <UploadOutlined style={{ fontSize: '24px', color: '#FF914D' }} />
                  <div className="mt-2 text-sm text-gray-600">Tải lên hình ảnh</div>
                  <div className="text-xs text-gray-400">JPG, PNG, WEBP &lt; 2MB</div>
                </div>
              )}
            </Upload>
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
              Cập Nhật Gói Tập
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        open={isModalDetailOpen}
        onCancel={() => {
          setIsModalDetailOpen(false);
          setSelectedPackage(null);
        }}
        title={
          <p className="text-2xl font-bold text-[#ED2A46] flex items-center gap-2">
            <EyeOutlined />
            Chi Tiết Gói Tập: {selectedPackage?.name}
          </p>
        }
        footer={null}
        width={800}
      >
        {selectedPackage && (
          <div className="py-4">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card className="mb-4">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="Giá tiền"
                        value={selectedPackage.price}
                        formatter={(value) => `${value?.toLocaleString("vi")}₫`}
                        prefix={<DollarOutlined />}
                        valueStyle={{ color: "#52c41a" }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Thời lượng"
                        value={selectedPackage.durationInDays}
                        suffix="ngày"
                        prefix={<CalendarOutlined />}
                        valueStyle={{ color: "#1890ff" }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Số buổi tập"
                        value={selectedPackage.numOfSessions}
                        suffix="buổi"
                        prefix={<PlayCircleOutlined />}
                        valueStyle={{ color: "#722ed1" }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
              <Col span={24}>
                <Card>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Thời gian mỗi buổi"
                        value={selectedPackage.sessionDurationInMinutes}
                        suffix="phút"
                        prefix={<ClockCircleOutlined />}
                        valueStyle={{ color: "#fa8c16" }}
                      />
                    </Col>
                    <Col span={12}>
                      <div>
                        <p className="text-gray-500 mb-2">Mô tả</p>
                        <p className="text-base">{selectedPackage.description}</p>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
              {selectedPackage.imageUrl && selectedPackage.imageUrl !== "string" && (
                <Col span={24}>
                  <Card title="Hình ảnh" className="mt-4">
                    <div className="text-center">
                      <img
                        src={selectedPackage.imageUrl}
                        alt={selectedPackage.name}
                        className="max-w-full max-h-64 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  </Card>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>

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
        
        /* Upload component styling */
        :global(.upload-list-inline .ant-upload-select) {
          width: 120px !important;
          height: 120px !important;
          border: 2px dashed #FF914D !important;
          border-radius: 8px !important;
        }
        :global(.upload-list-inline .ant-upload-select:hover) {
          border-color: #ED2A46 !important;
        }
        :global(.upload-list-inline .ant-upload-list-picture-card-container) {
          width: 120px !important;
          height: 120px !important;
        }
        :global(.upload-list-inline .ant-upload-list-item) {
          border-radius: 8px !important;
        }
      `}</style>
    </div>
  );
}