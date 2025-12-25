import React, { useState } from "react";
import { Breadcrumb, Layout } from "antd";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Link, Outlet, useLocation } from "react-router-dom";
import SidebarAdmin from "../../components/SidebarAdmin/SidebarAdmin";
import HeaderAdmin from "../../components/HeaderAdmin/HeaderAdmin";
const { Sider, Content } = Layout;

// Vietnamese breadcrumb text mapping
const breadcrumbTextMap = {
  // Admin routes
  admin: "Quản trị viên",
  dashboard: "Bảng điều khiển",
  "manage-gym": "Quản lý phòng gym",
  "manage-pt": "Quản lý PT",
  "manage-packages": "Quản lý gói tập",
  "manage-user": "Quản lý người dùng",
  "manage-notification": "Quản lý thông báo",
  "manage-transaction": "Quản lý giao dịch",
  "manage-voucher": "Quản lý voucher",
  "manage-withdrawal": "Quản lý rút tiền",
  "manage-report": "Quản lý báo cáo",
  "manage-product": "Quản lý sản phẩm",
  "manage-order": "Quản lý đơn hàng",
  "manage-contract": "Quản lý hợp đồng",
  "manage-certificate": "Quản lý chứng chỉ",
  "manage-assets": "Quản lý tài sản",
  
  // Gym routes
  gym: "Phòng gym",
  "dashboard-gym": "Bảng điều khiển",
  "manage-information-gym": "Quản lý thông tin",
  "manage-user-gym": "Quản lý khách hàng",
  "manage-pt-gym": "Quản lý PT",
  "manage-packages-gym": "Quản lý gói tập",
  "manage-transaction-gym": "Quản lý giao dịch",
  "manage-slot-gym": "Quản lý khung giờ",
  "manage-voucher-gym": "Quản lý voucher",
  "manage-pt-schedule": "Quản lý lịch PT",
  "contract-signing": "Ký hợp đồng",
  
  // Freelance PT routes
  "freelance-pt": "PT tự do",
  "dashboard-pt": "Bảng điều khiển",
  "manage-schedule-pt": "Quản lý lịch",
  "manage-voucher-pt": "Quản lý voucher",
  "manage-package-fpt": "Quản lý gói tập",
  
  // Other routes
  "order-process": "Xử lý đơn hàng",
  voucher: "Voucher",
};

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(
    JSON.parse(localStorage.getItem("sidebarCollapsed")) ?? false
  );

  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbItems = [];

    pathSegments.forEach((segment, index) => {
      const url = `/${pathSegments.slice(0, index + 1).join("/")}`;
      // Get Vietnamese text from mapping, fallback to formatted segment
      const title = breadcrumbTextMap[segment] || 
        (segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "));

      breadcrumbItems.push({
        title:
          index === pathSegments.length - 1 ? (
            title
          ) : (
            <Link to={url}>{title}</Link>
          ),
        key: url,
      });
    });

    return breadcrumbItems;
  };

  return (
    <Layout className="max-h-screen overflow-y-hidden !bg-[#1D1D1D]">
      <SidebarAdmin collapsed={collapsed} onCollapse={setCollapsed} />

      <Layout className="overflow-y-auto">
        <HeaderAdmin />

        <Content className="">
          {/* Breadcrumb Section */}
          <div className="bg-white shadow-sm  px-6 py-4">
            <Breadcrumb
              items={generateBreadcrumbs()}
              className="text-sm"
              separator="/"
            />
          </div>

          {/* Main Content Area */}
          <div className="p-6 ">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm  min-h-[calc(100vh-200px)]"
            >
              <div className="p-6">
                <Outlet />
              </div>
            </motion.div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
