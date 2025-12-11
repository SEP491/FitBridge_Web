import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Modal,
  Form,
  InputNumber,
  Select,
  Tag,
  Card,
  Row,
  Col,
  Image,
  Upload,
  Tooltip,
  Popconfirm,
  Badge,
  Statistic,
  Typography,
  ConfigProvider,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CameraOutlined,
  InboxOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  ToolOutlined,
  ShopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import assetsService from "../../../services/assetsServices";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/features/userSlice";

const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;

export default function ManageAssetsPage() {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [metadata, setMetadata] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    assetType: null,
    equipmentCategory: null,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [uploading, setUploading] = useState(false);
  const user = useSelector(selectUser);

  // Statistics state
  const [statistics, setStatistics] = useState({
    totalAssets: 0,
    equipmentCount: 0,
    facilityCount: 0,
    totalQuantity: 0,
  });

  // Fetch assets
  const fetchAssets = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params = {
        gymOwnerId: user?.id,
        page,
        size: pageSize,
        ...(filters.search && { search: filters.search }),
        ...(filters.assetType && { assetType: filters.assetType }),
        ...(filters.equipmentCategory && {
          equipmentCategory: filters.equipmentCategory,
        }),
      };

      const response = await assetsService.getGymAssets(params);
      if (response.status === "200") {
        const items = response.data.items || [];
        setAssets(items);
        setPagination({
          current: response.data.page,
          pageSize: response.data.size,
          total: response.data.total,
        });

        // Calculate statistics
        const equipmentCount = items.filter(
          (a) => a.assetType === "Equipment"
        ).length;
        const facilityCount = items.filter(
          (a) => a.assetType === "Facility"
        ).length;
        const totalQuantity = items.reduce((sum, a) => sum + (a.quantity || 0), 0);

        setStatistics({
          totalAssets: response.data.total || items.length,
          equipmentCount,
          facilityCount,
          totalQuantity,
        });
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Không thể tải danh sách cơ sở vật chất");
    } finally {
      setLoading(false);
    }
  };

  // Fetch metadata for both Equipment and Facility
  const fetchMetadata = async () => {
    try {
      // Fetch both Equipment and Facility metadata
      const [equipmentRes, facilityRes] = await Promise.all([
        assetsService.getGymAssetsMetadata({
          assetType: "Equipment",
          doApplyPaging: false,
          page: 1,
          size: 100,
        }),
        assetsService.getGymAssetsMetadata({
          assetType: "Facility",
          doApplyPaging: false,
          page: 1,
          size: 100,
        }),
      ]);

      const combinedMetadata = [];

      if (equipmentRes.status === "200" && equipmentRes.data?.items) {
        combinedMetadata.push(
          ...equipmentRes.data.items.map((item) => ({
            ...item,
            typeLabel: "Thiết bị",
          }))
        );
      }

      if (facilityRes.status === "200" && facilityRes.data?.items) {
        combinedMetadata.push(
          ...facilityRes.data.items.map((item) => ({
            ...item,
            typeLabel: "Cơ sở vật chất",
          }))
        );
      }

      setMetadata(combinedMetadata);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      toast.error("Không thể tải danh mục cơ sở vật chất");
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchMetadata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAssets(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Handle table pagination change
  const handleTableChange = (newPagination) => {
    fetchAssets(newPagination.current, newPagination.pageSize);
  };

  // Handle search
  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle file change
  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Handle remove file
  const handleRemoveFile = (file) => {
    // If it's an existing image URL (from edit mode), add to removal list
    if (file.url && selectedAsset?.imageUrls?.includes(file.url)) {
      setImagesToRemove((prev) => [...prev, file.url]);
    }
    return true; // Allow removal
  };

  // Open create modal
  const handleCreate = () => {
    setModalMode("create");
    setSelectedAsset(null);
    setFileList([]);
    setImagesToRemove([]);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Open edit modal
  const handleEdit = (record) => {
    setModalMode("edit");
    setSelectedAsset(record);
    setImagesToRemove([]);
    // Convert existing image URLs to file list format
    const existingImages = (record.imageUrls || []).map((url, index) => ({
      uid: `existing-${index}`,
      name: `image-${index}`,
      status: "done",
      url: url,
    }));
    setFileList(existingImages);
    form.setFieldsValue({
      assetMetadataId: record.assetMetadataId,
      quantity: record.quantity,
    });
    setIsModalVisible(true);
  };

  // Handle modal submit
  const handleModalSubmit = async () => {
    try {
      setUploading(true);
      const values = await form.validateFields();

      // Create FormData
      const formData = new FormData();

      if (modalMode === "create") {
        // Add form fields
        formData.append("gymOwnerId", user?.id);
        formData.append("assetMetadataId", values.assetMetadataId);
        formData.append("quantity", values.quantity);

        // Add new image files
        fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append("imagesToAdd", file.originFileObj);
          }
        });

        const response = await assetsService.CreateGymAsset(formData);
        if (response.status === "200" || response.status === "201") {
          toast.success("Tạo cơ sở vật chất thành công");
          fetchAssets(pagination.current, pagination.pageSize);
          setIsModalVisible(false);
          form.resetFields();
          setFileList([]);
        }
      } else {
        // For update
        formData.append("gymAssetId", selectedAsset.id);
        formData.append("quantity", values.quantity);

        // Add new image files (files that don't have a URL)
        fileList.forEach((file) => {
          if (file.originFileObj) {
            formData.append("imagesToAdd", file.originFileObj);
          }
        });

        // Add images to remove
        imagesToRemove.forEach((url) => {
          formData.append("imagesToRemove", url);
        });

        const response = await assetsService.updateGymAsset(formData);
        if (response.status === "200") {
          toast.success("Cập nhật cơ sở vật chất thành công");
          fetchAssets(pagination.current, pagination.pageSize);
          setIsModalVisible(false);
          form.resetFields();
          setFileList([]);
          setImagesToRemove([]);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        `Không thể ${
          modalMode === "create" ? "tạo" : "cập nhật"
        } cơ sở vật chất`
      );
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (assetId) => {
    try {
      const response = await assetsService.deleteGymAsset(assetId);
      if (response.status === "200") {
        toast.success("Xóa cơ sở vật chất thành công");
        fetchAssets(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast.error("Không thể xóa cơ sở vật chất");
    }
  };

  // Table columns
  const columns = [
    {
      title: "Tên cơ sở vật chất",
      dataIndex: "assetName",
      key: "assetName",
      width: 200,
      render: (text, record) => (
        <Space>
          {record.imageUrls && record.imageUrls.length > 0 ? (
            <Image
              src={record.imageUrls[0]}
              alt={text}
              width={40}
              height={40}
              style={{ borderRadius: 8, objectFit: "cover" }}
              preview={{
                mask: <CameraOutlined />,
              }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                background: "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <InboxOutlined style={{ color: "#999" }} />
            </div>
          )}
          <span style={{ fontWeight: 500, color: "#1f2937" }}>{text}</span>
        </Space>
      ),
    },
    {
      title: "Loại",
      dataIndex: "assetType",
      key: "assetType",
      width: 120,
      render: (text) => (
        <Tag
          color={text === "Equipment" ? "blue" : "cyan"}
          style={{ borderRadius: 6 }}
        >
          {text === "Equipment" ? "Thiết bị" : text === "Facility" ? "Cơ sở" : text}
        </Tag>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "equipmentCategory",
      key: "equipmentCategory",
      width: 150,
      render: (text) => (
        <Tag color="green" style={{ borderRadius: 6 }}>
          {text === "StrengthTraining"
            ? "Tập sức mạnh"
            : text === "Cardio"
            ? "Cardio"
            : text === "Accessories"
            ? "Phụ kiện"
            : text}
        </Tag>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
      render: (text) => (
        <Badge
          count={text}
          showZero
          style={{
            backgroundColor: "#faad14",
            fontWeight: 600,
            borderRadius: 6,
          }}
        />
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          <span style={{ color: "#6b7280" }}>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Nhóm cơ mục tiêu",
      dataIndex: "targetMuscularGroups",
      key: "targetMuscularGroups",
      width: 250,
      render: (groups) => (
        <>
          {groups?.slice(0, 3).map((group) => (
            <Tag
              key={group}
              color="purple"
              style={{ marginBottom: 4, borderRadius: 6 }}
            >
              {group}
            </Tag>
          ))}
          {groups?.length > 3 && (
            <Tooltip title={groups.slice(3).join(", ")}>
              <Tag color="purple" style={{ borderRadius: 6 }}>+{groups.length - 3}</Tag>
            </Tooltip>
          )}
        </>
      ),
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrls",
      key: "imageUrls",
      width: 100,
      align: "center",
      render: (urls) => (
        <Tag
          color={urls?.length > 0 ? "cyan" : "default"}
          style={{ borderRadius: 6 }}
        >
          {urls?.length || 0} ảnh
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => (
        <span style={{ color: "#6b7280" }}>
          {dayjs(date).format("DD/MM/YYYY HH:mm")}
        </span>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="primary"
              icon={<EditOutlined />}
              size="small"
              style={{ borderRadius: 6 }}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa cơ sở vật chất"
            description="Bạn có chắc chắn muốn xóa cơ sở vật chất này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa">
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                style={{ borderRadius: 6 }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Group metadata by assetType for Select options
  const equipmentMetadata = metadata.filter((m) => m.assetType === "Equipment");
  const facilityMetadata = metadata.filter((m) => m.assetType === "Facility");

  return (
    <ConfigProvider
      theme={{
        components: {
          Table: {
            headerBg: "#f8fafc",
            headerColor: "#1f2937",
            rowHoverBg: "#f1f5f9",
          },
          Card: {
            borderRadiusLG: 12,
          },
        },
      }}
    >
      <div style={{ padding: "24px", background: "#f5f5f5", minHeight: "100vh" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, color: "#1f2937" }}>
            <AppstoreOutlined style={{ marginRight: 12, color: "#3b82f6" }} />
            Quản lý cơ sở vật chất
          </Title>
          <p style={{ color: "#6b7280", marginTop: 8, marginBottom: 0 }}>
            Quản lý thiết bị và cơ sở vật chất của phòng tập
          </p>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: "none",
              }}
            >
              <Statistic
                title={
                  <span style={{ color: "#6b7280", fontSize: 14 }}>
                    Tổng số tài sản
                  </span>
                }
                value={statistics.totalAssets}
                prefix={
                  <AppstoreOutlined style={{ color: "#3b82f6", fontSize: 20 }} />
                }
                valueStyle={{ color: "#3b82f6", fontWeight: 600 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: "none",
              }}
            >
              <Statistic
                title={
                  <span style={{ color: "#6b7280", fontSize: 14 }}>
                    Thiết bị
                  </span>
                }
                value={statistics.equipmentCount}
                prefix={
                  <ToolOutlined style={{ color: "#10b981", fontSize: 20 }} />
                }
                valueStyle={{ color: "#10b981", fontWeight: 600 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: "none",
              }}
            >
              <Statistic
                title={
                  <span style={{ color: "#6b7280", fontSize: 14 }}>
                    Cơ sở vật chất
                  </span>
                }
                value={statistics.facilityCount}
                prefix={
                  <ShopOutlined style={{ color: "#f59e0b", fontSize: 20 }} />
                }
                valueStyle={{ color: "#f59e0b", fontWeight: 600 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: "none",
              }}
            >
              <Statistic
                title={
                  <span style={{ color: "#6b7280", fontSize: 14 }}>
                    Tổng số lượng
                  </span>
                }
                value={statistics.totalQuantity}
                prefix={
                  <CheckCircleOutlined style={{ color: "#8b5cf6", fontSize: 20 }} />
                }
                valueStyle={{ color: "#8b5cf6", fontWeight: 600 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Table Card */}
        <Card
          style={{
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            border: "none",
          }}
        >
          {/* Filters Row */}
          <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
            <Col xs={24} sm={24} md={8} lg={6}>
              <Search
                placeholder="Tìm kiếm cơ sở vật chất..."
                allowClear
                size="large"
                enterButton={<SearchOutlined />}
                onSearch={handleSearch}
                onChange={(e) => !e.target.value && handleSearch("")}
                style={{ borderRadius: 8 }}
              />
            </Col>
            <Col xs={12} sm={12} md={6} lg={4}>
              <Select
                placeholder="Lọc theo loại"
                allowClear
                size="large"
                style={{ width: "100%", borderRadius: 8 }}
                onChange={(value) => handleFilterChange("assetType", value)}
              >
                <Option value="Equipment">Thiết bị</Option>
                <Option value="Facility">Cơ sở vật chất</Option>
              </Select>
            </Col>
            <Col xs={12} sm={12} md={6} lg={4}>
              <Select
                placeholder="Lọc theo danh mục"
                allowClear
                size="large"
                style={{ width: "100%", borderRadius: 8 }}
                onChange={(value) =>
                  handleFilterChange("equipmentCategory", value)
                }
              >
                <Option value="StrengthTraining">Tập sức mạnh</Option>
                <Option value="Accessories">Phụ kiện</Option>
                <Option value="Cardio">Cardio</Option>
              </Select>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={10}
              style={{ textAlign: "right" }}
            >
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  size="large"
                  style={{ borderRadius: 8 }}
                  onClick={() =>
                    fetchAssets(pagination.current, pagination.pageSize)
                  }
                >
                  Làm mới
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  style={{
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  }}
                  onClick={handleCreate}
                >
                  Thêm cơ sở vật chất mới
                </Button>
              </Space>
            </Col>
          </Row>

          {/* Table */}
          <Table
            columns={columns}
            dataSource={assets}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} mục`,
              pageSizeOptions: ["10", "20", "50"],
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            style={{ marginTop: 8 }}
          />
        </Card>

      {/* Create/Edit Modal */}
        <Modal
          title={
            <span style={{ fontSize: 18, fontWeight: 600 }}>
              {modalMode === "create"
                ? "Thêm cơ sở vật chất mới"
                : "Chỉnh sửa cơ sở vật chất"}
            </span>
          }
          open={isModalVisible}
          onOk={handleModalSubmit}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
            setFileList([]);
            setImagesToRemove([]);
          }}
          width={700}
          okText={modalMode === "create" ? "Tạo" : "Cập nhật"}
          confirmLoading={uploading}
          styles={{
            header: { borderBottom: "1px solid #f0f0f0", paddingBottom: 16 },
            body: { paddingTop: 20 },
          }}
        >
          <Form form={form} layout="vertical" style={{ marginTop: 8 }}>
            <Form.Item
              name="assetMetadataId"
              label={
                <span style={{ fontWeight: 500 }}>
                  Chọn loại cơ sở vật chất
                </span>
              }
              rules={[
                { required: true, message: "Vui lòng chọn loại cơ sở vật chất" },
              ]}
            >
              <Select
                placeholder="Chọn cơ sở vật chất từ danh mục"
                showSearch
                size="large"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children?.toString().toLowerCase().includes(input.toLowerCase())
                }
                disabled={modalMode === "edit"}
                style={{ borderRadius: 8 }}
              >
                {equipmentMetadata.length > 0 && (
                  <Select.OptGroup label="🏋️ Thiết bị (Equipment)">
                    {equipmentMetadata.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name} - {item.equipmentCategory || item.assetType}
                      </Option>
                    ))}
                  </Select.OptGroup>
                )}
                {facilityMetadata.length > 0 && (
                  <Select.OptGroup label="🏢 Cơ sở vật chất (Facility)">
                    {facilityMetadata.map((item) => (
                      <Option key={item.id} value={item.id}>
                        {item.name} - {item.facilityCategory || item.assetType}
                      </Option>
                    ))}
                  </Select.OptGroup>
                )}
              </Select>
            </Form.Item>

            <Form.Item
              name="quantity"
              label={<span style={{ fontWeight: 500 }}>Số lượng</span>}
              rules={[
                { required: true, message: "Vui lòng nhập số lượng" },
                { type: "number", min: 0, message: "Số lượng phải là số dương" },
              ]}
            >
              <InputNumber
                min={0}
                size="large"
                style={{ width: "100%", borderRadius: 8 }}
                placeholder="Nhập số lượng"
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ fontWeight: 500 }}>Hình ảnh cơ sở vật chất</span>}
            >
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleFileChange}
                onRemove={handleRemoveFile}
                beforeUpload={() => false}
                accept="image/*"
                multiple
              >
                {fileList.length < 8 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                )}
              </Upload>
              <div style={{ color: "#999", fontSize: 12, marginTop: 8 }}>
                Tải lên tối đa 8 hình ảnh cho cơ sở vật chất này. Các tệp sẽ được
                gửi khi bạn gửi biểu mẫu.
              </div>
            </Form.Item>

            {modalMode === "edit" && selectedAsset && (
              <Card
                size="small"
                style={{
                  marginTop: 16,
                  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontSize: 13 }}>
                  <strong style={{ color: "#1f2937" }}>
                    Cơ sở vật chất hiện tại:
                  </strong>{" "}
                  <span style={{ color: "#3b82f6" }}>{selectedAsset.assetName}</span>
                  <br />
                  <strong style={{ color: "#1f2937" }}>Danh mục:</strong>{" "}
                  <span style={{ color: "#6b7280" }}>
                    {selectedAsset.equipmentCategory}
                  </span>
                  <br />
                  <strong style={{ color: "#1f2937" }}>Mô tả:</strong>{" "}
                  <span style={{ color: "#6b7280" }}>
                    {selectedAsset.description}
                  </span>
                </div>
              </Card>
            )}
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
}
