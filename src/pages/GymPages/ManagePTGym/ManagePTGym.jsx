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
  Table,
  Row,
  Col,
  Statistic,
  Tag,
  Avatar,
  Tooltip,
} from "antd";
import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  LoadingOutlined,
  SearchOutlined,
  UserOutlined,
  TrophyOutlined,
  PlusOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import gymService from "../../../services/gymServices";
import dayjs from "dayjs";
import { IoBarbell } from "react-icons/io5";
import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/features/userSlice";

const { Option } = Select;

export default function ManagePTGym() {
  const [pts, setPts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [isModalAddGymOpen, setIsModalAddGymOpen] = useState(false);
  const [formAdd] = Form.useForm();
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [isModalEditGymOpen, setIsModalEditGymOpen] = useState(false);
  const [formEdit] = Form.useForm();
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [editingPT, setEditingPT] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const user = useSelector(selectUser);

  // Statistics state
  const [statistics, setStatistics] = useState({
    totalPTs: 0,
    malePTs: 0,
    femalePTs: 0,
    averageExperience: 0,
  });

  const fetchPTGym = useCallback(
    async (page = 1, pageSize = 10) => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const response = await gymService.getPTofGym({
          gymId: user.id,
          page,
          size: pageSize,
        });
        const { items, total, page: currentPage } = response.data;
        setPts(items || []);

        // Update statistics based on fetched data
        const malePTs = items.filter((pt) => pt.gender === "Male").length;
        const femalePTs = items.filter((pt) => pt.gender === "Female").length;
        const totalExperience = items.reduce(
          (sum, pt) => sum + (pt.experience || 0),
          0
        );
        const averageExperience =
          items.length > 0 ? (totalExperience / items.length).toFixed(1) : 0;

        setStatistics({
          totalPTs: total,
          malePTs,
          femalePTs,
          averageExperience,
        });

        setPagination({
          current: currentPage || page,
          pageSize,
          total,
        });
      } catch (error) {
        console.error("Error fetching PTs:", error);
        toast.error("Lỗi khi tải danh sách PT");
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    fetchPTGym();
  }, [fetchPTGym]);

  const handleTableChange = (newPagination) => {
    fetchPTGym(newPagination.current, newPagination.pageSize);
  };

  const getGenderColor = (gender) => {
    switch (gender) {
      case "Male":
        return "blue";
      case "Female":
        return "pink";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    return dayjs().diff(dayjs(dob), "year");
  };

  // Map Vietnamese goal training names to English form values
  const mapVietnameseToEnglish = (vietnameseName) => {
    const mapping = {
      Ngực: "Chest",
      Lưng: "Back",
      Vai: "Shoulders",
      Tay: "Arms",
      "Cơ tay": "Arms",
      Chân: "Legs",
      "Bắp chân": "Legs",
      Bụng: "Core",
      "Cơ bụng": "Core",
      Mông: "Glutes",
      "Tim mạch": "Cardio",
      "Dẻo dai": "Flexibility",
      "Sức mạnh": "Strength",
      "Sức bền": "Endurance",
      "Giảm cân": "Weight Loss",
      "Tăng cơ": "Muscle Gain",
      "Thể thao": "Athletic Performance",
      "Phục hồi chấn thương": "Rehabilitation",
    };
    return mapping[vietnameseName.trim()] || vietnameseName.trim();
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xác nhận xóa PT",
      content:
        "Bạn có chắc chắn muốn xóa PT này không? Hành động này không thể hoàn tác.",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        const requestData = {
          userIdDeleteList: [id],
        };
        try {
          await gymService.deletePT(requestData);
          toast.success("Xóa PT thành công");
          fetchPTGym(pagination.current, pagination.pageSize);
        } catch (error) {
          console.error("Error deleting PT:", error);
          toast.error(error.response?.data?.message || "Lỗi khi xóa PT");
        }
      },
    });
  };

  const handleEdit = (record) => {
    setEditingPT(record);
    // Convert goalTraining string to array and map Vietnamese to English
    const goalTrainings = record.goalTraining
      ? record.goalTraining
          .split(",")
          .map((goal) => mapVietnameseToEnglish(goal.trim()))
          .filter((goal) => goal) // Remove any undefined mappings
      : [];

    // Convert gender to isMale boolean
    const isMale = record.gender === "Male";

    formEdit.setFieldsValue({
      fullName: record.fullName,
      dob: record.dob ? dayjs(record.dob) : null,
      isMale: isMale,
      weight: record.weight,
      height: record.height,
      experience: record.experience,
      goalTrainings: goalTrainings,
    });
    setIsModalEditGymOpen(true);
  };

  const handleUpdatePTGym = async (values) => {
    if (!editingPT?.id) return;

    setLoadingEdit(true);
    const requestData = {
      fullName: values.fullName,
      dob: dayjs(values.dob).format("YYYY-MM-DD"),
      weight: values.weight,
      height: values.height,
      goalTrainings: values.goalTrainings,
      experience: values.experience,
      isMale: values.isMale,
    };

    try {
      await gymService.updatePT(editingPT.id, requestData);
      toast.success("Cập nhật PT thành công");
      fetchPTGym(pagination.current, pagination.pageSize);
      setIsModalEditGymOpen(false);
      formEdit.resetFields();
      setEditingPT(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật PT thất bại");
    } finally {
      setLoadingEdit(false);
    }
  };

  const columns = [
    {
      title: "Personal Trainer",
      dataIndex: "fullName",
      key: "fullName",
      align: "left",
      width: 250,
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            src={record.avatarUrl}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#FF914D" }}
          />
          <div>
            <div className="font-medium text-gray-900">
              {text || "Chưa cập nhật"}
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <MailOutlined className="text-xs" />
              {record.email || "Chưa có email"}
            </div>
            {record.phone && (
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <PhoneOutlined className="text-xs" />
                {record.phone}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Ngày sinh",
      dataIndex: "dob",
      key: "dob",
      align: "center",
      width: 120,
      render: (dob) => (
        <div>
          <div>{formatDate(dob)}</div>
          {calculateAge(dob) && (
            <div className="text-xs text-gray-500">
              ({calculateAge(dob)} tuổi)
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      align: "center",
      width: 100,
      render: (gender) => (
        <Tag color={getGenderColor(gender)}>
          {gender === "Male" ? "Nam" : gender === "Female" ? "Nữ" : gender}
        </Tag>
      ),
    },
    {
      title: "Cân nặng / Chiều cao",
      key: "weightHeight",
      align: "center",
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.weight ? `${record.weight} kg` : "N/A"}</div>
          <div className="text-xs text-gray-500">
            {record.height ? `${record.height} cm` : "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Kinh nghiệm",
      dataIndex: "experience",
      key: "experience",
      align: "center",
      width: 120,
      render: (experience) => (
        <Tag icon={<TrophyOutlined />} color="orange">
          {experience ? `${experience} năm` : "N/A"}
        </Tag>
      ),
    },
    {
      title: "Chuyên môn",
      dataIndex: "goalTraining",
      key: "goalTraining",
      align: "center",
      width: 200,
      render: (goalTraining) => (
        <div className="flex flex-wrap gap-1 justify-center">
          {goalTraining ? (
            goalTraining.split(", ").map((goal, index) => (
              <Tag key={index} color="cyan">
                {goal}
              </Tag>
            ))
          ) : (
            <span className="text-gray-400">Chưa cập nhật</span>
          )}
        </div>
      ),
    },
    {
      title: "Thao Tác",
      key: "action",
      align: "center",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space>
          {/* <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              className="text-blue-600 hover:bg-blue-50"
              onClick={() => console.log("View", record)}
            />
          </Tooltip> */}
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              className="text-orange-600 hover:bg-orange-50"
              onClick={() => handleEdit(record)}
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

  const filteredData = pts.filter((item) => {
    const matchesSearch = searchText
      ? (item.fullName?.toLowerCase() || "").includes(
          searchText.toLowerCase()
        ) ||
        (item.email?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
        (item.phone?.toLowerCase() || "").includes(searchText.toLowerCase())
      : true;

    const matchesGender =
      genderFilter === "all" || item.gender === genderFilter;

    return matchesSearch && matchesGender;
  });

  const handleAddPTGym = async (values) => {
    setLoadingAdd(true);
    const requestData = {
      phone: values.phone,
      email: values.email,
      password: values.password,
      createNewPT: {
        fullName: values.fullName,
        dob: dayjs(values.dob).format("YYYY-MM-DD"),
        weight: values.weight,
        height: values.height,
        goalTrainings: values.goalTrainings,
        experience: values.experience,
        isMale: values.isMale,
      },
    };
    try {
      await gymService.registerGymPT(requestData);
      toast.success("Thêm PT thành công");
      fetchPTGym(pagination.current, pagination.pageSize);
      setIsModalAddGymOpen(false);
      formAdd.resetFields();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi thêm PT thất bại");
    } finally {
      setLoadingAdd(false);
    }
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

  return (
    <div className="">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản Lý Personal Trainer Gym
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi thông tin các huấn luyện viên tại phòng gym của
            bạn
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Tổng số PT"
                value={statistics.totalPTs}
                prefix={<UserOutlined style={{ color: "#FF914D" }} />}
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
                title="PT Nam"
                value={statistics.malePTs}
                prefix={<UserOutlined style={{ color: "#1890ff" }} />}
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
                title="PT Nữ"
                value={statistics.femalePTs}
                prefix={<UserOutlined style={{ color: "#eb2f96" }} />}
                valueStyle={{
                  color: "#eb2f96",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Kinh nghiệm TB"
                value={statistics.averageExperience}
                suffix="năm"
                prefix={<TrophyOutlined style={{ color: "#faad14" }} />}
                valueStyle={{
                  color: "#faad14",
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
                placeholder="Tìm kiếm theo tên PT..."
                prefix={<SearchOutlined className="text-gray-400" />}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 280 }}
                allowClear
                className="rounded-lg"
              />
              <Select
                value={genderFilter}
                onChange={setGenderFilter}
                style={{ width: 200 }}
                className="rounded-lg"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">Tất cả giới tính</Option>
                <Option value="Male">Nam</Option>
                <Option value="Female">Nữ</Option>
              </Select>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalAddGymOpen(true)}
              className="bg-gradient-to-r from-orange-400 to-orange-500 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              size="large"
            >
              Thêm PT Mới
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
              <span className="font-semibold">{statistics.totalPTs}</span> PT
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
              {genderFilter !== "all" && (
                <span>
                  {" "}
                  | Lọc:{" "}
                  <Tag color={getGenderColor(genderFilter)} className="ml-1">
                    {genderFilter === "Male" ? "Nam" : "Nữ"}
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
            />
          </ConfigProvider>
        </Card>
      </div>

      {/* Add PT Modal */}
      <Modal
        open={isModalAddGymOpen}
        onCancel={() => {
          setIsModalAddGymOpen(false);
          formAdd.resetFields();
        }}
        title={
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg">
              <IoBarbell className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                Thêm PT Mới
              </h2>
              <p className="text-sm text-gray-500 m-0">
                Tạo tài khoản cho huấn luyện viên mới
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
          onFinish={handleAddPTGym}
          // className="max-h-[70vh] overflow-y-auto py-6"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Số điện thoại
                  </span>
                }
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số điện thoại",
                  },
                  {
                    pattern: /^[0-9]+$/,
                    message: "Vui lòng chỉ nhập số",
                  },
                ]}
              >
                <Input
                  placeholder="09XXXXXXXX"
                  type="tel"
                  maxLength={10}
                  size="large"
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  onKeyPress={(event) => {
                    if (!/[0-9]/.test(event.key)) {
                      event.preventDefault();
                    }
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Email
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input
                  placeholder="nguyenvana123@email.com"
                  size="large"
                  prefix={<MailOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={
              <span className="text-base font-semibold text-gray-700">
                Mật khẩu
              </span>
            }
            name="password"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu cho PT!",
              },
              {
                min: 6,
                message: "Mật khẩu phải có ít nhất 6 ký tự",
              },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu" size="large" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Họ và tên
                  </span>
                }
                name="fullName"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              >
                <Input
                  placeholder="Nguyễn Văn A"
                  size="large"
                  prefix={<UserOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Ngày sinh
                  </span>
                }
                name="dob"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
              >
                <DatePicker
                  format="DD-MM-YYYY"
                  className="w-full"
                  placeholder="Chọn ngày sinh"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Cân nặng (kg)
                  </span>
                }
                name="weight"
                rules={[{ required: true, message: "Vui lòng nhập cân nặng" }]}
              >
                <InputNumber
                  min={0}
                  placeholder="70"
                  className="!w-full"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Chiều cao (cm)
                  </span>
                }
                name="height"
                rules={[{ required: true, message: "Vui lòng nhập chiều cao" }]}
              >
                <InputNumber
                  min={0}
                  placeholder="170"
                  className="!w-full"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Kinh nghiệm (năm)
                  </span>
                }
                name="experience"
                rules={[
                  { required: true, message: "Vui lòng nhập kinh nghiệm" },
                ]}
              >
                <InputNumber
                  min={0}
                  placeholder="2"
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
                  <span className="text-base font-semibold text-gray-700">
                    Giới tính
                  </span>
                }
                name="isMale"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select placeholder="Chọn giới tính" size="large">
                  <Select.Option value={true}>Nam</Select.Option>
                  <Select.Option value={false}>Nữ</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Chuyên môn tập luyện
                  </span>
                }
                name="goalTrainings"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất một chuyên môn",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn các bộ phận cơ thể chuyên môn"
                  size="large"
                  allowClear
                  maxTagCount="responsive"
                >
                  <Select.Option value="Chest">Ngực (Chest)</Select.Option>
                  <Select.Option value="Back">Lưng (Back)</Select.Option>
                  <Select.Option value="Shoulders">
                    Vai (Shoulders)
                  </Select.Option>
                  <Select.Option value="Arms">Tay (Arms)</Select.Option>
                  <Select.Option value="Legs">Chân (Legs)</Select.Option>
                  <Select.Option value="Core">Bụng (Core)</Select.Option>
                  <Select.Option value="Glutes">Mông (Glutes)</Select.Option>
                  <Select.Option value="Cardio">
                    Tim mạch (Cardio)
                  </Select.Option>
                  <Select.Option value="Flexibility">
                    Dẻo dai (Flexibility)
                  </Select.Option>
                  <Select.Option value="Strength">
                    Sức mạnh (Strength)
                  </Select.Option>
                  <Select.Option value="Endurance">
                    Sức bền (Endurance)
                  </Select.Option>
                  <Select.Option value="Weight Loss">
                    Giảm cân (Weight Loss)
                  </Select.Option>
                  <Select.Option value="Muscle Gain">
                    Tăng cơ (Muscle Gain)
                  </Select.Option>
                  <Select.Option value="Athletic Performance">
                    Thể thao (Athletic Performance)
                  </Select.Option>
                  <Select.Option value="Rehabilitation">
                    Phục hồi chấn thương (Rehabilitation)
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div className="text-center pt-6 border-t border-gray-200">
            <Space size="middle">
              <Button
                size="large"
                onClick={() => {
                  setIsModalAddGymOpen(false);
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
                {loadingAdd ? "Đang xử lý..." : "Thêm PT"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Edit PT Modal */}
      <Modal
        open={isModalEditGymOpen}
        onCancel={() => {
          setIsModalEditGymOpen(false);
          formEdit.resetFields();
          setEditingPT(null);
        }}
        title={
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg">
              <IoBarbell className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                Cập nhật PT
              </h2>
              <p className="text-sm text-gray-500 m-0">
                Cập nhật thông tin huấn luyện viên
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
          onFinish={handleUpdatePTGym}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Họ và tên
                  </span>
                }
                name="fullName"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              >
                <Input
                  placeholder="Nguyễn Văn A"
                  size="large"
                  prefix={<UserOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Ngày sinh
                  </span>
                }
                name="dob"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
              >
                <DatePicker
                  format="DD-MM-YYYY"
                  className="w-full"
                  placeholder="Chọn ngày sinh"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Cân nặng (kg)
                  </span>
                }
                name="weight"
                rules={[{ required: true, message: "Vui lòng nhập cân nặng" }]}
              >
                <InputNumber
                  min={0}
                  placeholder="70"
                  className="!w-full"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Chiều cao (cm)
                  </span>
                }
                name="height"
                rules={[{ required: true, message: "Vui lòng nhập chiều cao" }]}
              >
                <InputNumber
                  min={0}
                  placeholder="170"
                  className="!w-full"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Kinh nghiệm (năm)
                  </span>
                }
                name="experience"
                rules={[
                  { required: true, message: "Vui lòng nhập kinh nghiệm" },
                ]}
              >
                <InputNumber
                  min={0}
                  placeholder="2"
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
                  <span className="text-base font-semibold text-gray-700">
                    Giới tính
                  </span>
                }
                name="isMale"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select placeholder="Chọn giới tính" size="large">
                  <Select.Option value={true}>Nam</Select.Option>
                  <Select.Option value={false}>Nữ</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-base font-semibold text-gray-700">
                    Chuyên môn tập luyện
                  </span>
                }
                name="goalTrainings"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất một chuyên môn",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn các bộ phận cơ thể chuyên môn"
                  size="large"
                  allowClear
                  maxTagCount="responsive"
                >
                  <Select.Option value="Chest">Ngực (Chest)</Select.Option>
                  <Select.Option value="Back">Lưng (Back)</Select.Option>
                  <Select.Option value="Shoulders">
                    Vai (Shoulders)
                  </Select.Option>
                  <Select.Option value="Arms">Tay (Arms)</Select.Option>
                  <Select.Option value="Legs">Chân (Legs)</Select.Option>
                  <Select.Option value="Core">Bụng (Core)</Select.Option>
                  <Select.Option value="Glutes">Mông (Glutes)</Select.Option>
                  <Select.Option value="Cardio">
                    Tim mạch (Cardio)
                  </Select.Option>
                  <Select.Option value="Flexibility">
                    Dẻo dai (Flexibility)
                  </Select.Option>
                  <Select.Option value="Strength">
                    Sức mạnh (Strength)
                  </Select.Option>
                  <Select.Option value="Endurance">
                    Sức bền (Endurance)
                  </Select.Option>
                  <Select.Option value="Weight Loss">
                    Giảm cân (Weight Loss)
                  </Select.Option>
                  <Select.Option value="Muscle Gain">
                    Tăng cơ (Muscle Gain)
                  </Select.Option>
                  <Select.Option value="Athletic Performance">
                    Thể thao (Athletic Performance)
                  </Select.Option>
                  <Select.Option value="Rehabilitation">
                    Phục hồi chấn thương (Rehabilitation)
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div className="text-center pt-6 border-t border-gray-200">
            <Space size="middle">
              <Button
                size="large"
                onClick={() => {
                  setIsModalEditGymOpen(false);
                  formEdit.resetFields();
                  setEditingPT(null);
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
                className="px-8 bg-gradient-to-r from-orange-400 to-orange-500 border-0 shadow-lg"
              >
                {loadingEdit ? "Đang xử lý..." : "Cập nhật PT"}
              </Button>
            </Space>
          </div>
        </Form>
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
      `}</style>
    </div>
  );
}
