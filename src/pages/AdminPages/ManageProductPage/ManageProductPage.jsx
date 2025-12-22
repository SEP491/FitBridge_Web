import {
  Button,
  Card,
  ConfigProvider,
  Input,
  Spin,
  Table,
  Row,
  Col,
  Statistic,
  Tag,
  Select,
  Image,
  Form,
  TreeSelect,
} from "antd";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  LoadingOutlined,
  SearchOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ShoppingOutlined,
  DollarOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import adminService from "../../../services/adminServices";
import defaultImage from "../../../assets/LogoColor.png";
import ProductDetailModal from "./ProductDetailModal";
import CreateProductDetailModal from "./CreateProductDetailModal";
import CreateProductModal from "./CreateProductModal";
import UpdateProductModal from "./UpdateProductModal";

const { Option } = Select;

export default function ManageProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCreateDetailModalOpen, setIsCreateDetailModalOpen] = useState(false);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] =
    useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState(undefined);
  const [countryFilter, setCountryFilter] = useState("all");
  const [brands, setBrands] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [weights, setWeights] = useState([]);
  const [flavours, setFlavours] = useState([]);
  const [form] = Form.useForm();
  const [detailForm] = Form.useForm();
  const [createProductForm] = Form.useForm();
  const [updating, setUpdating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Statistics state
  const [statistics, setStatistics] = useState({
    totalProducts: 0,
    displayedProducts: 0,
    hiddenProducts: 0,
    totalSold: 0,
  });

  const fetchProducts = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await adminService.getAllProducts({
        page,
        size: pageSize,
      });
      const { items, total, page: currentPage } = response.data;
      setProducts(items);

      // Calculate statistics
      const displayedProducts = items.filter(
        (product) => product.isDisplayed
      ).length;
      const hiddenProducts = items.filter(
        (product) => !product.isDisplayed
      ).length;

      setStatistics({
        totalProducts: total,
        displayedProducts,
        hiddenProducts,
        totalSold: 0, // Can be calculated from actual data if available
      });

      setPagination({
        current: currentPage,
        pageSize,
        total,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Lỗi khi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchMainCategories(); // This now fetches both main categories and subcategories
  }, []);

  const handleTableChange = (newPagination) => {
    fetchProducts(newPagination.current, newPagination.pageSize);
  };

  const fetchBrandsAndCategories = async () => {
    try {
      const brandsRes = await adminService.getAllBrands({ page: 1, size: 100 });
      setBrands(brandsRes.data || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Lỗi khi tải thương hiệu");
    }
  };

  const fetchMainCategories = async () => {
    try {
      const response = await adminService.getAllCategories({
        page: 1,
        size: 100,
      });
      const categoriesData = response.data?.items || response.data || [];

      // Extract main categories
      setMainCategories(categoriesData);

      // Extract all subcategories from nested structure
      const allSubCategories = categoriesData.flatMap(
        (category) => category.subCategories || []
      );
      setSubCategories(allSubCategories);
      console.log("Fetched Sub Categories:", allSubCategories);

      // RETURN the data so it can be used immediately
      return { categoriesData, allSubCategories };
    } catch (error) {
      console.error("Error fetching main categories:", error);
      toast.error("Lỗi khi tải danh mục chính");
      return { categoriesData: [], allSubCategories: [] };
    }
  };

  // Add this new function after fetchMainCategories
  const refreshSubCategoriesForCategory = async (categoryId) => {
    try {
      const response = await adminService.getAllCategories({
        page: 1,
        size: 100,
      });
      const categoriesData = response.data?.items || response.data || [];

      // Update all subcategories
      const allSubCategories = categoriesData.reduce((acc, category) => {
        if (category.subCategories && Array.isArray(category.subCategories)) {
          const subCats = category.subCategories.map((subCat) => ({
            id: subCat.id,
            name: subCat.name,
            categoryId: subCat.categoryId,
            categoryName: category.name,
          }));
          return [...acc, ...subCats];
        }
        return acc;
      }, []);

      setSubCategories(allSubCategories);

      // Filter for the specific category
      const filtered = allSubCategories.filter(
        (sc) => sc.categoryId === categoryId
      );
      setFilteredSubCategories(filtered);

      console.log(
        "Refreshed subcategories for category:",
        categoryId,
        filtered
      );

      return filtered;
    } catch (error) {
      console.error("Error refreshing subcategories:", error);
      toast.error("Lỗi khi làm mới danh mục phụ");
      return [];
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryId(categoryId);
    const filtered = subCategories.filter((sc) => sc.categoryId === categoryId);
    setFilteredSubCategories(filtered);
    createProductForm.setFieldsValue({ subCategoryId: undefined });
  };

  const fetchWeightsAndFlavours = async () => {
    try {
      const [weightsRes, flavoursRes] = await Promise.all([
        adminService.getAllWeights({ page: 1, size: 100 }),
        adminService.getAllFlavours({ page: 1, size: 100 }),
      ]);
      console.log("Weights Response:", weightsRes);
      console.log("Flavours Response:", flavoursRes);

      // Handle both paginated and non-paginated responses
      const weightsData = weightsRes.data?.items || weightsRes.data || [];
      const flavoursData = flavoursRes.data?.items || flavoursRes.data || [];

      console.log("Weights Data:", weightsData);
      console.log("Flavours Data:", flavoursData);

      setWeights(weightsData);
      setFlavours(flavoursData);
    } catch (error) {
      console.error("Error fetching weights/flavours:", error);
      toast.error("Lỗi khi tải trọng lượng/hương vị");
    }
  };

  const handleViewDetails = async (productId) => {
    try {
      const response = await adminService.viewProductsDetails(productId);
      setSelectedProduct(response.data);
      setIsModalDetailOpen(true);
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast.error("Lỗi khi tải chi tiết sản phẩm");
    }
  };

  const handleOpenUpdateModal = async () => {
    if (selectedProduct) {
      setIsUpdateModalOpen(true);
      await fetchBrandsAndCategories();
      const { allSubCategories } = await fetchMainCategories();

      // Find the subcategory that matches the product's subCategoryId
      const subCat = allSubCategories.find(
        (sc) => sc.id === selectedProduct.subCategoryId
      );
      
      // Get the category ID from the subcategory
      const categoryId = subCat?.categoryId;

      console.log("Selected Product SubCategory ID:", selectedProduct.subCategoryId);
      console.log("Found SubCategory:", subCat);
      console.log("Category ID:", categoryId);

      if (categoryId) {
        setSelectedCategoryId(categoryId);
        // Filter subcategories for this category
        const filtered = allSubCategories.filter(
          (sc) => sc.categoryId === categoryId
        );
        setFilteredSubCategories(filtered);
        console.log("Filtered SubCategories:", filtered);
      }

      form.setFieldsValue({
        name: selectedProduct.name,
        description: selectedProduct.description,
        brandId: selectedProduct.brandId,
        categoryId: categoryId,
        subCategoryId: selectedProduct.subCategoryId,
        countryOfOrigin: selectedProduct.countryOfOrigin,
        proteinSources: selectedProduct.proteinSources,
        isDisplayed: selectedProduct.isDisplayed,
      });
    }
  };

  const handleUpdateProduct = async (values) => {
    if (!selectedProduct) return;

    setUpdating(true);
    try {
      // Prepare FormData for multipart/form-data
      const formData = new FormData();
      formData.append("id", selectedProduct.id);
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("brandId", values.brandId);
      formData.append("proteinSources", values.proteinSources || "");
      formData.append("countryOfOrigin", values.countryOfOrigin || "");
      formData.append("subCategoryId", values.subCategoryId);
      formData.append("isDisplayed", values.isDisplayed ?? true);

      await adminService.updateProduct(selectedProduct.id, formData);
      toast.success("Cập nhật sản phẩm thành công");
      setIsUpdateModalOpen(false);
      form.resetFields();

      // Refresh product details
      const response = await adminService.viewProductsDetails(
        selectedProduct.id
      );
      setSelectedProduct(response.data);

      // Refresh product list
      fetchProducts(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật sản phẩm");
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenCreateDetailModal = () => {
    if (selectedProduct) {
      fetchWeightsAndFlavours();
      console.log("Opening Create Detail Modal for product:", selectedProduct);
      setIsCreateDetailModalOpen(true);
      detailForm.resetFields();
      setImageFile(null);
    }
  };

  const handleDetailImageUpload = (file) => {
    setImageFile(file);
  };

  const handleDetailImageRemove = () => {
    setImageFile(null);
  };

  const handleCreateProductDetail = async (values) => {
    if (!selectedProduct) return;
    if (!imageFile) {
      toast.error("Vui lòng chọn ảnh sản phẩm");
      return;
    }

    setCreating(true);
    try {
      const formData = new FormData();
      formData.append("productId", selectedProduct.id);
      formData.append("weightId", values.weightId);
      formData.append("flavourId", values.flavourId);
      formData.append("image", imageFile);
      formData.append("quantity", values.quantity);
      formData.append("originalPrice", values.originalPrice);
      formData.append("displayPrice", values.displayPrice);
      formData.append("salePrice", values.salePrice || values.displayPrice);
      formData.append(
        "expirationDate",
        values.expirationDate.format("YYYY-MM-DD")
      );
      formData.append(
        "servingSizeInformation",
        values.servingSizeInformation || ""
      );
      formData.append(
        "servingsPerContainerInformation",
        values.servingsPerContainerInformation || ""
      );
      formData.append(
        "proteinPerServingGrams",
        values.proteinPerServingGrams || 0
      );
      formData.append(
        "caloriesPerServingKcal",
        values.caloriesPerServingKcal || 0
      );
      formData.append("bcaaPerServingGrams", values.bcaaPerServingGrams || 0);
      formData.append("isDisplayed", values.isDisplayed ?? true);

      await adminService.createProductsDetails(formData);
      toast.success("Tạo lô hàng thành công");
      setIsCreateDetailModalOpen(false);
      detailForm.resetFields();
      setImageFile(null);

      // Refresh product details
      const response = await adminService.viewProductsDetails(
        selectedProduct.id
      );
      setSelectedProduct(response.data);
    } catch (error) {
      console.error("Error creating product detail:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tạo lô hàng");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenCreateProductModal = async () => {
    createProductForm.resetFields();
    setImageFile(null);
    setSelectedCategoryId(null);
    setFilteredSubCategories([]);
    await fetchBrandsAndCategories();
    await fetchMainCategories(); // This fetches both main and sub categories
    setIsCreateProductModalOpen(true);
  };

  const handleCreateProductImageUpload = (file) => {
    setImageFile(file);
  };

  const handleCreateProductImageRemove = () => {
    setImageFile(null);
  };

  const handleCreateProduct = async (values) => {
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("brandId", values.brandId);
      formData.append("subCategoryId", values.subCategoryId);
      formData.append("countryOfOrigin", values.countryOfOrigin || "");
      formData.append("proteinSources", values.proteinSources || "");
      formData.append("isDisplayed", values.isDisplayed ?? true);

      // Add coverImage file if selected
      if (imageFile) {
        formData.append("coverImage", imageFile);
      }

      await adminService.createProduct(formData);
      toast.success("Tạo sản phẩm thành công");
      setIsCreateProductModalOpen(false);
      createProductForm.resetFields();
      setImageFile(null);
      setSelectedCategoryId(null);
      setFilteredSubCategories([]);

      // Refresh product list
      fetchProducts(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tạo sản phẩm");
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    {
      title: "Sản Phẩm",
      dataIndex: "name",
      key: "name",
      width: 250,
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Image
            width={50}
            height={50}
            src={record.coverImageUrl || defaultImage}
            alt={text}
            fallback={defaultImage}
            className="rounded-lg object-cover"
            preview={false}
          />
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-xs text-gray-500">{record.brandName}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Danh Mục",
      dataIndex: "subCategoryName",
      key: "subCategoryName",
      align: "center",
      width: 150,
      render: (text) => (
        <Tag icon={<AppstoreOutlined />} color="blue">
          {text || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Thương Hiệu",
      dataIndex: "brandName",
      key: "brandName",
      align: "center",
      width: 150,
      render: (text) => (
        <Tag icon={<AppstoreOutlined />} color="blue">
          {text || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Xuất Xứ",
      dataIndex: "countryOfOrigin",
      key: "countryOfOrigin",
      align: "center",
      width: 100,
      render: (text) => <Tag color="green">{text || "N/A"}</Tag>,
    },
    {
      title: "Nguồn Protein",
      dataIndex: "proteinSources",
      key: "proteinSources",
      align: "center",
      width: 150,
      render: (text) => (
        <div className="text-xs text-gray-700 font-bold">{text || "N/A"}</div>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "isDisplayed",
      key: "isDisplayed",
      align: "center",
      width: 120,
      render: (isDisplayed) => (
        <Tag
          icon={isDisplayed ? <CheckCircleOutlined /> : <StopOutlined />}
          color={isDisplayed ? "success" : "error"}
          className="px-3 py-1 "
        >
          {isDisplayed ? "Hiển thị" : "Ẩn"}
        </Tag>
      ),
    },
    {
      title: "Cập Nhật Lần Cuối",
      dataIndex: "updatedAt",
      key: "updatedAt",
      align: "center",
      width: 120,
      render: (date) => (
        <div>
          <div className="text-xs text-gray-600">
            {date ? new Date(date).toLocaleDateString("vi-VN") : "N/A"}
          </div>
          <div className="text-xs text-gray-500">
            {date ? new Date(date).toLocaleTimeString("vi-VN") : ""}
          </div>
        </div>
      ),
    },
  ];

  // Extract unique values for filters
  const uniqueBrands = [
    ...new Set(products.map((p) => p.brandName).filter(Boolean)),
  ];
  const uniqueCountries = [
    ...new Set(products.map((p) => p.countryOfOrigin).filter(Boolean)),
  ];

  // Build TreeSelect data structure for categories
  const categoryTreeData = mainCategories.map((mainCat) => ({
    title: mainCat.name,
    value: `main-${mainCat.id}`,
    key: `main-${mainCat.id}`,
    selectable: false,
    children: subCategories
      .filter((subCat) => subCat.categoryId === mainCat.id)
      .map((subCat) => ({
        title: subCat.name,
        value: `${subCat.name}`,
        key: `${subCat.name}`,
        selectable: true,
      })),
  }));

  const filteredData = products.filter((item) => {
    const matchesSearch = searchText
      ? (item.name?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
        (item.brandName?.toLowerCase() || "").includes(searchText.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "displayed" && item.isDisplayed) ||
      (statusFilter === "hidden" && !item.isDisplayed);

    const matchesBrand =
      brandFilter === "all" || item.brandName === brandFilter;

    // Handle TreeSelect category filter
    let matchesCategory = true;
    if (categoryFilter) {
      if (categoryFilter.startsWith("main-")) {
        const mainCatId = parseInt(categoryFilter.replace("main-", ""));
        const subCat = subCategories.find((sc) => sc.id === item.subCategoryId);
        matchesCategory = subCat?.categoryId === mainCatId;
      } else {
        const subCatName = categoryFilter;
        console.log("Filtering by sub-category ID:", categoryFilter);
        matchesCategory = item.subCategoryName === subCatName;
      }
    }

    const matchesCountry =
      countryFilter === "all" || item.countryOfOrigin === countryFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesBrand &&
      matchesCategory &&
      matchesCountry
    );
  });

  if (loading && products.length === 0) {
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
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#ED2A46] mb-2">
          Quản Lý Sản Phẩm
        </h1>
        <p className="text-gray-600">
          Quản lý và theo dõi các sản phẩm trong hệ thống thương mại điện tử
        </p>
      </div>

      <div className="">
        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <Statistic
                title="Tổng Sản Phẩm"
                value={statistics.totalProducts}
                prefix={<ShoppingOutlined style={{ color: "#FF914D" }} />}
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
                title="Đang Hiển Thị"
                value={statistics.displayedProducts}
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
                title="Đang Ẩn"
                value={statistics.hiddenProducts}
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
                title="Tổng Đã Bán"
                value={statistics.totalSold}
                prefix={<DollarOutlined style={{ color: "#1890ff" }} />}
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
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Tìm kiếm theo tên sản phẩm, thương hiệu..."
                  prefix={<SearchOutlined className="text-gray-400" />}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 320 }}
                  allowClear
                  className="rounded-lg"
                />
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreateProductModal}
                className="bg-gradient-to-r from-orange-400 to-orange-500 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                size="large"
                loading={creating}
              >
                Thêm Sản Phẩm
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 180 }}
                className="rounded-lg"
                placeholder="Trạng thái"
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="displayed">Đang hiển thị</Option>
                <Option value="hidden">Đang ẩn</Option>
              </Select>
              <Select
                value={brandFilter}
                onChange={setBrandFilter}
                style={{ width: 180 }}
                className="rounded-lg"
                placeholder="Thương hiệu"
                showSearch
                optionFilterProp="children"
              >
                <Option value="all">Tất cả thương hiệu</Option>
                {uniqueBrands.map((brand) => (
                  <Option key={brand} value={brand}>
                    {brand}
                  </Option>
                ))}
              </Select>
              <TreeSelect
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 250 }}
                className="rounded-lg"
                placeholder="Chọn danh mục"
                showSearch
                treeDefaultExpandAll
                allowClear
                treeData={categoryTreeData}
                suffixIcon={<AppstoreOutlined className="text-blue-500" />}
              />
              <Select
                value={countryFilter}
                onChange={setCountryFilter}
                style={{ width: 180 }}
                className="rounded-lg"
                placeholder="Xuất xứ"
                showSearch
                optionFilterProp="children"
              >
                <Option value="all">Tất cả xuất xứ</Option>
                {uniqueCountries.map((country) => (
                  <Option key={country} value={country}>
                    {country}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">
              Hiển thị{" "}
              <span className="font-semibold text-orange-600">
                {filteredData.length}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold">{statistics.totalProducts}</span>{" "}
              sản phẩm
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
              loading={loading}
              onRow={(record) => ({
                onClick: () => handleViewDetails(record.id),
                style: { cursor: "pointer" },
              })}
            />
          </ConfigProvider>
        </Card>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={isModalDetailOpen}
        onClose={() => {
          setIsModalDetailOpen(false);
          setSelectedProduct(null);
        }}
        selectedProduct={selectedProduct}
        onUpdate={handleOpenUpdateModal}
        onCreateDetail={handleOpenCreateDetailModal}
      />

      {/* Update Product Modal */}
      <UpdateProductModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          form.resetFields();
          setSelectedCategoryId(null);
          setFilteredSubCategories([]);
        }}
        onSubmit={handleUpdateProduct}
        form={form}
        brands={brands}
        mainCategories={mainCategories}
        filteredSubCategories={filteredSubCategories}
        selectedCategoryId={selectedCategoryId}
        onRefreshSubCategories={refreshSubCategoriesForCategory}
        updating={updating}
      />

      {/* Create Product Detail Modal */}
      <CreateProductDetailModal
        isOpen={isCreateDetailModalOpen}
        onClose={() => {
          setIsCreateDetailModalOpen(false);
          detailForm.resetFields();
          setImageFile(null);
        }}
        onSubmit={handleCreateProductDetail}
        form={detailForm}
        weights={weights}
        flavours={flavours}
        creating={creating}
        imageFile={imageFile}
        onImageUpload={handleDetailImageUpload}
        onImageRemove={handleDetailImageRemove}
        onRefreshCategories={fetchMainCategories}
        onRefreshWeights={fetchWeightsAndFlavours}
        onRefreshFlavours={fetchWeightsAndFlavours}
      />

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={isCreateProductModalOpen}
        onClose={() => {
          setIsCreateProductModalOpen(false);
          createProductForm.resetFields();
          setImageFile(null);
          setSelectedCategoryId(null);
          setFilteredSubCategories([]);
        }}
        onSubmit={handleCreateProduct}
        form={createProductForm}
        brands={brands}
        mainCategories={mainCategories}
        subCategories={subCategories}
        filteredSubCategories={filteredSubCategories}
        selectedCategoryId={selectedCategoryId}
        onCategoryChange={handleCategoryChange}
        creating={creating}
        imageFile={imageFile}
        onImageUpload={handleCreateProductImageUpload}
        onImageRemove={handleCreateProductImageRemove}
        onRefreshCategories={fetchMainCategories}
        onRefreshSubcategories={refreshSubCategoriesForCategory}
      />

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
