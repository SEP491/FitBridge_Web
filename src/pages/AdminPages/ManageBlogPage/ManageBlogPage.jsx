import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  ConfigProvider,
  Descriptions,
  Form,
  Input,
  Image,
  Space,
  Table,
  Tag,
  Tooltip,
  Upload,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import FitBridgeModal from "../../../components/FitBridgeModal";
import blogService from "../../../services/blogServices";
import uploadService from "../../../services/uploadService";

const { TextArea } = Input;

export default function ManageBlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [createFileList, setCreateFileList] = useState([]);
  const [editFileList, setEditFileList] = useState([]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await blogService.getBlogs();
      const list = response?.data?.data || response?.data || [];
      setBlogs(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Không thể tải danh sách blog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    if (!searchText) return blogs;
    const keyword = searchText.toLowerCase();
    return blogs.filter(
      (blog) =>
        blog.title?.toLowerCase().includes(keyword) ||
        blog.content?.toLowerCase().includes(keyword)
    );
  }, [blogs, searchText]);

  const stats = useMemo(
    () => ({
      total: filteredBlogs.length,
      enabled: filteredBlogs.filter((b) => b.isEnabled).length,
      disabled: filteredBlogs.filter((b) => b.isEnabled === false).length,
    }),
    [filteredBlogs]
  );

  const openCreateModal = () => {
    createForm.resetFields();
    setCreateFileList([]);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (blog) => {
    setSelectedBlog(blog);
    editForm.setFieldsValue({
      title: blog.title,
      content: blog.content,
    });
    const firstImage = (blog.images || [])[0];
    setEditFileList(
      firstImage
        ? [
            {
              uid: firstImage,
              name: firstImage,
              status: "done",
              url: firstImage,
            },
          ]
        : []
    );
    setIsEditModalOpen(true);
  };

  const openDetailModal = (blog) => {
    setSelectedBlog(blog);
    setIsDetailModalOpen(true);
  };

  const handleUploadImage = async (file, mode = "create") => {
    const setList = mode === "create" ? setCreateFileList : setEditFileList;
    try {
      const response = await uploadService.uploadFile(file);
      const imageUrl = response?.data;
      if (!imageUrl) throw new Error("Không nhận được URL ảnh");

      setList([
        {
          uid: file.uid,
          name: file.name,
          status: "done",
          url: imageUrl,
        },
      ]);
      toast.success("Tải ảnh thành công");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Không thể tải lên hình ảnh");
    }
    return false;
  };

  const getImageUrls = (fileList) => {
    const first = fileList.find((f) => f.status === "done" && f.url);
    return first ? [first.url] : [];
  };

  const handleCreateBlog = async () => {
    try {
      const values = await createForm.validateFields();
      setActionLoading(true);
      await blogService.createBlog({
        title: values.title,
        content: values.content,
        images: getImageUrls(createFileList),
      });
      toast.success("Tạo blog thành công");
      setIsCreateModalOpen(false);
      setCreateFileList([]);
      await fetchBlogs();
    } catch (error) {
      if (error.name !== "ValidationError") {
        console.error("Error creating blog:", error);
        toast.error("Không thể tạo blog");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateBlog = async () => {
    if (!selectedBlog) return;
    try {
      const values = await editForm.validateFields();
      setActionLoading(true);
      await blogService.updateBlog(selectedBlog.id, {
        title: values.title,
        content: values.content,
        images: getImageUrls(editFileList),
      });
      toast.success("Cập nhật blog thành công");
      setIsEditModalOpen(false);
      setEditFileList([]);
      await fetchBlogs();
    } catch (error) {
      if (error.name !== "ValidationError") {
        console.error("Error updating blog:", error);
        toast.error("Không thể cập nhật blog");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBlog = async (blog) => {
    try {
      setActionLoading(true);
      await blogService.deleteBlog(blog.id);
      toast.success("Đã xóa blog");
      if (isDetailModalOpen) setIsDetailModalOpen(false);
      await fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Không thể xóa blog");
    } finally {
      setActionLoading(false);
    }
  };
  const handleEnableBlog = async (blog) => {
    try {
      setActionLoading(true);
      await blogService.enableBlog(blog.id);
      toast.success("Đã kích hoạt blog thành công");
      if (isDetailModalOpen) setIsDetailModalOpen(false);
      await fetchBlogs();
    } catch (error) {
      console.error("Error enabling blog:", error);
      toast.error("Không thể kích hoạt blog");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      title: "Tiêu Đề",
      dataIndex: "title",
      key: "title",
      align: "left",
      render: (title) => (
        <Tooltip title={title}>
          <span className="font-semibold text-gray-800">{title}</span>
        </Tooltip>
      ),
    },
    {
      title: "Tác Giả",
      dataIndex: "authorId",
      key: "authorId",
      width: 220,
      render: (authorId) => (
        <span className="text-gray-700">{authorId || "N/A"}</span>
      ),
    },
    {
      title: "Tóm Tắt",
      dataIndex: "content",
      key: "content",
      render: (content) => (
        <Tooltip title={content}>
          <div className="max-w-[260px] truncate text-gray-600">
            {content || "—"}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Hình Ảnh",
      dataIndex: "images",
      key: "images",
      width: 120,
      render: (images) => (
        <Tag color="blue">{(images && images.length) || 0} ảnh</Tag>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "isEnabled",
      key: "isEnabled",
      width: 140,
      render: (isEnabled) =>
        isEnabled ? (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Đang hiển thị
          </Tag>
        ) : (
          <Tag color="red" icon={<CloseCircleOutlined />}>
            Tạm ẩn
          </Tag>
        ),
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "—"),
    },
    {
      title: "Cập Nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 160,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "—"),
    },
    {
      title: "Thao Tác",
      key: "actions",
      fixed: "right",
      width: 170,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => openDetailModal(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          {record.isEnabled === false && (
            <Tooltip title="Kích hoạt">
              <Button
                type="primary"
                shape="circle"
                icon={<CheckCircleOutlined />}
                loading={actionLoading}
                onClick={() => handleEnableBlog(record)}
              />
            </Tooltip>
          )}
          {record.isEnabled === true && (
            <Tooltip title="Tạm ẩn">
              <Button
                type="primary"
                shape="circle"
                icon={<CloseCircleOutlined />}
                loading={actionLoading}
                onClick={() => handleDeleteBlog(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#ED2A46] flex items-center gap-2">
            <FileTextOutlined />
            Quản Lý Blog
          </h1>
          <p className="text-gray-500">
            Theo dõi, tạo mới và chỉnh sửa các bài viết blog.
          </p>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchBlogs}
            loading={loading}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
            className="bg-gradient-to-r from-[#ED2A46] to-[#ff6b81] border-0"
          >
            Thêm Blog
          </Button>
        </Space>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
          <div className="text-2xl font-bold text-[#ED2A46]">{stats.total}</div>
          <div className="text-gray-600 text-sm">Tổng số blog</div>
        </Card>
        <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
          <div className="text-2xl font-bold text-green-600">
            {stats.enabled}
          </div>
          <div className="text-gray-600 text-sm">Đang hiển thị</div>
        </Card>
        <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
          <div className="text-2xl font-bold text-gray-600">
            {stats.disabled}
          </div>
          <div className="text-gray-600 text-sm">Tạm ẩn</div>
        </Card>
      </div>

      <Card className="mb-4">
        <Input
          allowClear
          placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Card>

      <ConfigProvider
        theme={{ components: { Table: { headerBg: "#FFE5E9" } } }}
      >
        <Table
          dataSource={filteredBlogs}
          columns={columns}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            position: ["bottomCenter"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} blog`,
          }}
        />
      </ConfigProvider>

      {/* Detail Modal */}
      <FitBridgeModal
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        title="Chi Tiết Blog"
        titleIcon={<EyeOutlined />}
        width={800}
        logoSize="medium"
        footer={
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
            <Button onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                if (selectedBlog) openEditModal(selectedBlog);
                setIsDetailModalOpen(false);
              }}
            >
              Chỉnh sửa
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              loading={actionLoading}
              onClick={() => selectedBlog && handleDeleteBlog(selectedBlog)}
            >
              Xóa
            </Button>
          </div>
        }
      >
        {selectedBlog && (
          <div className="p-6 space-y-4">
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="Tiêu đề">
                {selectedBlog.title}
              </Descriptions.Item>
              <Descriptions.Item label="Tác giả">
                {selectedBlog.authorId || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Nội dung">
                <div className="whitespace-pre-wrap">
                  {selectedBlog.content}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Hình ảnh">
                {selectedBlog.images && selectedBlog.images.length > 0 ? (
                  <Image.PreviewGroup>
                    <Image
                      width={220}
                      src={selectedBlog.images[0]}
                      alt="Blog"
                      style={{ borderRadius: 8 }}
                    />
                  </Image.PreviewGroup>
                ) : (
                  "Không có hình ảnh"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {selectedBlog.isEnabled ? (
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    Đang hiển thị
                  </Tag>
                ) : (
                  <Tag color="red" icon={<CloseCircleOutlined />}>
                    Tạm ẩn
                  </Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {selectedBlog.createdAt
                  ? dayjs(selectedBlog.createdAt).format("DD/MM/YYYY HH:mm")
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật">
                {selectedBlog.updatedAt
                  ? dayjs(selectedBlog.updatedAt).format("DD/MM/YYYY HH:mm")
                  : "—"}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </FitBridgeModal>

      {/* Create Blog Modal */}
      <FitBridgeModal
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          setCreateFileList([]);
        }}
        title="Tạo Blog Mới"
        titleIcon={<PlusOutlined />}
        width={720}
        logoSize="medium"
        footer={
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
            <Button onClick={() => setIsCreateModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              loading={actionLoading}
              onClick={handleCreateBlog}
              className="bg-gradient-to-r from-[#ED2A46] to-[#ff6b81] border-0"
            >
              Tạo blog
            </Button>
          </div>
        }
      >
        <Form form={createForm} layout="vertical" className="p-6">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Nhập tiêu đề blog" />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
          >
            <TextArea rows={5} placeholder="Nhập nội dung bài viết" />
          </Form.Item>
          <Form.Item label="Hình ảnh">
            <Upload
              listType="picture-card"
              fileList={createFileList}
              beforeUpload={(file) => handleUploadImage(file, "create")}
              onRemove={(file) =>
                setCreateFileList((prev) =>
                  prev.filter((item) => item.uid !== file.uid)
                )
              }
              accept="image/*"
              maxCount={1}
            >
              {createFileList.length < 1 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh</div>
                </div>
              )}
            </Upload>
            <div className="text-xs text-gray-500">
              Chỉ một ảnh. Ảnh sẽ được tải lên và dùng URL khi tạo blog.
            </div>
          </Form.Item>
        </Form>
      </FitBridgeModal>

      {/* Edit Blog Modal */}
      <FitBridgeModal
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditFileList([]);
        }}
        title="Chỉnh Sửa Blog"
        titleIcon={<EditOutlined />}
        width={720}
        logoSize="medium"
        footer={
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t">
            <Button onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={actionLoading}
              onClick={handleUpdateBlog}
              className="bg-blue-500 border-0 hover:bg-blue-600"
            >
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <Form form={editForm} layout="vertical" className="p-6">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Nhập tiêu đề blog" />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
          >
            <TextArea rows={5} placeholder="Nhập nội dung bài viết" />
          </Form.Item>
          <Form.Item label="Hình ảnh">
            <Upload
              listType="picture-card"
              fileList={editFileList}
              beforeUpload={(file) => handleUploadImage(file, "edit")}
              onRemove={(file) =>
                setEditFileList((prev) =>
                  prev.filter((item) => item.uid !== file.uid)
                )
              }
              accept="image/*"
              maxCount={1}
            >
              {editFileList.length < 1 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải ảnh</div>
                </div>
              )}
            </Upload>
            <div className="text-xs text-gray-500">
              Chỉ một ảnh. Ảnh sẽ được tải lên và dùng URL khi lưu thay đổi.
            </div>
          </Form.Item>
        </Form>
      </FitBridgeModal>
    </div>
  );
}
