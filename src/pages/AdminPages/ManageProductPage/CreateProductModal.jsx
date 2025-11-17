import React from "react";
import {
  Modal,
  Form,
  Card,
  Row,
  Col,
  Select,
  Input,
  Switch,
  Button,
  Upload,
  Image,
} from "antd";
import {
  PlusOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  TagOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

export default function CreateProductModal({
  isOpen,
  onClose,
  onSubmit,
  form,
  brands,
  mainCategories,
  subCategories,
  filteredSubCategories,
  selectedCategoryId,
  onCategoryChange,
  creating,
  imageUrl,
  onImageUpload,
  onImageRemove,
}) {
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleCancel}
      title={
        <div className="flex items-center gap-2 text-lg">
          <PlusOutlined className="text-orange-500" />
          <span>Tạo Sản Phẩm Mới</span>
        </div>
      }
      width={900}
      footer={null}
      className="create-product-modal"
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        {/* Basic Info Section */}
        <Card
          size="small"
          style={{
            marginBottom: 16,
            background: "linear-gradient(to right, #EFF6FF, #E0E7FF)",
            borderColor: "#BFDBFE",
          }}
          title={
            <span style={{ color: "#1D4ED8", fontWeight: 600 }}>
              <ShoppingOutlined style={{ marginRight: 8 }} />
              Thông Tin Cơ Bản
            </span>
          }
        >
          <Row gutter={16}>
            <Col span={5}>
              <Form.Item
                label={<span className="font-medium">Hình Ảnh Bìa</span>}
                required
              >
                <div className="flex flex-col items-center gap-2">
                  {!imageUrl ? (
                    <Upload
                      action="https://api-fitbridge.srv840734.hstgr.cloud/api/v1/uploads"
                      listType="picture-card"
                      maxCount={1}
                      accept="image/*"
                      showUploadList={false}
                      onChange={(info) => {
                        if (info.file.status === 'uploading') {
                          // Optional: Handle uploading state
                          console.log('Uploading:', info.file);
                        }
                        if (info.file.status === 'done') {
                          // Get the image URL from response
                          const imageUrl = info.file.response?.data || info.file.response;
                          onImageUpload(imageUrl);
                        }
                        if (info.file.status === 'error') {
                          console.error('Upload error:', info.file.error);
                        }
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <UploadOutlined
                          style={{ fontSize: 24 }}
                          className="text-blue-500"
                        />
                        <div style={{ marginTop: 8 }} className="text-sm">
                          Tải ảnh lên
                        </div>
                      </div>
                    </Upload>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="border-2 border-blue-200 rounded-lg p-2 bg-white">
                        <Image
                          src={imageUrl}
                          width={140}
                          height={140}
                          className="object-cover rounded"
                          preview={true}
                        />
                      </div>
                      <div className="text-xs text-center text-green-600">
                        ✓ Đã tải lên
                      </div>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={onImageRemove}
                        className="text-xs"
                      >
                        Xóa ảnh
                      </Button>
                    </div>
                  )}
                </div>
              </Form.Item>
            </Col>
            <Col span={19}>
              <Form.Item
                label={<span className="font-medium">Tên Sản Phẩm</span>}
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm" },
                ]}
              >
                <Input placeholder="Nhập tên sản phẩm" size="large" />
              </Form.Item>

              <Form.Item
                label={<span className="font-medium">Mô Tả</span>}
                name="description"
              >
                <TextArea
                  rows={3}
                  placeholder="Nhập mô tả sản phẩm"
                  className="text-base"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Category & Brand Section */}
        <Card
          size="small"
          style={{
            marginBottom: 16,
            background: "linear-gradient(to right, #FAF5FF, #FCE7F3)",
            borderColor: "#E9D5FF",
          }}
          title={
            <span style={{ color: "#7E22CE", fontWeight: 600 }}>
              <AppstoreOutlined style={{ marginRight: 8 }} />
              Phân Loại
            </span>
          }
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span className="font-medium">Thương Hiệu</span>}
                name="brandId"
                rules={[
                  { required: true, message: "Vui lòng chọn thương hiệu" },
                ]}
              >
                <Select
                  placeholder="Chọn thương hiệu"
                  showSearch
                  optionFilterProp="children"
                  size="large"
                  suffixIcon={<AppstoreOutlined className="text-purple-500" />}
                >
                  {brands.map((brand) => (
                    <Option key={brand.id} value={brand.id}>
                      <span className="font-medium">{brand.name}</span>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span className="font-medium">Danh Mục Chính</span>}
                name="categoryId"
                rules={[{ required: true, message: "Vui lòng chọn danh mục chính" }]}
              >
                <Select
                  placeholder="Chọn danh mục chính"
                  showSearch
                  optionFilterProp="children"
                  size="large"
                  suffixIcon={<AppstoreOutlined className="text-purple-500" />}
                  onChange={onCategoryChange}
                >
                  {mainCategories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      <span className="font-medium">{category.name}</span>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={<span className="font-medium">Danh Mục Phụ</span>}
                name="subCategoryId"
                rules={[{ required: true, message: "Vui lòng chọn danh mục phụ" }]}
              >
                <Select
                  placeholder="Chọn danh mục phụ"
                  showSearch
                  optionFilterProp="children"
                  size="large"
                  suffixIcon={<AppstoreOutlined className="text-purple-500" />}
                  disabled={!selectedCategoryId}
                >
                  {filteredSubCategories.map((subCat) => (
                    <Option key={subCat.id} value={subCat.id}>
                      <span className="font-medium">{subCat.name}</span>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Origin & Protein Section */}
        <Card
          size="small"
          style={{
            marginBottom: 16,
            background: "linear-gradient(to right, #F0FDF4, #D1FAE5)",
            borderColor: "#BBF7D0",
          }}
          title={
            <span style={{ color: "#15803D", fontWeight: 600 }}>
              <TagOutlined style={{ marginRight: 8 }} />
              Nguồn Gốc & Thành Phần
            </span>
          }
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span className="font-medium">Xuất Xứ</span>}
                name="countryOfOrigin"
              >
                <Input placeholder="Nhập quốc gia xuất xứ" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span className="font-medium">Nguồn Protein</span>}
                name="proteinSources"
              >
                <Input placeholder="VD: Whey, Casein" size="large" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Display Status Section */}
        <Card
          size="small"
          style={{
            marginBottom: 16,
            background: "linear-gradient(to right, #F9FAFB, #F1F5F9)",
            borderColor: "#E5E7EB",
          }}
        >
          <Form.Item
            label={
              <span className="font-medium text-base">Trạng Thái Hiển Thị</span>
            }
            name="isDisplayed"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch
              checkedChildren={
                <span className="flex items-center gap-1">
                  <CheckCircleOutlined /> Hiển thị
                </span>
              }
              unCheckedChildren={
                <span className="flex items-center gap-1">
                  <StopOutlined /> Ẩn
                </span>
              }
              size="default"
            />
          </Form.Item>
        </Card>

        {/* Action Buttons */}
        <Form.Item className="mb-0">
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button size="large" onClick={handleCancel} className="px-6">
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={creating}
              size="large"
              icon={<CheckCircleOutlined />}
              className="bg-gradient-to-r from-orange-400 to-orange-500 border-0 px-8 shadow-lg hover:shadow-xl"
            >
              Tạo Sản Phẩm
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
