import React, { useState, useEffect } from "react";
import { DatePicker, Table, Tag } from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Line } from "react-chartjs-2";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import dashboardService from "../../../services/dashboardService";
import { DollarOutlined, RiseOutlined, PercentageOutlined, DownCircleOutlined } from "@ant-design/icons";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

dayjs.locale("vi");

const { RangePicker } = DatePicker;

// Format VND currency
const formatVND = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DashboardPage() {
  // Set initial date range to past 2 weeks to current date
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(2, "week"),
    dayjs(),
  ]);
  const [loading, setLoading] = useState(false);
  const [financialData, setFinancialData] = useState({
    summaryCards: {
      totalRevenue: 0,
      totalProfit: 0,
      totalProductProfit: 0,
      totalGymCourseProfit: 0,
      totalFreelanceProfit: 0,
      totalSubscriptionProfit: 0,
    },
    profitDistributionChart: [],
    recentTransactionsTable: {
      total: 0,
      items: [],
    },
  });
  const [aggregatedData, setAggregatedData] = useState([]);

  // API function to fetch financial stats
  const fetchFinancialStats = async (startDate, endDate) => {
    setLoading(true);
    const params = {
      startDate: startDate,
      endDate: endDate,
      doApplyPaging: false,
    };
    try {
      const response = await dashboardService.getFinancialStats(params);
      console.log(response.data);
      if (response.data) {
        setFinancialData(response.data);
        
        // Aggregate transactions by month for line chart
        const transactions = response.data.recentTransactionsTable?.items || [];
        const aggregated = {};
        
        transactions.forEach((item) => {
          const monthKey = dayjs(item.createdAt).format("YYYY-MM");
          
          if (!aggregated[monthKey]) {
            aggregated[monthKey] = {
              totalRevenue: 0,
              totalProfit: 0,
              transactionCount: 0,
            };
          }
          
          aggregated[monthKey].totalRevenue += item.totalAmount || 0;
          aggregated[monthKey].totalProfit += item.profitAmount || 0;
          aggregated[monthKey].transactionCount += 1;
        });
        
        const aggregatedArray = Object.keys(aggregated)
          .sort()
          .map((monthKey) => ({
            date: `${monthKey}-01`,
            totalRevenue: aggregated[monthKey].totalRevenue,
            totalProfit: aggregated[monthKey].totalProfit,
            transactionCount: aggregated[monthKey].transactionCount,
          }));
        
        setAggregatedData(aggregatedArray);
      }
    } catch (error) {
      console.error("Error fetching financial stats:", error);
      setFinancialData({
        summaryCards: {
          totalRevenue: 0,
          totalProfit: 0,
          totalProductProfit: 0,
          totalGymCourseProfit: 0,
          totalFreelanceProfit: 0,
          totalSubscriptionProfit: 0,
        },
        profitDistributionChart: [],
        recentTransactionsTable: {
          total: 0,
          items: [],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].format("YYYY-MM-DD");
      const endDate = dateRange[1].format("YYYY-MM-DD");
      fetchFinancialStats(startDate, endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array for initial load only

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    if (dates && dates[0] && dates[1]) {
      const startDate = dates[0].format("YYYY-MM-DD");
      const endDate = dates[1].format("YYYY-MM-DD");
      fetchFinancialStats(startDate, endDate, 1);
    }
  };

  const handleTableChange = () => {
    
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].format("YYYY-MM-DD");
      const endDate = dateRange[1].format("YYYY-MM-DD");
      fetchFinancialStats(startDate, endDate);
    }
  };

  const { summaryCards, profitDistributionChart, recentTransactionsTable } = financialData;

  // Pie Chart configuration for profit distribution
  const pieChartData = {
    labels: profitDistributionChart.map((item) => item.label),
    datasets: [
      {
        label: "Lợi Nhuận",
        data: profitDistributionChart.map((item) => item.value),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // Blue for Product
          "rgba(16, 185, 129, 0.8)", // Green for Gym Course
          "rgba(245, 158, 11, 0.8)", // Orange for Freelance PT
          "rgba(239, 68, 68, 0.8)", // Red for Subscription
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#333",
          font: {
            size: 12,
            weight: "500",
          },
          padding: 15,
          generateLabels: function (chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const percentage = profitDistributionChart[i]?.percentage || 0;
                return {
                  text: `${label}: ${formatVND(value)} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: 2,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      title: {
        display: true,
        text: "Phân Phối Lợi Nhuận Theo Loại",
        color: "#333",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "#ed2a47c9",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const percentage = profitDistributionChart[context.dataIndex]?.percentage || 0;
            return `${label}: ${formatVND(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Line Chart configuration for revenue trend
  const lineChartData = {
    labels: aggregatedData.map((item) => dayjs(item.date).format("MM/YYYY")),
    datasets: [
      {
        label: "Tổng Doanh Thu",
        data: aggregatedData.map((item) => item.totalRevenue || 0),
        borderColor: "#ed2a47c9",
        backgroundColor: "rgba(237, 42, 71, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Lợi Nhuận",
        data: aggregatedData.map((item) => item.totalProfit || 0),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#333",
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      title: {
        display: true,
        text: "Xu Hướng Doanh Thu & Lợi Nhuận Theo Tháng",
        color: "#333",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "#ed2a47c9",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#666",
        },
      },
      y: {
        display: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#666",
          callback: function (value) {
            return formatVND(value);
          },
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  // Table columns configuration
  const columns = [
    {
      title: "Mã Đơn Hàng",
      dataIndex: "orderCode",
      key: "orderCode",
      render: (text) => <span className="font-medium text-gray-900">{text}</span>,
    },
    {
      title: "Khách Hàng",
      key: "customer",
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-900">{record.customerFullName}</div>
          <div className="text-sm text-gray-500">{record.customerContact}</div>
        </div>
      ),
    },
    {
      title: "Loại Giao Dịch",
      dataIndex: "transactionType",
      key: "transactionType",
      render: (type) => {
        const typeMap = {
          GymCourse: { text: "Gói Tập Gym", color: "green" },
          FreelancePTPackage: { text: "Gói Freelance PT", color: "orange" },
          SubscriptionPlansOrder: { text: "Đăng Ký Membership", color: "red" },
          RenewalSubscriptionPlansOrder: { text: "Gia Hạn Membership", color: "purple" },
          ProductOrder: { text: "Mua Sản Phẩm", color: "blue" },
          ExtendFreelancePTPackage: { text: "Gia Hạn Freelance PT", color: "gold" },
          ExtendCourse: { text: "Gia Hạn Gói Tập Gym", color: "cyan" },
          
        };
        const mapped = typeMap[type] || { text: type, color: "default" };
        return <Tag color={mapped.color}>{mapped.text}</Tag>;
      },
    },
    {
      title: "Tổng Tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => <span className="text-gray-900">{formatVND(amount)}</span>,
    },
    {
      title: "Lợi Nhuận",
      dataIndex: "profitAmount",
      key: "profitAmount",
      render: (profit) => (
        <span className="text-green-600 font-medium">{formatVND(profit)}</span>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          Success: { text: "Thành Công", color: "success" },
          Pending: { text: "Đang Xử Lý", color: "processing" },
          Failed: { text: "Thất Bại", color: "error" },
          Cancelled: { text: "Đã Hủy", color: "default" },
        };
        const mapped = statusMap[status] || { text: status, color: "default" };
        return <Tag color={mapped.color}>{mapped.text}</Tag>;
      },
    },
    {
      title: "Ngày Tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <span className="text-gray-700">
          {dayjs(date).format("DD/MM/YYYY HH:mm")}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bảng Điều Khiển Tài Chính
          </h1>
          <p className="text-gray-600">
            Theo dõi doanh thu, lợi nhuận và giao dịch từ tất cả các nguồn
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Lọc Theo Khoảng Thời Gian
            </h2>
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              className="border-2 border-gray-200 rounded-lg"
              size="large"
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
            />
          </div>
        </div>

        {/* Summary Cards - Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">
                  Tổng Doanh Thu
                </p>
                <p className="text-3xl font-bold">
                  {formatVND(summaryCards.totalRevenue)}
                </p>
              </div>
              <div className="w-16 h-16 bg-opacity-20 rounded-full flex items-center justify-center">
                <DollarOutlined className="text-5xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">
                  Tổng Lợi Nhuận
                </p>
                <p className="text-3xl font-bold">
                  {formatVND(summaryCards.totalProfit)}
                </p>
              </div>
              <div className="w-16 h-16 bg-opacity-20 rounded-full flex items-center justify-center">
                <DownCircleOutlined className="text-5xl" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">
                  Tỷ Lệ Lợi Nhuận
                </p>
                <p className="text-3xl font-bold">
                  {summaryCards.totalRevenue > 0
                    ? ((summaryCards.totalProfit / summaryCards.totalRevenue) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
              <div className="w-16 h-16 bg-opacity-20 rounded-full flex items-center justify-center">
                <PercentageOutlined className="text-5xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Profit Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-500 rounded"></div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Lợi Nhuận Sản Phẩm
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatVND(summaryCards.totalProductProfit)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Lợi Nhuận Khóa Gym
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatVND(summaryCards.totalGymCourseProfit)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-500 rounded"></div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Lợi Nhuận Freelance PT
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatVND(summaryCards.totalFreelanceProfit)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-red-500 rounded"></div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Lợi Nhuận Đăng Ký
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {formatVND(summaryCards.totalSubscriptionProfit)}
            </p>
          </div>
        </div>

        {/* Profit Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="h-96">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              </div>
            ) : profitDistributionChart.length > 0 ? (
              <Pie data={pieChartData} options={pieChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Không có dữ liệu phân phối lợi nhuận</p>
              </div>
            )}
          </div>
        </div>

        {/* Revenue Trend Line Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="h-96">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              </div>
            ) : aggregatedData.length > 0 ? (
              <Line data={lineChartData} options={lineChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Không có dữ liệu xu hướng doanh thu</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Giao Dịch Gần Đây
          </h3>
          <Table
            columns={columns}
            dataSource={recentTransactionsTable.items}
            rowKey="transactionId"
            loading={loading}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
          />
        </div>
      </div>
    </div>
  );
}
