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
  Spin,
  Image,
  Upload,
  Tooltip,
  Popconfirm,
  Badge,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CameraOutlined,
  InboxOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import assetsService from "../../../services/assetsServices";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/features/userSlice";

const { Search } = Input;
const { Option } = Select;

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
        setAssets(response.data.items);
        setPagination({
          current: response.data.page,
          pageSize: response.data.size,
          total: response.data.total,
        });
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      toast.error("Không thể tải danh sách cơ sở vật chất");
    } finally {
      setLoading(false);
    }
  };

  // Fetch metadata
  const fetchMetadata = async () => {
    try {
      const response = await assetsService.getGymAssetsMetadata();
      if (response.status === "200") {
        setMetadata(response.data.items);
      }
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
              style={{ borderRadius: 4, objectFit: "cover" }}
              preview={{
                mask: <CameraOutlined />,
              }}
            />
          ) : (
            <div
              style={{
                width: 40,
                height: 40,
                background: "#f0f0f0",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <InboxOutlined />
            </div>
          )}
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: "Loại",
      dataIndex: "assetType",
      key: "assetType",
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Danh mục",
      dataIndex: "equipmentCategory",
      key: "equipmentCategory",
      width: 150,
      render: (text) => <Tag color="green">{text}</Tag>,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
      render: (text) => <Badge count={text} showZero color="#faad14" />,
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
          {text}
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
            <Tag key={group} color="purple" style={{ marginBottom: 4 }}>
              {group}
            </Tag>
          ))}
          {groups?.length > 3 && (
            <Tooltip title={groups.slice(3).join(", ")}>
              <Tag color="purple">+{groups.length - 3} more</Tag>
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
        <Tag color={urls?.length > 0 ? "cyan" : "default"}>
          {urls?.length || 0} ảnh
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
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
              <Button danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={24} md={12} lg={8}>
            <Search
              placeholder="Tìm kiếm cơ sở vật chất..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch("")}
            />
          </Col>
          <Col xs={12} sm={12} md={6} lg={4}>
            <Select
              placeholder="Lọc theo loại"
              allowClear
              style={{ width: "100%" }}
              onChange={(value) => handleFilterChange("assetType", value)}
            >
              <Option value="Equipment">Thiết bị</Option>
            </Select>
          </Col>
          <Col xs={12} sm={12} md={6} lg={4}>
            <Select
              placeholder="Lọc theo danh mục"
              allowClear
              style={{ width: "100%" }}
              onChange={(value) =>
                handleFilterChange("equipmentCategory", value)
              }
            >
              <Option value="StrengthTraining">Tập sức mạnh</Option>
              <Option value="Accessories">Phụ kiện</Option>
              <Option value="Cardio">Cardio</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={24} lg={8} style={{ textAlign: "right" }}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() =>
                  fetchAssets(pagination.current, pagination.pageSize)
                }
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Thêm cơ sở vật chất mới
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={assets}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          modalMode === "create"
            ? "Thêm cơ sở vật chất mới"
            : "Chỉnh sửa cơ sở vật chất"
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
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="assetMetadataId"
            label="Chọn loại cơ sở vật chất"
            rules={[
              { required: true, message: "Vui lòng chọn loại cơ sở vật chất" },
            ]}
          >
            <Select
              placeholder="Chọn cơ sở vật chất từ danh mục"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
              disabled={modalMode === "edit"}
            >
              {metadata.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.name} - {item.assetType}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: "Vui lòng nhập số lượng" },
              { type: "number", min: 0, message: "Số lượng phải là số dương" },
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Nhập số lượng"
            />
          </Form.Item>

          <Form.Item label="Hình ảnh cơ sở vật chất">
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
            <Card size="small" style={{ marginTop: 16, background: "#fafafa" }}>
              <div style={{ fontSize: 12 }}>
                <strong>Cơ sở vật chất hiện tại:</strong>{" "}
                {selectedAsset.assetName}
                <br />
                <strong>Danh mục:</strong> {selectedAsset.equipmentCategory}
                <br />
                <strong>Mô tả:</strong> {selectedAsset.description}
              </div>
            </Card>
          )}
        </Form>
      </Modal>
    </div>
  );
}
