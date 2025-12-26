import {
  Button,
  Card,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Row,
  Col,
  Statistic,
  Badge,
  Tag,
  Avatar,
  Tooltip,
  Progress,
  Upload,
  Descriptions,
  Image,
} from "antd";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import FitBridgeModal from "../../../components/FitBridgeModal";
import {
  LoadingOutlined,
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  TrophyOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  UserOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  FaEye,
  FaPlus,
  FaPlusCircle,
  FaInfoCircle,
  FaDumbbell,
} from "react-icons/fa";
import gymService from "../../../services/gymServices";
import uploadService from "../../../services/uploadService";
import { ImBin } from "react-icons/im";
import { MdEdit } from "react-icons/md";
import { IoBarbell } from "react-icons/io5";
import { selectUser } from "../../../redux/features/userSlice";
import { useSelector } from "react-redux";
import { IdcardOutlined } from "@ant-design/icons";
import { Typography } from "antd";

const { Option } = Select;
const { Title } = Typography;

export default function ManageGymPackages() {
  const user = useSelector(selectUser);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isModalAddCourseOpen, setIsModalAddCourseOpen] = useState(false);
  const [isModalCourseDetailOpen, setIsModalCourseDetailOpen] = useState(false);
  const [pts, setPts] = useState([]);
  const [isModalAddGymCoursePTOpen, setIsModalAddGymCoursePTOpen] =
    useState(false);
  const [isModalEditCourseOpen, setIsModalEditCourseOpen] = useState(false);

  const [formAdd] = Form.useForm();
  const [formAddGymCourse] = Form.useForm();
  const [formEdit] = Form.useForm();

  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingAddGymCoursePT, setLoadingAddGymCoursePT] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [ptsInCourse, setPtsInCourse] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Statistics data
  const [statistics, setStatistics] = useState({
    totalPackages: 0,
    withPTPackages: 0,
    normalPackages: 0,
    totalRevenue: 0,
  });

  const fetchCoursesGym = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await gymService.getCourseOfGym({
        gymId: user.id,
        page,
        size: pageSize,
      });
      const { items, total, page: currentPage } = response.data;
      setCourses(items);

      // Calculate statistics
      const withPTCount = items.filter(
        (course) => course.type === "WithPT" || course.type === "WithPt"
      ).length;
      const normalCount = items.filter(
        (course) => course.type === "Normal"
      ).length;
      const totalRevenue = items.reduce(
        (sum, course) => sum + (course.price || 0),
        0
      );

      setStatistics({
        totalPackages: total,
        withPTPackages: withPTCount,
        normalPackages: normalCount,
        totalRevenue,
      });

      setPagination({
        current: currentPage,
        pageSize,
        total,
      });
    } catch (error) {
      console.error("Error fetching Courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPTGym = async (page = 1, pageSize = 10) => {
    try {
      const response = await gymService.getPTofGym({
        page,
        size: pageSize,
        gymId: user.id,
      });
      console.log(response);
      const { items } = response.data;
      setPts(items);
    } catch (error) {
      console.error("Error fetching Pts:", error);
    }
  };

  useEffect(() => {
    fetchCoursesGym();
    fetchPTGym();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTableChange = (pagination) => {
    fetchCoursesGym(pagination.current, pagination.pageSize);
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
          await gymService.deleteCourse(id);
          fetchCoursesGym();
          toast.success("Xoá gói tập thành công");
        } catch (error) {
          console.error("Error deleting course:", error);
          toast.error(
            error.response?.data?.message || "Lỗi xóa gói tập thất bại"
          );
        }
      },
    });
  };

  const getTypeColor = (type) => {
    return type === "WithPT" || type === "WithPt" ? "success" : "blue";
  };

  const getTypeIcon = (type) => {
    return type === "WithPT" || type === "WithPt" ? (
      <UserOutlined />
    ) : (
      <TrophyOutlined />
    );
  };

  const columns = [
    {
      title: "Gói Tập",
      dataIndex: "name",
      key: "name",
      align: "left",
      width: 250,
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            icon={<IoBarbell />}
            style={{ backgroundColor: "#FF914D" }}
            src={record.image}
          />

          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-sm text-gray-500">{record.duration} ngày</div>
          </div>
        </div>
      ),
    },
    {
      title: "Loại Gói",
      dataIndex: "type",
      key: "type",
      align: "center",
      width: 120,
      render: (type) => (
        <Tag
          icon={getTypeIcon(type)}
          color={getTypeColor(type)}
          className="px-3 py-1"
        >
          {type === "WithPT" || type === "WithPt" ? "Có PT" : "Bình thường"}
        </Tag>
      ),
    },
    {
      title: "Thời Lượng",
      dataIndex: "duration",
      key: "duration",
      align: "center",
      width: 120,
      sorter: (a, b) => (a.duration || 0) - (b.duration || 0),
      render: (duration) => (
        <div className="flex flex-col items-center">
          <ClockCircleOutlined style={{ fontSize: "16px", color: "#1890ff" }} />
          <span className="text-sm font-bold text-orange-600">{duration}</span>
          <span className="text-xs text-gray-500">ngày</span>
        </div>
      ),
    },
    {
      title: "Giá Tiền",
      dataIndex: "price",
      key: "price",
      align: "center",
      width: 150,
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
      render: (price) => (
        <div className="flex flex-col items-center">
          <DollarOutlined style={{ fontSize: "16px", color: "#52c41a" }} />
          <span className="text-sm font-bold text-green-600">
            {price?.toLocaleString("vi-VN")}₫
          </span>
        </div>
      ),
    },
  ];

  const fetchPTInCourse = async (id) => {
    try {
      const response = await gymService.getPTOfCourse(id);
      setPtsInCourse(response.data.items);
    } catch (error) {
      console.error("Error fetching Gym Course Detail:", error);
    }
  };

  const filteredData = courses.filter((item) => {
    const matchesSearch = searchText
      ? (item.name?.toLowerCase() || "").includes(searchText.toLowerCase())
      : true;

    const matchesType =
      typeFilter === "all" ||
      item.type === typeFilter ||
      (typeFilter === "WithPt" &&
        (item.type === "WithPT" || item.type === "WithPt"));

    return matchesSearch && matchesType;
  });

  // Upload handlers - same pattern as ManageWithdrawalPage
  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const response = await uploadService.uploadFile(file);
      // The API returns the URL directly in response.data as a string
      const imageUrl = response.data;
      setUploadedImageUrl(imageUrl);
      setUploadedImage(file);
      // Update form with image URL
      formAdd.setFieldsValue({ imageUrl });
      toast.success("Tải lên hình ảnh thành công!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Không thể tải lên hình ảnh");
    } finally {
      setUploadingImage(false);
    }
    return false; // Prevent default upload behavior
  };

  const handleAddCourseGym = async (values) => {
    setLoadingAdd(true);

    const requestData = {
      name: values.name,
      price: values.price,
      duration: values.duration,
      type: values.type,
      description: values.description,
      imageUrl: uploadedImageUrl, // Include imageUrl if uploaded
      ptPrice: values.ptPrice,
    };

    try {
      await gymService.addCourse(requestData);
      toast.success("Thêm gói tập thành công");
      fetchCoursesGym();
      setIsModalAddCourseOpen(false);
      formAdd.resetFields();
      setUploadedImage(null);
      setUploadedImageUrl("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi thêm gói tập thất bại");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleAddGymCoursePT = async (values) => {
    setLoadingAddGymCoursePT(true);
    const requestData = {
      ptid: values.ptid,
      gymCourseId: selectedCourse.id,
      session: values.session,
    };

    try {
      await gymService.addPTToCourse(requestData);
      toast.success("Thêm PT vào gói tập thành công");
      setIsModalAddGymCoursePTOpen(false);
      formAddGymCourse.resetFields();
      // Refresh the PTs in course list to update the filter
      if (selectedCourse?.id) {
        await fetchPTInCourse(selectedCourse.id);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Lỗi thêm PT vào gói tập thất bại"
      );
    } finally {
      setLoadingAddGymCoursePT(false);
    }
  };

  const handleEdit = (record) => {
    setEditingCourse(record);
    formEdit.setFieldsValue({
      name: record.name,
      price: record.price,
      duration: record.duration,
      description: record.description,
      imageUrl: record.image || record.imageUrl,
      type: record.type,
      ptPrice: record.ptPrice || 0,
    });
    setIsModalEditCourseOpen(true);
  };

  const handleUpdateCourse = async (values) => {
    if (!editingCourse?.id) return;

    setLoadingEdit(true);
    const requestData = {
      name: values.name,
      price: values.price,
      duration: values.duration,
      description: values.description,
      imageUrl: values.imageUrl || editingCourse.imageUrl,
      type: values.type,
      ptPrice: values.ptPrice || 0,
    };

    try {
      await gymService.updateCourse(editingCourse.id, requestData);
      toast.success("Cập nhật gói tập thành công");
      fetchCoursesGym(pagination.current, pagination.pageSize);
      setIsModalEditCourseOpen(false);
      formEdit.resetFields();
      setEditingCourse(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Lỗi cập nhật gói tập thất bại"
      );
    } finally {
      setLoadingEdit(false);
    }
  };

  const ptInCourseColumns = [
    {
      title: "PT",
      dataIndex: "fullName",
      key: "fullName",
      align: "left",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#FF914D" }}
            src={record.avatarUrl}
          />
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      key: "dob",
      align: "center",
      render: (dob) => new Date(dob).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thông tin cơ thể",
      key: "bodyInfo",
      align: "center",
      render: (_, record) => (
        <div className="text-center">
          <div className="text-sm">
            <span className="font-medium">{record.height}cm</span>
            <span className="font-medium"> {record.weight}kg</span>
          </div>
        </div>
      ),
    },
    {
      title: "Mục tiêu",
      dataIndex: "goalTraining",
      key: "goalTraining",
      align: "center",
      render: (goal) => (
        <div className="flex flex-wrap gap-1 justify-center">
          {goal ? (
            goal
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item)
              .map((item, index) => (
                <Tag key={index} color="blue">
                  {item}
                </Tag>
              ))
          ) : (
            <span className="text-gray-400">Chưa cập nhật</span>
          )}
        </div>
      ),
    },
    {
      title: "Kinh nghiệm",
      dataIndex: "experience",
      key: "experience",
      align: "center",
      render: (exp) => (
        <div className="text-center">
          <span className="font-medium">{exp}</span>
          <div className="text-xs text-gray-500">năm</div>
        </div>
      ),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      align: "center",
      render: (gender) => (
        <Tag color={gender === "Male" ? "blue" : "pink"}>
          {gender === "Male" ? "Nam" : "Nữ"}
        </Tag>
      ),
    },
  ];

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title
            level={2}
            style={{
              margin: 0,
              color: "#ed2a46",
              display: "flex",
              alignItems: "center",
            }}
          >
            <IoBarbell style={{ marginRight: 12, color: "#ed2a46" }} />
            Quản Lý Gói Tập Gym
          </Title>
          <p style={{ color: "#6b7280", marginTop: 8, marginBottom: 0 }}>
            Quản lý và theo dõi các gói tập luyện tại phòng gym
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={8}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Tổng Gói Tập"
                value={statistics.totalPackages}
                prefix={<TrophyOutlined style={{ color: "#FF914D" }} />}
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
                title="Gói Có PT"
                value={statistics.withPTPackages}
                prefix={<UserOutlined style={{ color: "#52c41a" }} />}
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
                title="Gói Bình Thường"
                value={statistics.normalPackages}
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

        {/* Main Content Card */}
        <Card className="border-0 shadow-lg">
          {/* Filters and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Tìm kiếm theo tên gói tập..."
                prefix={<SearchOutlined className="text-gray-400" />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 280 }}
                allowClear
                className="rounded-lg"
              />
              <Select
                value={typeFilter}
                onChange={setTypeFilter}
                style={{ width: 200 }}
                className="rounded-lg"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Tất cả loại gói</Option>
                <Option value="WithPt">Có PT</Option>
                <Option value="Normal">Bình thường</Option>
              </Select>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                if (user?.isContractSigned === "False") {
                  toast.error("Hợp đồng chưa ký, không thể thêm Gói Tập.");
                  return;
                }
                setIsModalAddCourseOpen(true);
              }}
              className="bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600 rounded-lg"
              disabled={user?.isContractSigned === "False"}
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
              {typeFilter !== "all" && (
                <span>
                  {" "}
                  | Lọc:{" "}
                  <Tag color={getTypeColor(typeFilter)} className="ml-1">
                    {typeFilter === "WithPt" ? "Có PT" : "Bình thường"}
                  </Tag>
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
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                position: ["bottomCenter"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} gói tập`,
              }}
              onChange={handleTableChange}
              className="rounded-lg overflow-hidden"
              scroll={{ x: 900 }}
              size="middle"
              rowKey="id"
              onRow={(record) => ({
                onClick: () => {
                  setSelectedCourse(record);
                  setIsModalCourseDetailOpen(true);
                  // Only fetch PTs if it's a WithPT package
                  if (record.type === "WithPT" || record.type === "WithPt") {
                    fetchPTInCourse(record.id);
                  }
                },
                style: { cursor: "pointer" },
              })}
            />
          </ConfigProvider>
        </Card>
      </div>

      {/* Add Course Modal */}
      <FitBridgeModal
        open={isModalAddCourseOpen}
        onCancel={() => {
          setIsModalAddCourseOpen(false);
          formAdd.resetFields();
          setUploadedImage(null);
          setUploadedImageUrl("");
        }}
        title="Thêm Gói Tập Mới"
        titleIcon={<IoBarbell />}
        footer={null}
        width={700}
        logoSize="medium"
        bodyStyle={{ padding: 0 }}
      >
        <Form
          form={formAdd}
          layout="vertical"
          requiredMark={false}
          onFinish={handleAddCourseGym}
          style={{ padding: 24, paddingTop: 16 }}
        >
          <Form.Item
            label={
              <span className="text-[#ED2A46] font-bold">Tên gói tập</span>
            }
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên gói" }]}
          >
            <Input placeholder="Gói 1 tháng" className="rounded-lg" />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-[#ED2A46] font-bold">Mô tả gói tập</span>
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
                  <span className="text-[#ED2A46] font-bold">
                    Giá tiền (VNĐ)
                  </span>
                }
                name="price"
                rules={[{ required: true, message: "Vui lòng nhập giá tiền" }]}
              >
                <InputNumber
                  min={1000}
                  placeholder="100,000"
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
                  <span className="text-[#ED2A46] font-bold">
                    Thời lượng (Ngày)
                  </span>
                }
                name="duration"
                rules={[
                  { required: true, message: "Vui lòng nhập thời lượng" },
                ]}
              >
                <InputNumber
                  min={1}
                  placeholder="30"
                  className="!w-full rounded-lg"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={
              <span className="text-[#ED2A46] font-bold">Loại gói tập</span>
            }
            name="type"
            rules={[{ required: true, message: "Vui lòng chọn loại gói tập" }]}
          >
            <Select placeholder="Chọn loại gói tập" className="rounded-lg">
              <Select.Option value="WithPt">
                <div className="flex items-center gap-2">
                  <UserOutlined />
                  Có Personal Trainer
                </div>
              </Select.Option>
              <Select.Option value="Normal">
                <div className="flex items-center gap-2">
                  <TrophyOutlined />
                  Gói tập bình thường
                </div>
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) => {
              const type = getFieldValue("type");
              return type === "WithPt" || type === "WithPT" ? (
                <Form.Item
                  label={
                    <span className="text-[#ED2A46] font-bold">
                      Giá PT (VNĐ)
                    </span>
                  }
                  name="ptPrice"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập giá PT",
                    },
                  ]}
                >
                  <InputNumber
                    min={1000}
                    placeholder="50,000"
                    className="!w-full rounded-lg"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>

          <Form.Item
            label={
              <span className="text-[#ED2A46] font-bold">Hình ảnh gói tập</span>
            }
            name="imageUrl"
          >
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
                setUploadedImageUrl("");
                setUploadedImage(null);
                formAdd.setFieldsValue({ imageUrl: undefined });
              }}
              fileList={
                uploadedImage
                  ? [
                      {
                        uid: "-1",
                        name: uploadedImage.name,
                        status: "done",
                        url: uploadedImageUrl,
                      },
                    ]
                  : []
              }
              accept="image/*"
              className="upload-list-inline"
            >
              {!uploadedImage && (
                <div className="flex flex-col items-center justify-center p-2">
                  <UploadOutlined
                    style={{ fontSize: "24px", color: "#FF914D" }}
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    {uploadingImage ? "Đang tải..." : "Tải lên hình ảnh"}
                  </div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px solid #f0f0f0",
              textAlign: "right",
            }}
          >
            <Space>
              <Button
                onClick={() => {
                  setIsModalAddCourseOpen(false);
                  formAdd.resetFields();
                  setUploadedImage(null);
                  setUploadedImageUrl("");
                }}
                size="large"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loadingAdd}
                size="large"
                style={{
                  borderRadius: 8,
                  background:
                    "linear-gradient(135deg, #FF914D 0%, #e8822d 100%)",
                  border: "none",
                }}
              >
                Tạo Gói Tập
              </Button>
            </Space>
          </div>
        </Form>
      </FitBridgeModal>

      {/* Add PT to Course Modal */}
      <FitBridgeModal
        open={isModalAddGymCoursePTOpen}
        onCancel={() => {
          setIsModalAddGymCoursePTOpen(false);
          formAddGymCourse.resetFields();
        }}
        title={`Thêm PT vào Gói Tập: ${selectedCourse?.name || ""}`}
        titleIcon={<UserAddOutlined />}
        footer={null}
        width={600}
        logoSize="medium"
        bodyStyle={{ padding: 0 }}
      >
        <Form
          form={formAddGymCourse}
          layout="vertical"
          requiredMark={false}
          onFinish={handleAddGymCoursePT}
          style={{ padding: 24, paddingTop: 16 }}
        >
          <Form.Item
            label={
              <span className="text-[#ED2A46] font-bold">Số buổi tập</span>
            }
            name="session"
            rules={[{ required: true, message: "Vui lòng nhập số buổi tập" }]}
          >
            <InputNumber
              min={1}
              placeholder="8"
              className="!w-full rounded-lg"
              addonAfter="buổi"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-[#ED2A46] font-bold">
                Chọn Personal Trainer
              </span>
            }
            name="ptid"
            rules={[{ required: true, message: "Vui lòng chọn PT" }]}
          >
            <Select
              placeholder="Chọn PT phù hợp"
              className="rounded-lg"
              notFoundContent={
                pts.filter((pt) => {
                  const assignedPTIds = ptsInCourse.map(
                    (assignedPT) => assignedPT.id
                  );
                  return !assignedPTIds.includes(pt.id);
                }).length === 0 ? (
                  <div className="text-center py-2 text-gray-500">
                    Tất cả PT đã được gán cho gói tập này
                  </div>
                ) : (
                  <div className="text-center py-2 text-gray-500">
                    Không tìm thấy PT
                  </div>
                )
              }
            >
              {pts
                .filter((pt) => {
                  const assignedPTIds = ptsInCourse.map(
                    (assignedPT) => assignedPT.id
                  );
                  return !assignedPTIds.includes(pt.id);
                })
                .map((pt) => (
                  <Select.Option key={pt.id} value={pt.id}>
                    <div className="flex items-center gap-2">
                      <Avatar size="small" icon={<UserOutlined />} />
                      {pt.fullName}
                    </div>
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px solid #f0f0f0",
              textAlign: "right",
            }}
          >
            <Space>
              <Button
                onClick={() => {
                  setIsModalAddGymCoursePTOpen(false);
                  formAddGymCourse.resetFields();
                }}
                size="large"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loadingAddGymCoursePT}
                size="large"
                style={{
                  borderRadius: 8,
                  background:
                    "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                  border: "none",
                }}
              >
                Thêm PT vào Gói
              </Button>
            </Space>
          </div>
        </Form>
      </FitBridgeModal>

      {/* Course Detail Modal - Enhanced UI */}
      <FitBridgeModal
        open={isModalCourseDetailOpen}
        onCancel={() => setIsModalCourseDetailOpen(false)}
        title="Chi Tiết Gói Tập"
        titleIcon={<EyeOutlined />}
        width={900}
        logoSize="medium"
        bodyStyle={{ padding: "0", maxHeight: "75vh", overflowY: "auto" }}
      >
        {selectedCourse && (
          <div className="flex flex-col">
            <div className="bg-gradient-to-r from-[#FFF9FA] to-[#FFF5F0] p-6 border-b-2 border-gray-100">
              <div className="flex items-center gap-6">
                {selectedCourse.image || selectedCourse.imageUrl ? (
                  <img
                    src={selectedCourse.image || selectedCourse.imageUrl}
                    alt={selectedCourse.name}
                    className="w-24 h-24 rounded-lg object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center border-4 border-white shadow-lg">
                    <IoBarbell className="text-white text-4xl" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-[#ED2A46] mb-2">
                    {selectedCourse.name || "N/A"}
                  </h2>
                  <div className="flex items-center gap-4 flex-wrap">
                    <Tag
                      icon={getTypeIcon(selectedCourse.type)}
                      color={getTypeColor(selectedCourse.type)}
                      className="text-sm px-3 py-1"
                    >
                      {selectedCourse.type === "WithPT" ||
                      selectedCourse.type === "WithPt"
                        ? "Có PT"
                        : "Bình thường"}
                    </Tag>
                    <Tag color="orange" className="text-sm px-3 py-1">
                      <ClockCircleOutlined /> {selectedCourse.duration} ngày
                    </Tag>
                    <Tag color="green" className="text-sm px-3 py-1">
                      <DollarOutlined />{" "}
                      {selectedCourse.price?.toLocaleString("vi-VN")}₫
                    </Tag>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6 flex-col gap-5 flex space-y-6">
              {/* Package Info Card */}
              <Card
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title={
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <FaDumbbell />
                    Thông Tin Gói Tập
                  </span>
                }
                bordered={true}
                style={{ borderColor: "#FFE5E9" }}
              >
                <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                  <Descriptions.Item
                    label={
                      <span>
                        <IdcardOutlined /> ID
                      </span>
                    }
                    span={2}
                  >
                    <div className="font-mono text-xs bg-gray-50 p-2 rounded inline-block">
                      {selectedCourse.id}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <span>
                        <IoBarbell className="inline mr-1" /> Tên Gói Tập
                      </span>
                    }
                  >
                    <div className="font-semibold p-2 text-gray-800">
                      {selectedCourse.name || "N/A"}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <span>
                        <ClockCircleOutlined /> Thời Lượng
                      </span>
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-orange-600">
                        {selectedCourse.duration || 0}
                      </span>
                      <span className="text-gray-600">ngày</span>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <span>
                        <DollarOutlined /> Giá Tiền
                      </span>
                    }
                  >
                    <span className="text-xl font-bold text-green-600">
                      {selectedCourse.price?.toLocaleString("vi-VN")}₫
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <span>
                        <TrophyOutlined /> Loại Gói
                      </span>
                    }
                  >
                    <Tag
                      icon={getTypeIcon(selectedCourse.type)}
                      color={getTypeColor(selectedCourse.type)}
                      className="px-3 py-1"
                    >
                      {selectedCourse.type === "WithPT" ||
                      selectedCourse.type === "WithPt"
                        ? "Có PT"
                        : "Bình thường"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mô Tả" span={2}>
                    <div className="text-gray-700 bg-gray-50 p-3 rounded">
                      {selectedCourse.description || "Chưa có mô tả"}
                    </div>
                  </Descriptions.Item>
                  {(selectedCourse.image || selectedCourse.imageUrl) && (
                    <Descriptions.Item label="Hình Ảnh" span={2}>
                      <Image
                        src={selectedCourse.image || selectedCourse.imageUrl}
                        alt={selectedCourse.name}
                        className="rounded-lg"
                        width={200}
                      />
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              {/* PT List Card (only for WithPT packages) */}
              {(selectedCourse.type === "WithPT" ||
                selectedCourse.type === "WithPt") && (
                <Card
                  size="small"
                  className="shadow-sm hover:shadow-md transition-shadow"
                  title={
                    <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                      <TeamOutlined />
                      Danh Sách Personal Trainers ({ptsInCourse.length})
                    </span>
                  }
                  bordered={true}
                  style={{ borderColor: "#FFE5E9" }}
                >
                  {ptsInCourse.length > 0 ? (
                    <Table
                      dataSource={ptsInCourse}
                      columns={ptInCourseColumns}
                      pagination={false}
                      size="small"
                      className="rounded-lg overflow-hidden"
                    />
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      Chưa có PT nào được gán cho gói tập này
                    </div>
                  )}
                </Card>
              )}

              {/* Additional Info Card */}
              <Card
                size="small"
                className="shadow-sm hover:shadow-md transition-shadow"
                title={
                  <span className="flex items-center gap-2 text-base font-semibold text-[#ED2A46]">
                    <FaInfoCircle />
                    Thông Tin Bổ Sung
                  </span>
                }
                bordered={true}
                style={{ borderColor: "#FFE5E9" }}
              >
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-3xl font-bold text-[#FF914D] mb-2">
                          {selectedCourse.duration || 0}
                        </div>
                        <div className="text-sm text-gray-600">Ngày</div>
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {selectedCourse.price?.toLocaleString("vi-VN")}₫
                        </div>
                        <div className="text-sm text-gray-600">Giá Gói</div>
                      </div>
                    </Col>
                    {(selectedCourse.type === "WithPT" ||
                      selectedCourse.type === "WithPt") && (
                      <Col xs={24} sm={8}>
                        <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {ptsInCourse.length}
                          </div>
                          <div className="text-sm text-gray-600">Số PT</div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                {(selectedCourse.type === "WithPT" ||
                  selectedCourse.type === "WithPt") && (
                  <Button
                    icon={<UserAddOutlined />}
                    onClick={() => {
                      setIsModalCourseDetailOpen(false);
                      setIsModalAddGymCoursePTOpen(true);
                      // Fetch PTs already in this course to filter them out
                      fetchPTInCourse(selectedCourse.id);
                      formAddGymCourse.resetFields();
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white border-0"
                  >
                    Thêm PT
                  </Button>
                )}
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setIsModalCourseDetailOpen(false);
                    handleEdit(selectedCourse);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white border-0"
                >
                  Chỉnh Sửa
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => {
                    setIsModalCourseDetailOpen(false);
                    handleDelete(selectedCourse.id);
                  }}
                >
                  Xóa Gói Tập
                </Button>
              </div>
            </div>
          </div>
        )}
      </FitBridgeModal>

      {/* Edit Course Modal */}
      <FitBridgeModal
        open={isModalEditCourseOpen}
        onCancel={() => {
          setIsModalEditCourseOpen(false);
          formEdit.resetFields();
          setEditingCourse(null);
        }}
        title="Cập nhật Gói Tập"
        titleIcon={<IoBarbell />}
        footer={null}
        width={700}
        logoSize="medium"
        bodyStyle={{ padding: 0 }}
      >
        <Form
          form={formEdit}
          layout="vertical"
          requiredMark={false}
          onFinish={handleUpdateCourse}
          style={{ padding: 24, paddingTop: 16 }}
        >
          <Form.Item
            label={
              <span className="text-[#ED2A46] font-bold">Tên gói tập</span>
            }
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên gói" }]}
          >
            <Input placeholder="Gói 1 tháng" className="rounded-lg" />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-[#ED2A46] font-bold">Mô tả gói tập</span>
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
                  <span className="text-[#ED2A46] font-bold">
                    Giá tiền (VNĐ)
                  </span>
                }
                name="price"
                rules={[{ required: true, message: "Vui lòng nhập giá tiền" }]}
              >
                <InputNumber
                  min={1000}
                  placeholder="100,000"
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
                  <span className="text-[#ED2A46] font-bold">
                    Thời lượng (Ngày)
                  </span>
                }
                name="duration"
                rules={[
                  { required: true, message: "Vui lòng nhập thời lượng" },
                ]}
              >
                <InputNumber
                  min={1}
                  placeholder="30"
                  className="!w-full rounded-lg"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={
              <span className="text-[#ED2A46] font-bold">Loại gói tập</span>
            }
            name="type"
            rules={[{ required: true, message: "Vui lòng chọn loại gói tập" }]}
          >
            <Select placeholder="Chọn loại gói tập" className="rounded-lg">
              <Select.Option value="WithPt">
                <div className="flex items-center gap-2">
                  <UserOutlined />
                  Có Personal Trainer
                </div>
              </Select.Option>
              <Select.Option value="Normal">
                <div className="flex items-center gap-2">
                  <TrophyOutlined />
                  Gói tập bình thường
                </div>
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.type !== currentValues.type
            }
          >
            {({ getFieldValue }) => {
              const type = getFieldValue("type");
              return type === "WithPt" || type === "WithPT" ? (
                <Form.Item
                  label={
                    <span className="text-[#ED2A46] font-bold">
                      Giá PT (VNĐ)
                    </span>
                  }
                  name="ptPrice"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập giá PT",
                    },
                  ]}
                >
                  <InputNumber
                    min={1000}
                    placeholder="50,000"
                    className="!w-full rounded-lg"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>

          <div
            style={{
              marginTop: 24,
              paddingTop: 16,
              borderTop: "1px solid #f0f0f0",
              textAlign: "right",
            }}
          >
            <Space>
              <Button
                onClick={() => {
                  setIsModalEditCourseOpen(false);
                  formEdit.resetFields();
                  setEditingCourse(null);
                }}
                size="large"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loadingEdit}
                size="large"
                style={{
                  borderRadius: 8,
                  background:
                    "linear-gradient(135deg, #FF914D 0%, #e8822d 100%)",
                  border: "none",
                }}
              >
                Cập nhật Gói Tập
              </Button>
            </Space>
          </div>
        </Form>
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

        /* Upload component styling */
        :global(.upload-list-inline .ant-upload-select) {
          width: 120px !important;
          height: 120px !important;
          border: 2px dashed #ff914d !important;
          border-radius: 8px !important;
        }
        :global(.upload-list-inline .ant-upload-select:hover) {
          border-color: #ed2a46 !important;
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
