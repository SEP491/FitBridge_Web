import React, { useState, useEffect } from "react";
import { DatePicker, Row, Col, Card } from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import dashboardService from "../../../services/dashboardService";
import mockedData from "./mockedData";
import { DollarOutlined, ClockCircleOutlined } from "@ant-design/icons";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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

export default function DashboardGym() {
  // Set initial date range to full current year so all months are visible
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("year"),
    dayjs().endOf("year"),
  ]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [revenueItems, setRevenueItems] = useState([]);
  const [walletBalance, setWalletBalance] = useState({
    totalAvailableBalance: 0,
    totalPendingBalance: 0,
  });
  const [loadingWalletBalance, setLoadingWalletBalance] = useState(false);

  // Fetch wallet balance (available + pending) - same as ManageGymTransaction
  const fetchWalletBalance = async () => {
    setLoadingWalletBalance(true);
    try {
      const response = await dashboardService.getBalanceOfGym({});
      const data = response.data || {};
      setWalletBalance({
        totalAvailableBalance: data.totalAvailableBalance || 0,
        totalPendingBalance: data.totalPendingBalance || 0,
      });
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      setWalletBalance({
        totalAvailableBalance: 0,
        totalPendingBalance: 0,
      });
    } finally {
      setLoadingWalletBalance(false);
    }
  };

  // API function to fetch gym revenue detail data (mocked for testing)
  const fetchGymRevenueData = async () => {
    setLoading(true);
    try {
      // Using mocked data instead of real API for testing
      const apiData = mockedData.data || {};
      const items = apiData.items || [];

      // Save raw revenue items for the detailed table
      setRevenueItems(items);

      // Aggregate by month of plannedDistributionDate (or skip if no date)
      const aggregated = {};

      items.forEach((item) => {
        const dateSource = item.plannedDistributionDate;
        if (!dateSource) return;

        const monthKey = dayjs(dateSource).format("YYYY-MM");

        if (!aggregated[monthKey]) {
          aggregated[monthKey] = {
            totalRevenue: 0,
            appCommission: 0,
            paybackToGym: 0,
          };
        }

        const subTotal = item.subTotal || 0;
        const systemProfit = item.systemProfit || 0;
        const totalProfit = item.totalProfit || 0;

        aggregated[monthKey].totalRevenue += subTotal;
        aggregated[monthKey].appCommission += systemProfit;
        aggregated[monthKey].paybackToGym += totalProfit;
      });

      const aggregatedArray = Object.keys(aggregated)
        .sort()
        .map((monthKey) => ({
          // Use first day of month as representative date
          date: dayjs(`${monthKey}-01`).format("YYYY-MM-DD"),
          totalRevenue: aggregated[monthKey].totalRevenue,
          appCommission: aggregated[monthKey].appCommission,
          paybackToGym: aggregated[monthKey].paybackToGym,
        }));

      setData(aggregatedArray);
    } catch (error) {
      console.error("Error fetching gym revenue data:", error);
      setData([]); // Set empty array on error
      setRevenueItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts (mock data is static)
  useEffect(() => {
    fetchGymRevenueData();
    fetchWalletBalance();
  }, []);

  // Filter data when data or dateRange changes
  useEffect(() => {
    if (dateRange && dateRange[0] && dateRange[1] && data.length > 0) {
      const startDate = dateRange[0].startOf("month").format("YYYY-MM-DD");
      const endDate = dateRange[1].endOf("month").format("YYYY-MM-DD");

      const filtered = data.filter(
        (item) => item.date >= startDate && item.date <= endDate
      );
      setFilteredData(filtered);
    } else {
      setFilteredData([]);
    }
  }, [data, dateRange]); // Dependencies: data and dateRange

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    // With mocked data, we only filter client-side; no refetch needed
  };

  // Calculate metrics
  const totalRevenue = filteredData.reduce(
    (sum, item) => sum + (item.totalRevenue || 0),
    0
  );
  const totalAppCommission = filteredData.reduce(
    (sum, item) => sum + (item.appCommission || 0),
    0
  );
  const totalpaybackToGym = filteredData.reduce(
    (sum, item) => sum + (item.paybackToGym || 0),
    0
  );

  // Calculate average values
  const avgRevenue =
    filteredData.length > 0 ? totalRevenue / filteredData.length : 0;

  // Chart configuration
  const chartData = {
    labels: filteredData.map((item) => dayjs(item.date).format("MM/YYYY")),
    datasets: [
      {
        label: "Tổng Doanh Thu",
        data: filteredData.map((item) => item.totalRevenue || 0),
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Hoa Hồng App (10%)",
        data: filteredData.map((item) => item.appCommission || 0),
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Tiền Về Chủ Gym (90%)",
        data: filteredData.map((item) => item.paybackToGym || 0),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#374151",
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      title: {
        display: true,
        text: "Xu Hướng Doanh Thu & Lợi Nhuận Phòng Gym",
        color: "#111827",
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
        borderColor: "#3B82F6",
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
          color: "#6B7280",
        },
      },
      y: {
        display: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#6B7280",
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

  return (
    <div className="min-h-screen  ">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#ED2A46] flex items-center gap-2 mb-4">
            <DollarOutlined style={{ marginRight: 12, color: "#ed2a46" }} />
            Bảng Điều Khiển Doanh Thu Phòng Gym
          </h1>
          <p style={{ color: "#6b7280", marginTop: 8, marginBottom: 0 }}>
            Theo dõi doanh thu từ bán khóa học và hoa hồng ứng dụng
          </p>
        </div>

        {/* Wallet Balance Row (Available & Pending) */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} md={12}>
            <Card className="border-0 shadow-md bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Số dư khả dụng
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-emerald-600">
                    {loadingWalletBalance
                      ? "Đang tải..."
                      : formatVND(walletBalance.totalAvailableBalance)}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                  <DollarOutlined className="text-white text-2xl" />
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className="border-0 shadow-md bg-gradient-to-r from-amber-50 to-yellow-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Số dư đang xử lý
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-amber-600">
                    {loadingWalletBalance
                      ? "Đang tải..."
                      : formatVND(walletBalance.totalPendingBalance)}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
                  <ClockCircleOutlined className="text-white text-2xl" />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

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

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Tổng Doanh Thu
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatVND(totalRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Hoa Hồng App (10%)
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  - {formatVND(totalAppCommission)}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-amber-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Tiền Về Chủ Gym (90%)
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatVND(totalpaybackToGym)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Doanh Thu Trung Bình
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatVND(avgRevenue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-purple-500 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-96">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Dữ Liệu Chi Tiết
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng Doanh Thu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hoa Hồng App (10%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiền Về Phòng Gym (90%)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revenueItems.map((item, index) => (
                  <tr key={item.orderItemId || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.plannedDistributionDate
                        ? dayjs(item.plannedDistributionDate).format(
                            "DD/MM/YYYY"
                          )
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {formatVND(item.subTotal || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600 font-medium">
                      - {formatVND(item.systemProfit || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {formatVND(item.totalProfit || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
