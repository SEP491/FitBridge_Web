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

const { Option } = Select;

export default function ManageProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");

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
      const response = await adminService.getAllProducts({ page, size: pageSize });
      const { items, total, page: currentPage } = response.data;
      setProducts(items);

      // Calculate statistics
      const displayedProducts = items.filter((product) => product.isDisplayed).length;
      const hiddenProducts = items.filter((product) => !product.isDisplayed).length;

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
  }, []);

  const handleTableChange = (newPagination) => {
    fetchProducts(newPagination.current, newPagination.pageSize);
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
      render: (text) => (
        <Tag color="green">{text || "N/A"}</Tag>
      ),
    },
    {
      title: "Nguồn Protein",
      dataIndex: "proteinSources",
      key: "proteinSources",
      align: "center",
      width: 150,
      render: (text) => (
        <div className="text-xs text-gray-700 font-bold">
          {text || "N/A"}
        </div>
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
  const uniqueBrands = [...new Set(products.map(p => p.brandName).filter(Boolean))];
  const uniqueCategories = [...new Set(products.map(p => p.subCategoryName).filter(Boolean))];
  const uniqueCountries = [...new Set(products.map(p => p.countryOfOrigin).filter(Boolean))];

  const filteredData = products.filter((item) => {
    const matchesSearch = searchText
      ? (item.name?.toLowerCase() || "").includes(searchText.toLowerCase()) ||
        (item.brandName?.toLowerCase() || "").includes(searchText.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "displayed" && item.isDisplayed) ||
      (statusFilter === "hidden" && !item.isDisplayed);

    const matchesBrand = brandFilter === "all" || item.brandName === brandFilter;
    const matchesCategory = categoryFilter === "all" || item.subCategoryName === categoryFilter;
    const matchesCountry = countryFilter === "all" || item.countryOfOrigin === countryFilter;

    return matchesSearch && matchesStatus && matchesBrand && matchesCategory && matchesCountry;
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
    <div className="">
      <div className="">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản Lý Sản Phẩm
          </h1>
          <p className="text-gray-600">
            Quản lý và theo dõi các sản phẩm trong hệ thống thương mại điện tử
          </p>
        </div>

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
                onClick={() => console.log("Add product")}
                className="bg-gradient-to-r from-orange-400 to-orange-500 border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                size="large"
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
                {uniqueBrands.map(brand => (
                  <Option key={brand} value={brand}>{brand}</Option>
                ))}
              </Select>
              <Select
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: 180 }}
                className="rounded-lg"
                placeholder="Danh mục"
                showSearch
                optionFilterProp="children"
              >
                <Option value="all">Tất cả danh mục</Option>
                {uniqueCategories.map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
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
                {uniqueCountries.map(country => (
                  <Option key={country} value={country}>{country}</Option>
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
