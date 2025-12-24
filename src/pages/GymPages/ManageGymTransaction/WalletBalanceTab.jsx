import { Card, ConfigProvider, Table, Button } from "antd";
import { FaMoneyBillWave } from "react-icons/fa";

export default function WalletBalanceTab({
  walletFilter,
  setWalletFilter,
  pendingTotalProfit,
  pendingItems,
  pendingColumns,
  loadingPendingDetails,
  availableTotalProfit,
  availableItems,
  simpleWalletColumns,
  loadingAvailableDetails,
  disbursementTotalProfit,
  disbursementItems,
  loadingDisbursementDetails,
  renderSignedAmount,
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Wallet filter buttons */}
      <div className="flex flex-wrap gap-2 mb-2">
        <Button
          type={walletFilter === "all" ? "primary" : "default"}
          onClick={() => setWalletFilter("all")}
          size="middle"
        >
          Tất cả
        </Button>
        <Button
          type={walletFilter === "available" ? "primary" : "default"}
          onClick={() => setWalletFilter("available")}
          size="middle"
        >
          Số dư khả dụng
        </Button>
        <Button
          type={walletFilter === "pending" ? "primary" : "default"}
          onClick={() => setWalletFilter("pending")}
          size="middle"
        >
          Số dư đang xử lý
        </Button>
        <Button
          type={walletFilter === "disbursement" ? "primary" : "default"}
          onClick={() => setWalletFilter("disbursement")}
          size="middle"
        >
         So tiền đã giải ngân
        </Button>
      </div>

      {/* Pending Balance Card */}
      {(walletFilter === "all" || walletFilter === "pending") && (
        <Card className="border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-gray-500">
                Số dư đang xử lý
              </div>
              <div className="text-2xl font-bold">
                {renderSignedAmount(
                  pendingTotalProfit,
                  "text-green-600",
                  "text-red-600"
                )}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <FaMoneyBillWave className="text-amber-600" />
            </div>
          </div>
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  headerBg: "#FFF7E6",
                  headerColor: "#7C5300",
                  rowHoverBg: "#FFFDF5",
                },
              },
            }}
          >
            <Table
              dataSource={pendingItems}
              columns={pendingColumns}
              loading={loadingPendingDetails}
              pagination={false}
              size="middle"
              rowKey={(record) =>
                record.transactionDetail?.transactionId || record.orderItemId
              }
            />
          </ConfigProvider>
        </Card>
      )}

      {/* Available Balance Card */}
      {(walletFilter === "all" || walletFilter === "available") && (
        <Card className="border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-gray-500">
                Chi tiết số dư khả dụng
              </div>
              <div className="text-2xl font-bold">
                {renderSignedAmount(
                  availableTotalProfit,
                  "text-green-600",
                  "text-red-600"
                )}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <FaMoneyBillWave className="text-emerald-600" />
            </div>
          </div>
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  headerBg: "#E6FFFB",
                  headerColor: "#006D75",
                  rowHoverBg: "#F5FFFD",
                },
              },
            }}
          >
            <Table
              dataSource={availableItems}
              columns={simpleWalletColumns}
              loading={loadingAvailableDetails}
              pagination={false}
              size="middle"
              rowKey={(record) => record.transactionId}
            />
          </ConfigProvider>
        </Card>
      )}

      {/* Disbursement Card */}
      {(walletFilter === "all" || walletFilter === "disbursement") && (
        <Card className="border-0 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-gray-500">
                Chi tiết giải ngân
              </div>
              <div className="text-2xl font-bold">
                {renderSignedAmount(
                  disbursementTotalProfit,
                  "text-green-600",
                  "text-red-600"
                )}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FaMoneyBillWave className="text-blue-600" />
            </div>
          </div>
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  headerBg: "#E6F4FF",
                  headerColor: "#0958D9",
                  rowHoverBg: "#F5FAFF",
                },
              },
            }}
          >
            <Table
              dataSource={disbursementItems}
              columns={simpleWalletColumns}
              loading={loadingDisbursementDetails}
              pagination={false}
              size="middle"
              rowKey={(record) => record.transactionId}
            />
          </ConfigProvider>
        </Card>
      )}
    </div>
  );
}

