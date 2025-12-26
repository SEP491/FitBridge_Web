import React, { useState } from "react";
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
  Divider,
  Space,
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
import toast from "react-hot-toast";
import adminService from "../../../services/adminServices";
import FitBridgeModal from "../../../components/FitBridgeModal";

const { Option } = Select;
const { TextArea } = Input;

export default function CreateProductModal({
  isOpen,
  onClose,
  onSubmit,
  form,
  brands,
  mainCategories,
  filteredSubCategories,
  selectedCategoryId,
  onCategoryChange,
  creating,
  imageFile,
  onImageUpload,
  onImageRemove,
  onRefreshCategories,
  onRefreshSubcategories,
  onRefreshBrands,
}) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingSubCategory, setAddingSubCategory] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [editingBrandName, setEditingBrandName] = useState("");
  const [addingBrand, setAddingBrand] = useState(false);
  const [updatingBrand, setUpdatingBrand] = useState(false);

  const handleCancel = () => {
    form.resetFields();
    setNewCategoryName("");
    setNewSubCategoryName("");
    setNewBrandName("");
    setEditingBrandName("");
    onClose();
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    setAddingCategory(true);
    try {
      const response = await adminService.createCategory({
        name: newCategoryName.trim(),
      });

      toast.success("Thêm danh mục thành công");
      setNewCategoryName("");

      // Refresh categories list
      if (onRefreshCategories) {
        await onRefreshCategories();
      }

      // Set the newly created category as selected
      if (response.data?.id) {
        form.setFieldsValue({ categoryId: response.data.id });
        onCategoryChange(response.data.id);
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tạo danh mục");
    } finally {
      setAddingCategory(false);
    }
  };

  const handleAddSubCategory = async (e) => {
    e.preventDefault();
    if (!newSubCategoryName.trim()) {
      toast.error("Vui lòng nhập tên danh mục phụ");
      return;
    }

    if (!selectedCategoryId) {
      toast.error("Vui lòng chọn danh mục chính trước");
      return;
    }

    setAddingSubCategory(true);
    try {
      await adminService.createSubCategory({
        name: newSubCategoryName.trim(),
        categoryId: selectedCategoryId,
      });
 toast.success("Thêm danh mục phụ thành công");
      setNewSubCategoryName("");
      onRefreshSubcategories(selectedCategoryId);
    } catch (error) {
      console.error("Error creating subcategory:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tạo danh mục phụ");
    } finally {
      setAddingSubCategory(false);
    }
};

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) {
      toast.error("Vui lòng nhập tên thương hiệu");
      return;
    }

    setAddingBrand(true);
    try {
      const response = await adminService.createBrand({
        name: newBrandName.trim(),
      });

      toast.success("Thêm thương hiệu thành công");
      setNewBrandName("");

      onRefreshBrands();

      if (response.data?.id) {
        form.setFieldsValue({ brandId: response.data.id });
        setEditingBrandName(response.data.name || "");
      }
    } catch (error) {
      console.error("Error creating brand:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tạo thương hiệu");
    } finally {
      setAddingBrand(false);
    }
  };

  const handleUpdateBrand = async (e) => {
    e.preventDefault();
    const selectedBrandId = form.getFieldValue("brandId");

    if (!selectedBrandId) {
      toast.error("Vui lòng chọn thương hiệu cần cập nhật");
      return;
    }

    if (!editingBrandName.trim()) {
      toast.error("Vui lòng nhập tên thương hiệu");
      return;
    }

    setUpdatingBrand(true);
    try {
      await adminService.updateBrand(selectedBrandId, {
        name: editingBrandName.trim(),
      });

      toast.success("Cập nhật thương hiệu thành công");

     onRefreshBrands();
    } catch (error) {
      console.error("Error updating brand:", error);
      toast.error(
        error.response?.data?.message || "Lỗi khi cập nhật thương hiệu"
      );
    } finally {
      setUpdatingBrand(false);
     
  };
}
  return (
    <FitBridgeModal
      open={isOpen}
      onCancel={handleCancel}
      title={
        <div className="flex items-center gap-2 text-lg">
          <span>Tạo Sản Phẩm Mới</span>
        </div>
      }
      width={900}
      footer={
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
            onClick={() => form.submit()}
          >
            Tạo Sản Phẩm
          </Button>
        </div>
      }
      className="create-product-modal "
    >
      <Form
        form={form}
        style={{ overflowY: "scroll", maxHeight: "60vh" }}
        layout="vertical"
        onFinish={onSubmit}
      >
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
                name="coverImage"
              >
                <div className="flex flex-col items-center gap-2">
                  {!imageFile ? (
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        onImageUpload(file);
                        return false;
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <UploadOutlined
                          style={{ fontSize: 24 }}
                          className="text-blue-500"
                        />
                        <div style={{ marginTop: 8 }} className="text-sm">
                          Chọn ảnh
                        </div>
                      </div>
                    </Upload>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="border-2 border-blue-200 rounded-lg p-2 bg-white">
                        <Image
                          src={URL.createObjectURL(imageFile)}
                          width={140}
                          height={140}
                          className="object-cover rounded"
                          preview={true}
                        />
                      </div>
                      <div className="text-xs text-center text-green-600">
                        ✓ Đã chọn: {imageFile.name}
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
                  onChange={(value) => {
                    const selectedBrand = brands.find(
                      (brand) => brand.id === value
                    );
                    setEditingBrandName(selectedBrand?.name || "");
                    form.setFieldsValue({ brandId: value });
                  }}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Space
                        direction="vertical"
                        style={{ padding: "0 8px 8px", width: "100%" }}
                      >
                        <div className="flex gap-2">
                          <Input
                            placeholder="Tên thương hiệu mới"
                            value={newBrandName}
                            onChange={(e) => setNewBrandName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddBrand(e);
                              }
                            }}
                          />
                          <Button
                            type="text"
                            icon={<PlusOutlined />}
                            onClick={handleAddBrand}
                            loading={addingBrand}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            Thêm
                          </Button>
                        </div>
                        <Divider style={{ margin: "4px 0" }} />
                        <div className="flex gap-2">
                          <Input
                            placeholder="Cập nhật tên thương hiệu"
                            value={editingBrandName}
                            onChange={(e) =>
                              setEditingBrandName(e.target.value)
                            }
                            disabled={!form.getFieldValue("brandId")}
                          />
                          <Button
                            type="text"
                            onClick={handleUpdateBrand}
                            loading={updatingBrand}
                            disabled={!form.getFieldValue("brandId")}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            Lưu
                          </Button>
                        </div>
                      </Space>
                    </>
                  )}
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
                rules={[
                  { required: true, message: "Vui lòng chọn danh mục chính" },
                ]}
              >
                <Select
                  placeholder="Chọn danh mục chính"
                  showSearch
                  optionFilterProp="children"
                  size="large"
                  suffixIcon={<AppstoreOutlined className="text-purple-500" />}
                  onChange={onCategoryChange}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Space style={{ padding: "0 8px 4px" }}>
                        <Input
                          placeholder="Tên danh mục mới"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddCategory(e);
                            }
                          }}
                        />
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={handleAddCategory}
                          loading={addingCategory}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          Thêm
                        </Button>
                      </Space>
                    </>
                  )}
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
                rules={[
                  { required: true, message: "Vui lòng chọn danh mục phụ" },
                ]}
              >
                <Select
                  placeholder="Chọn danh mục phụ"
                  showSearch
                  optionFilterProp="children"
                  size="large"
                  suffixIcon={<AppstoreOutlined className="text-purple-500" />}
                  disabled={!selectedCategoryId}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: "8px 0" }} />
                      <Space style={{ padding: "0 8px 4px" }}>
                        <Input
                          placeholder="Tên danh mục phụ mới"
                          value={newSubCategoryName}
                          onChange={(e) =>
                            setNewSubCategoryName(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddSubCategory(e);
                            }
                          }}
                          disabled={!selectedCategoryId}
                        />
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={handleAddSubCategory}
                          loading={addingSubCategory}
                          disabled={!selectedCategoryId}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          Thêm
                        </Button>
                      </Space>
                    </>
                  )}
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
      </Form>
    </FitBridgeModal>
  );
}
