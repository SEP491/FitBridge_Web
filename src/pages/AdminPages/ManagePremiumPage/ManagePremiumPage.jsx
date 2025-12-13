import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Card,
  Spin,
  Row,
  Col,
  Tag,
  Statistic,
  ConfigProvider,
  Button,
  Modal,
  Descriptions,
  Tabs,
  Space,
  Badge,
  Tooltip,
  Input,
  Form,
  DatePicker,
  Select,
  Popconfirm,
  InputNumber,
  Steps,
  Alert,
  Checkbox,
} from "antd";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  DollarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  LoadingOutlined,
  GlobalOutlined,
  MobileOutlined,
  AppleOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  ReloadOutlined,
  GiftOutlined,
  ProductOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  StopOutlined,
  UndoOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import revenueCatService from "../../../services/revenueCatService";
import appStoreConnectService from "../../../services/appStoreConnectService";
import toast from "react-hot-toast";
import dayjs from "dayjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

// Format currency
const formatCurrency = (value, unit = "$") => {
  if (value === null || value === undefined) return `${unit}0`;
  return `${unit}${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Format date from timestamp
const formatDate = (timestamp) => {
  if (!timestamp) return "Không có";
  return dayjs(timestamp).format("DD/MM/YYYY HH:mm");
};

export default function ManagePremiumPage() {
  const [metrics, setMetrics] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetailsModalVisible, setCustomerDetailsModalVisible] =
    useState(false);
  const [customerSubscriptions, setCustomerSubscriptions] = useState([]);
  const [customerEntitlements, setCustomerEntitlements] = useState([]);
  const [customerPurchases, setCustomerPurchases] = useState([]);
  const [loadingCustomerDetails, setLoadingCustomerDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  // Products state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsPagination, setProductsPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Entitlements state
  const [entitlements, setEntitlements] = useState([]);
  const [entitlementsLoading, setEntitlementsLoading] = useState(false);
  const [entitlementsPagination, setEntitlementsPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState([]);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false);
  const [subscriptionsPagination, setSubscriptionsPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [subscriptionSearchTerm, setSubscriptionSearchTerm] = useState("");

  // Offerings state
  const [offerings, setOfferings] = useState([]);
  const [offeringsLoading, setOfferingsLoading] = useState(false);

  // Grant/Revoke modals
  const [grantEntitlementModalVisible, setGrantEntitlementModalVisible] =
    useState(false);

  // Package management modals
  const [createPackageModalVisible, setCreatePackageModalVisible] =
    useState(false);
  const [attachProductsModalVisible, setAttachProductsModalVisible] =
    useState(false);
  const [selectedOffering, setSelectedOffering] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [offeringPackages, setOfferingPackages] = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(false);

  // Subscription Setup Wizard
  const [wizardVisible, setWizardVisible] = useState(false);
  const [wizardCurrentStep, setWizardCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    // App Store Connect data
    appStoreApp: null,
    subscriptionGroup: null,
    subscription: null,
    priceSchedule: null,
    // RevenueCat data
    product: null,
    entitlement: null,
    offering: null,
    package: null,
    pushToStore: false,
  });
  const [wizardLoading, setWizardLoading] = useState(false);
  const [apps, setApps] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appStoreApps, setAppStoreApps] = useState([]);
  const [appStoreAppsLoading, setAppStoreAppsLoading] = useState(false);
  const [appStoreCredentialsConfigured, setAppStoreCredentialsConfigured] =
    useState(false);
  const [pricePoints, setPricePoints] = useState([]);
  const [pricePointsLoading, setPricePointsLoading] = useState(false);

  // Fetch revenue metrics
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await revenueCatService.getChartRevenue();
      if (response.data && response.data.metrics) {
        setMetrics(response.data.metrics);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
      toast.error("Không thể tải dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers
  const fetchCustomers = useCallback(
    async (page = 1, limit = 20, search = "") => {
      setCustomersLoading(true);
      try {
        const params = {
          limit,
          ...(search && { search }),
        };
        const response = await revenueCatService.getCustomers(params);
        if (response.data) {
          setCustomers(response.data.items || []);
          setPagination((prev) => ({
            ...prev,
            current: page,
            total: response.data.items?.length || 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Không thể tải danh sách khách hàng");
      } finally {
        setCustomersLoading(false);
      }
    },
    []
  );

  // Fetch customer details
  const fetchCustomerDetails = useCallback(async (customerId) => {
    setLoadingCustomerDetails(true);
    try {
      const [customerRes, subscriptionsRes, entitlementsRes, purchasesRes] =
        await Promise.all([
          revenueCatService.getCustomer(customerId, { expand: ["attributes"] }),
          revenueCatService.getCustomerSubscriptions(customerId),
          revenueCatService.getCustomerActiveEntitlements(customerId),
          revenueCatService.getCustomerPurchases(customerId),
        ]);

      setSelectedCustomer(customerRes.data);
      setCustomerSubscriptions(subscriptionsRes.data?.items || []);
      setCustomerEntitlements(entitlementsRes.data?.items || []);
      setCustomerPurchases(purchasesRes.data?.items || []);
      setCustomerDetailsModalVisible(true);
    } catch (error) {
      console.error("Error fetching customer details:", error);
      toast.error("Không thể tải thông tin chi tiết khách hàng");
    } finally {
      setLoadingCustomerDetails(false);
    }
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async (page = 1, limit = 20) => {
    setProductsLoading(true);
    try {
      const params = { limit };
      const response = await revenueCatService.getProducts(params);
      if (response.data) {
        setProducts(response.data.items || []);
        setProductsPagination((prev) => ({
          ...prev,
          current: page,
          total: response.data.items?.length || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // Fetch entitlements
  const fetchEntitlements = useCallback(async (page = 1, limit = 20) => {
    setEntitlementsLoading(true);
    try {
      const params = { limit };
      const response = await revenueCatService.getEntitlements(params);
      if (response.data) {
        setEntitlements(response.data.items || []);
        setEntitlementsPagination((prev) => ({
          ...prev,
          current: page,
          total: response.data.items?.length || 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching entitlements:", error);
      toast.error("Không thể tải danh sách quyền truy cập");
    } finally {
      setEntitlementsLoading(false);
    }
  }, []);

  // Fetch subscriptions - requires store_subscription_identifier
  const fetchSubscriptions = useCallback(
    async (storeSubscriptionIdentifier) => {
      if (!storeSubscriptionIdentifier) {
        setSubscriptions([]);
        return;
      }
      setSubscriptionsLoading(true);
      try {
        const params = {
          store_subscription_identifier: storeSubscriptionIdentifier,
        };
        const response = await revenueCatService.searchSubscriptions(params);
        if (response.data) {
          setSubscriptions(response.data.items || []);
          setSubscriptionsPagination((prev) => ({
            ...prev,
            current: 1,
            total: response.data.items?.length || 0,
          }));
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
        if (error.response?.data?.type === "parameter_error") {
          toast.error(
            "Vui lòng nhập mã định danh đăng ký từ cửa hàng để tìm kiếm"
          );
        } else {
          toast.error("Không thể tải danh sách đăng ký");
        }
        setSubscriptions([]);
      } finally {
        setSubscriptionsLoading(false);
      }
    },
    []
  );

  // Handle subscription search
  const handleSubscriptionSearch = (value) => {
    setSubscriptionSearchTerm(value);
    if (value) {
      fetchSubscriptions(value);
    } else {
      setSubscriptions([]);
    }
  };

  // Fetch apps
  const fetchApps = useCallback(async () => {
    setAppsLoading(true);
    try {
      const response = await revenueCatService.getApps();
      if (response.data) {
        setApps(response.data.items || []);
      }
    } catch (error) {
      console.error("Error fetching apps:", error);
      toast.error("Không thể tải danh sách ứng dụng");
    } finally {
      setAppsLoading(false);
    }
  }, []);

  // Fetch offerings
  const fetchOfferings = useCallback(async () => {
    setOfferingsLoading(true);
    try {
      const response = await revenueCatService.getOfferings({
        expand: ["items.package"],
      });
      if (response.data) {
        setOfferings(response.data.items || []);
      }
    } catch (error) {
      console.error("Error fetching offerings:", error);
      toast.error("Không thể tải danh sách gói dịch vụ");
    } finally {
      setOfferingsLoading(false);
    }
  }, []);

  // Fetch packages for an offering
  const fetchOfferingPackages = useCallback(async (offeringId) => {
    setPackagesLoading(true);
    try {
      const response = await revenueCatService.getOfferingPackages(offeringId, {
        expand: ["items.product"],
      });
      if (response.data) {
        setOfferingPackages(response.data.items || []);
      }
    } catch (error) {
      console.error("Error fetching offering packages:", error);
      toast.error("Không thể tải danh sách gói");
    } finally {
      setPackagesLoading(false);
    }
  }, []);

  // Create a new package
  const handleCreatePackage = async (values) => {
    if (!selectedOffering) return;
    try {
      await revenueCatService.createPackage(selectedOffering.id, {
        lookup_key: values.lookup_key,
        display_name: values.display_name,
        position: values.position || undefined,
      });
      toast.success("Đã tạo gói thành công");
      setCreatePackageModalVisible(false);
      fetchOfferingPackages(selectedOffering.id);
      fetchOfferings();
    } catch (error) {
      console.error("Error creating package:", error);
      toast.error(error.response?.data?.message || "Không thể tạo gói");
    }
  };

  // Attach products to a package
  const handleAttachProducts = async (values) => {
    if (!selectedPackage) return;
    try {
      const products = values.products.map((product) => ({
        product_id: product.product_id,
        eligibility_criteria: product.eligibility_criteria || "all",
      }));
      await revenueCatService.attachProductsToPackage(selectedPackage.id, {
        products,
      });
      toast.success("Đã gắn sản phẩm vào gói thành công");
      setAttachProductsModalVisible(false);
      fetchOfferingPackages(selectedOffering.id);
    } catch (error) {
      console.error("Error attaching products:", error);
      toast.error(
        error.response?.data?.message || "Không thể gắn sản phẩm vào gói"
      );
    }
  };

  // Fetch App Store Connect apps
  const fetchAppStoreApps = async () => {
    if (!appStoreConnectService.hasCredentials()) {
      setAppStoreCredentialsConfigured(false);
      return;
    }

    setAppStoreAppsLoading(true);
    try {
      const response = await appStoreConnectService.getApps();
      setAppStoreApps(response.data || []);
      setAppStoreCredentialsConfigured(true);
    } catch (error) {
      console.error("Error fetching App Store apps:", error);
      setAppStoreCredentialsConfigured(false);
      if (error.response?.status === 401) {
        toast.error(
          "App Store Connect credentials không hợp lệ. Vui lòng kiểm tra lại."
        );
      }
    } finally {
      setAppStoreAppsLoading(false);
    }
  };

  // Check App Store Connect credentials
  useEffect(() => {
    if (wizardVisible) {
      const hasCreds = appStoreConnectService.hasCredentials();
      setAppStoreCredentialsConfigured(hasCreds);
      if (hasCreds) {
        fetchAppStoreApps();
      }
    }
  }, [wizardVisible]);

  // Fetch price points when entering step 2 (price setting)
  useEffect(() => {
    if (wizardCurrentStep === 2 && wizardData.subscription?.id) {
      const fetchPricePoints = async () => {
        setPricePointsLoading(true);
        try {
          const response =
            await appStoreConnectService.getSubscriptionPricePoints(
              wizardData.subscription.id
            );
          setPricePoints(response.data || []);
        } catch (error) {
          console.error("Error fetching price points:", error);
          toast.error("Không thể tải danh sách price points");
        } finally {
          setPricePointsLoading(false);
        }
      };
      fetchPricePoints();
    }
  }, [wizardCurrentStep, wizardData.subscription?.id]);

  // Wizard handlers
  const handleWizardStart = () => {
    setWizardVisible(true);
    setWizardCurrentStep(0);
    setWizardData({
      appStoreApp: null,
      subscriptionGroup: null,
      subscription: null,
      priceSchedule: null,
      product: null,
      entitlement: null,
      offering: null,
      package: null,
      pushToStore: false,
    });
    if (apps.length === 0) {
      fetchApps();
    }
    if (products.length === 0) {
      fetchProducts();
    }
    // Check App Store Connect credentials
    const hasCreds = appStoreConnectService.hasCredentials();
    setAppStoreCredentialsConfigured(hasCreds);
    if (hasCreds) {
      fetchAppStoreApps();
    }
  };

  const handleWizardStep = async (step, values) => {
    setWizardLoading(true);
    try {
      switch (step) {
        case 0: {
          // Step 0 is now handled in the form's onFinish
          // This case should not be reached, but kept for safety
          break;
        }

        case 1: {
          // Create Subscription Group and Subscription in App Store Connect
          if (!appStoreCredentialsConfigured) {
            setWizardCurrentStep(2);
            break;
          }

          try {
            // Create subscription group
            const groupRes =
              await appStoreConnectService.createSubscriptionGroup(
                values.app_store_app_id,
                values.subscription_group_name
              );
            const subscriptionGroup = groupRes.data;

            // Create subscription
            const subscriptionRes =
              await appStoreConnectService.createSubscription(
                subscriptionGroup.id,
                {
                  name: values.subscription_name,
                  productId: values.product_id,
                  subscriptionPeriod: values.subscription_period,
                  familySharable: values.family_sharable || false,
                }
              );
            const subscription = subscriptionRes.data;

            setWizardData((prev) => ({
              ...prev,
              appStoreApp: { id: values.app_store_app_id },
              subscriptionGroup: subscriptionGroup,
              subscription: subscription,
            }));

            toast.success(
              "Đã tạo subscription trong App Store Connect thành công"
            );
            setWizardCurrentStep(2);
          } catch (error) {
            console.error("Error creating App Store subscription:", error);
            toast.error(
              error.response?.data?.errors?.[0]?.detail ||
                error.message ||
                "Không thể tạo subscription trong App Store Connect"
            );
            // Continue to RevenueCat step anyway (skip price setting)
            setWizardCurrentStep(3);
          }
          break;
        }

        case 2: {
          // Set Price for Subscription in App Store Connect
          if (!wizardData.subscription) {
            // Skip if no subscription created
            setWizardCurrentStep(3);
            break;
          }

          try {
            const subscriptionId = wizardData.subscription.id;

            // Get available price points for the subscription
            const pricePointsRes =
              await appStoreConnectService.getSubscriptionPricePoints(
                subscriptionId
              );
            const pricePointsData = pricePointsRes.data || [];

            // Find the price point that matches the selected price
            let selectedPricePoint = null;

            if (values.price_point_id) {
              // Use selected price point
              selectedPricePoint = pricePointsData.find(
                (pp) => pp.id === values.price_point_id
              );
            }

            if (selectedPricePoint) {
              // Format start date if provided
              let startDate = null;
              if (values.start_date) {
                startDate = dayjs(values.start_date).format("YYYY-MM-DD");
              }

              // Create price schedule
              const priceScheduleRes =
                await appStoreConnectService.createSubscriptionPriceSchedule(
                  subscriptionId,
                  selectedPricePoint.id,
                  startDate
                );

              setWizardData((prev) => ({
                ...prev,
                priceSchedule: priceScheduleRes.data,
              }));

              toast.success("Đã thiết lập giá cho subscription thành công");
            } else {
              toast.info(
                "Không chọn price point. Bạn có thể thiết lập giá sau trong App Store Connect."
              );
            }

            setWizardCurrentStep(3);
          } catch (error) {
            console.error("Error setting subscription price:", error);
            toast.error(
              error.response?.data?.errors?.[0]?.detail ||
                error.message ||
                "Không thể thiết lập giá. Bạn có thể thiết lập sau trong App Store Connect."
            );
            // Continue anyway
            setWizardCurrentStep(3);
          }
          break;
        }

        case 3: {
          // Create Product in RevenueCat
          const selectedApp = apps.find((app) => app.id === values.app_id);
          const appType = selectedApp?.type;

          // Use subscription from App Store Connect if available
          const storeIdentifier = wizardData.subscription
            ? wizardData.subscription.attributes?.productId ||
              values.store_identifier
            : values.store_identifier;

          const productData = {
            store_identifier: storeIdentifier,
            app_id: values.app_id,
            type: values.type,
            display_name:
              values.display_name ||
              (wizardData.subscription
                ? wizardData.subscription.attributes?.name
                : values.display_name),
          };

          // For Test Store products, add subscription duration and title if it's a subscription
          if (appType === "test" && values.type === "subscription") {
            if (values.subscription_duration) {
              productData.subscription = {
                duration: values.subscription_duration,
              };
            }
            if (values.title) {
              productData.title = values.title;
            }
          }

          const productRes = await revenueCatService.createProduct(productData);
          setWizardData((prev) => ({
            ...prev,
            product: productRes.data,
            pushToStore: values.push_to_store || false,
          }));

          toast.success("Đã tạo sản phẩm thành công");
          setWizardCurrentStep(4);
          break;
        }

        case 4: {
          // Create Entitlement
          const entitlementRes = await revenueCatService.createEntitlement({
            lookup_key: values.lookup_key,
            display_name: values.display_name,
          });
          setWizardData((prev) => ({
            ...prev,
            entitlement: entitlementRes.data,
          }));
          toast.success("Đã tạo quyền truy cập thành công");
          setWizardCurrentStep(5);
          break;
        }

        case 5: {
          // Attach Product to Entitlement
          await revenueCatService.attachProductsToEntitlement(
            wizardData.entitlement.id,
            {
              product_ids: [wizardData.product.id],
            }
          );
          toast.success("Đã gắn sản phẩm vào quyền truy cập thành công");
          setWizardCurrentStep(6);
          break;
        }

        case 6: {
          // Create Offering
          const offeringRes = await revenueCatService.createOffering({
            lookup_key: values.lookup_key,
            display_name: values.display_name,
          });
          setWizardData((prev) => ({ ...prev, offering: offeringRes.data }));
          toast.success("Đã tạo gói dịch vụ thành công");
          setWizardCurrentStep(7);
          break;
        }

        case 7: {
          // Create Package
          const packageRes = await revenueCatService.createPackage(
            wizardData.offering.id,
            {
              lookup_key: values.lookup_key,
              display_name: values.display_name,
              position: values.position || 0,
            }
          );
          setWizardData((prev) => ({ ...prev, package: packageRes.data }));
          toast.success("Đã tạo gói thành công");
          setWizardCurrentStep(8);
          break;
        }

        case 8: {
          // Attach Product to Package
          await revenueCatService.attachProductsToPackage(
            wizardData.package.id,
            {
              products: [
                {
                  product_id: wizardData.product.id,
                  eligibility_criteria: values.eligibility_criteria || "all",
                },
              ],
            }
          );
          toast.success("Đã gắn sản phẩm vào gói thành công");
          toast.success(
            "🎉 Hoàn tất! Đã tạo đăng ký in-app purchase thành công!"
          );
          // Refresh data
          fetchProducts();
          fetchEntitlements();
          fetchOfferings();
          // Close wizard
          setWizardVisible(false);
          setWizardCurrentStep(0);
          setWizardData({
            appStoreApp: null,
            subscriptionGroup: null,
            subscription: null,
            priceSchedule: null,
            product: null,
            entitlement: null,
            offering: null,
            package: null,
            pushToStore: false,
          });
          break;
        }
      }
    } catch (error) {
      console.error(`Error in wizard step ${step}:`, error);
      toast.error(error.response?.data?.message || `Lỗi ở bước ${step + 1}`);
    } finally {
      setWizardLoading(false);
    }
  };

  const handleWizardNext = (form) => {
    form.validateFields().then((values) => {
      handleWizardStep(wizardCurrentStep, values);
    });
  };

  const handleWizardPrev = () => {
    setWizardCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleWizardCancel = () => {
    setWizardVisible(false);
    setWizardCurrentStep(0);
    setWizardData({
      appStoreApp: null,
      subscriptionGroup: null,
      subscription: null,
      priceSchedule: null,
      product: null,
      entitlement: null,
      offering: null,
      package: null,
      pushToStore: false,
    });
  };

  // Grant entitlement to customer
  const handleGrantEntitlement = async (values) => {
    if (!selectedCustomer) return;
    try {
      await revenueCatService.grantEntitlement(selectedCustomer.id, {
        entitlement_id: values.entitlement_id,
        expires_at: dayjs(values.expires_at).valueOf(),
      });
      toast.success("Đã cấp quyền truy cập thành công");
      setGrantEntitlementModalVisible(false);
      fetchCustomerDetails(selectedCustomer.id);
    } catch (error) {
      console.error("Error granting entitlement:", error);
      toast.error("Không thể cấp quyền truy cập");
    }
  };

  // Revoke entitlement from customer
  const handleRevokeEntitlement = async (entitlementId) => {
    if (!selectedCustomer) return;
    try {
      await revenueCatService.revokeGrantedEntitlement(selectedCustomer.id, {
        entitlement_id: entitlementId,
      });
      toast.success("Đã thu hồi quyền truy cập thành công");
      fetchCustomerDetails(selectedCustomer.id);
    } catch (error) {
      console.error("Error revoking entitlement:", error);
      toast.error("Không thể thu hồi quyền truy cập");
    }
  };

  // Cancel subscription
  const handleCancelSubscription = async (subscriptionId) => {
    try {
      await revenueCatService.cancelSubscription(subscriptionId);
      toast.success("Đã hủy đăng ký thành công");
      if (subscriptionSearchTerm) {
        fetchSubscriptions(subscriptionSearchTerm);
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error("Không thể hủy đăng ký");
    }
  };

  // Refund subscription
  const handleRefundSubscription = async (subscriptionId) => {
    try {
      await revenueCatService.refundSubscription(subscriptionId);
      toast.success("Đã hoàn tiền đăng ký thành công");
      if (subscriptionSearchTerm) {
        fetchSubscriptions(subscriptionSearchTerm);
      }
    } catch (error) {
      console.error("Error refunding subscription:", error);
      toast.error("Không thể hoàn tiền đăng ký");
    }
  };

  useEffect(() => {
    fetchMetrics();
    if (activeTab === "dashboard" || activeTab === "customers") {
      fetchCustomers();
    }
    if (activeTab === "products") {
      fetchProducts();
    }
    if (activeTab === "entitlements") {
      fetchEntitlements();
    }
    // Subscriptions tab doesn't auto-fetch - requires search input
    if (activeTab === "offerings") {
      fetchOfferings();
      // Also fetch products for package management
      if (products.length === 0) {
        fetchProducts();
      }
    }
  }, [
    activeTab,
    fetchCustomers,
    fetchProducts,
    fetchEntitlements,
    fetchSubscriptions,
    fetchOfferings,
    products.length,
  ]);

  // Get key metrics
  const getMetric = (id) => {
    return metrics.find((m) => m.id === id);
  };

  const activeTrials = getMetric("active_trials")?.value || 0;
  const activeSubscriptions = getMetric("active_subscriptions")?.value || 0;
  const mrr = getMetric("mrr")?.value || 0;
  const revenue = getMetric("revenue")?.value || 0;
  const newCustomers = getMetric("new_customers")?.value || 0;
  const activeUsers = getMetric("active_users")?.value || 0;

  // Prepare chart data for revenue metrics
  const revenueMetrics = metrics.filter(
    (m) => m.id.startsWith("mrr_") || m.id === "mrr"
  );
  const revenueChartData = {
    labels: revenueMetrics.map((m) => m.name.replace("MRR ", "")),
    datasets: [
      {
        label: "Doanh Thu Định Kỳ Hàng Tháng",
        data: revenueMetrics.map((m) => m.value),
        backgroundColor: "rgba(237, 42, 71, 0.6)",
        borderColor: "#ed2a47c9",
        borderWidth: 2,
      },
    ],
  };

  // Prepare chart data for revenue by period
  const revenuePeriodData = {
    labels: ["MRR", "Doanh Thu (28 ngày)"],
    datasets: [
      {
        label: "Doanh Thu",
        data: [mrr, revenue],
        backgroundColor: ["rgba(255, 145, 77, 0.6)", "rgba(237, 42, 71, 0.6)"],
        borderColor: ["#FF914D", "#ed2a47c9"],
        borderWidth: 2,
      },
    ],
  };

  // Prepare doughnut chart for subscriptions
  const subscriptionData = {
    labels: ["Đăng Ký Đang Hoạt Động", "Dùng Thử Đang Hoạt Động"],
    datasets: [
      {
        data: [activeSubscriptions, activeTrials],
        backgroundColor: ["rgba(237, 42, 71, 0.8)", "rgba(255, 145, 77, 0.8)"],
        borderColor: ["#ed2a47c9", "#FF914D"],
        borderWidth: 2,
      },
    ],
  };

  // Table columns for customers
  const customerColumns = [
    {
      title: "Mã Khách Hàng",
      dataIndex: "id",
      key: "id",
      width: 250,
      render: (id) => (
        <span className="font-mono text-xs text-gray-700">{id}</span>
      ),
    },
    {
      title: "Nền Tảng",
      dataIndex: "last_seen_platform",
      key: "platform",
      width: 120,
      render: (platform) => {
        const isIOS = platform?.toLowerCase() === "ios";
        const isAndroid = platform?.toLowerCase() === "android";
        return (
          <Tag
            color={isIOS ? "blue" : isAndroid ? "green" : "default"}
            icon={isIOS ? <AppleOutlined /> : <MobileOutlined />}
          >
            {platform || "Không có"}
          </Tag>
        );
      },
    },
    {
      title: "Quốc Gia",
      dataIndex: "last_seen_country",
      key: "country",
      width: 100,
      render: (country) => (
        <Tag icon={<GlobalOutlined />}>{country || "Không có"}</Tag>
      ),
    },
    {
      title: "Phiên Bản App",
      dataIndex: "last_seen_app_version",
      key: "appVersion",
      width: 120,
      render: (version) => (
        <span className="text-sm">{version || "Không có"}</span>
      ),
    },
    {
      title: "Lần Đầu Thấy",
      dataIndex: "first_seen_at",
      key: "firstSeen",
      width: 150,
      render: (timestamp) => (
        <span className="text-sm">{formatDate(timestamp)}</span>
      ),
    },
    {
      title: "Lần Cuối Thấy",
      dataIndex: "last_seen_at",
      key: "lastSeen",
      width: 150,
      render: (timestamp) => (
        <span className="text-sm">{formatDate(timestamp)}</span>
      ),
    },
    {
      title: "Thao Tác",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => fetchCustomerDetails(record.id)}
        >
          Chi Tiết
        </Button>
      ),
    },
  ];

  // Handle table pagination
  const handleTableChange = (pagination) => {
    fetchCustomers(pagination.current, pagination.pageSize, searchTerm);
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    fetchCustomers(1, pagination.pageSize, value);
  };

  // Format subscription status
  const formatSubscriptionStatus = (status) => {
    const statusMap = {
      active: { text: "Đang Hoạt Động", color: "success" },
      expired: { text: "Đã Hết Hạn", color: "error" },
      canceled: { text: "Đã Hủy", color: "default" },
      trial: { text: "Dùng Thử", color: "processing" },
      grace_period: { text: "Gia Hạn", color: "warning" },
      billing_issue: { text: "Lỗi Thanh Toán", color: "error" },
    };
    const statusInfo = statusMap[status] || { text: status, color: "default" };
    return <Badge status={statusInfo.color} text={statusInfo.text} />;
  };

  // Customer details modal tabs
  const customerDetailsTabs = [
    {
      key: "info",
      label: "Thông Tin",
      children: selectedCustomer ? (
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Mã Khách Hàng">
            {selectedCustomer.id}
          </Descriptions.Item>
          <Descriptions.Item label="Nền Tảng">
            {selectedCustomer.last_seen_platform || "Không có"}
          </Descriptions.Item>
          <Descriptions.Item label="Quốc Gia">
            {selectedCustomer.last_seen_country || "Không có"}
          </Descriptions.Item>
          <Descriptions.Item label="Phiên Bản App">
            {selectedCustomer.last_seen_app_version || "Không có"}
          </Descriptions.Item>
          <Descriptions.Item label="Phiên Bản Nền Tảng">
            {selectedCustomer.last_seen_platform_version || "Không có"}
          </Descriptions.Item>
          <Descriptions.Item label="Lần Đầu Thấy">
            {formatDate(selectedCustomer.first_seen_at)}
          </Descriptions.Item>
          <Descriptions.Item label="Lần Cuối Thấy" span={2}>
            {formatDate(selectedCustomer.last_seen_at)}
          </Descriptions.Item>
          {selectedCustomer.attributes?.map((attr) => (
            <Descriptions.Item
              key={attr.name}
              label={attr.name}
              span={attr.name === "$email" ? 2 : 1}
            >
              {attr.value || "Không có"}
            </Descriptions.Item>
          ))}
        </Descriptions>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Không có thông tin khách hàng
        </div>
      ),
    },
    {
      key: "subscriptions",
      label: `Đăng Ký (${customerSubscriptions.length})`,
      children: (
        <Table
          dataSource={customerSubscriptions}
          rowKey="id"
          columns={[
            {
              title: "ID Đăng Ký",
              dataIndex: "id",
              key: "id",
              render: (id) => <span className="font-mono text-xs">{id}</span>,
            },
            {
              title: "Trạng Thái",
              dataIndex: "status",
              key: "status",
              render: formatSubscriptionStatus,
            },
            {
              title: "Sản Phẩm",
              dataIndex: "product_id",
              key: "product",
              render: (productId, record) =>
                record.product?.store_identifier || productId || "Không có",
            },
            {
              title: "Bắt Đầu",
              dataIndex: "starts_at",
              key: "starts_at",
              render: formatDate,
            },
            {
              title: "Hết Hạn",
              dataIndex: "ends_at",
              key: "ends_at",
              render: (endsAt, record) =>
                formatDate(endsAt || record.current_period_ends_at),
            },
            {
              title: "Gia Hạn Tự Động",
              dataIndex: "auto_renewal_status",
              key: "auto_renewal_status",
              render: (status) =>
                status === "will_renew" ? (
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    Có
                  </Tag>
                ) : (
                  <Tag color="red" icon={<CloseCircleOutlined />}>
                    Không
                  </Tag>
                ),
            },
          ]}
          pagination={false}
          size="small"
        />
      ),
    },
    {
      key: "entitlements",
      label: `Quyền Truy Cập (${customerEntitlements.length})`,
      children: (
        <div>
          <div className="mb-4">
            <Button
              type="primary"
              icon={<GiftOutlined />}
              onClick={() => setGrantEntitlementModalVisible(true)}
            >
              Cấp Quyền Truy Cập
            </Button>
          </div>
          <Table
            dataSource={customerEntitlements}
            rowKey="entitlement_id"
            columns={[
              {
                title: "ID Quyền",
                dataIndex: "entitlement_id",
                key: "entitlement_id",
                render: (id) => <span className="font-mono text-xs">{id}</span>,
              },
              {
                title: "Trạng Thái",
                dataIndex: "status",
                key: "status",
                render: (status, record) => {
                  // Determine status based on expires_at
                  if (!record.expires_at) {
                    return <Badge status="success" text="Đang Hoạt Động" />;
                  }
                  const now = Date.now();
                  if (record.expires_at < now) {
                    return <Badge status="error" text="Đã Hết Hạn" />;
                  }
                  return <Badge status="success" text="Đang Hoạt Động" />;
                },
              },
              {
                title: "Hết Hạn",
                dataIndex: "expires_at",
                key: "expires_at",
                render: formatDate,
              },
              {
                title: "Thao Tác",
                key: "action",
                render: (_, record) => (
                  <Popconfirm
                    title="Bạn có chắc chắn muốn thu hồi quyền truy cập này?"
                    onConfirm={() =>
                      handleRevokeEntitlement(record.entitlement_id)
                    }
                    okText="Có"
                    cancelText="Không"
                  >
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                    >
                      Thu Hồi
                    </Button>
                  </Popconfirm>
                ),
              },
            ]}
            pagination={false}
            size="small"
          />
        </div>
      ),
    },
    {
      key: "purchases",
      label: `Giao Dịch (${customerPurchases.length})`,
      children: (
        <Table
          dataSource={customerPurchases}
          rowKey="id"
          columns={[
            {
              title: "ID Giao Dịch",
              dataIndex: "id",
              key: "id",
              render: (id) => <span className="font-mono text-xs">{id}</span>,
            },
            {
              title: "Sản Phẩm",
              dataIndex: "product_id",
              key: "product",
              render: (productId, record) =>
                record.product?.store_identifier || productId || "Không có",
            },
            {
              title: "Giá",
              dataIndex: "revenue_in_usd",
              key: "revenue",
              render: (revenue) => {
                if (!revenue) return "Không có";
                const amount = revenue.gross || revenue.proceeds || 0;
                const currency = revenue.currency?.code || "USD";
                return formatCurrency(
                  amount,
                  currency === "USD" ? "$" : currency
                );
              },
            },
            {
              title: "Ngày Mua",
              dataIndex: "purchased_at",
              key: "purchased_at",
              render: formatDate,
            },
            {
              title: "Trạng Thái",
              dataIndex: "status",
              key: "status",
              render: (status) => (
                <Tag color={status === "completed" ? "green" : "default"}>
                  {status === "completed" ? "Hoàn Thành" : status}
                </Tag>
              ),
            },
          ]}
          pagination={false}
          size="small"
        />
      ),
    },
  ];

  // Main navigation tabs
  const mainTabs = [
    {
      key: "dashboard",
      label: (
        <span>
          <DollarOutlined /> Tổng Quan
        </span>
      ),
    },
    {
      key: "customers",
      label: (
        <span>
          <UserOutlined /> Khách Hàng
        </span>
      ),
    },
    {
      key: "products",
      label: (
        <span>
          <ProductOutlined /> Sản Phẩm
        </span>
      ),
    },
    {
      key: "entitlements",
      label: (
        <span>
          <GiftOutlined /> Quyền Truy Cập
        </span>
      ),
    },
    {
      key: "subscriptions",
      label: (
        <span>
          <ShoppingCartOutlined /> Đăng Ký
        </span>
      ),
    },
    {
      key: "offerings",
      label: (
        <span>
          <AppstoreOutlined /> Gói Dịch Vụ
        </span>
      ),
    },
  ];

  // Products table columns
  const productColumns = [
    {
      title: "ID Sản Phẩm",
      dataIndex: "id",
      key: "id",
      render: (id) => <span className="font-mono text-xs">{id}</span>,
    },
    {
      title: "Mã Cửa Hàng",
      dataIndex: "store_identifier",
      key: "store_identifier",
    },
    {
      title: "Tên Hiển Thị",
      dataIndex: "display_name",
      key: "display_name",
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag color={type === "subscription" ? "blue" : "green"}>
          {type === "subscription" ? "Đăng Ký" : "Mua Một Lần"}
        </Tag>
      ),
    },
    {
      title: "App",
      dataIndex: ["app", "name"],
      key: "app",
    },
  ];

  // Entitlements table columns
  const entitlementColumns = [
    {
      title: "ID Quyền",
      dataIndex: "id",
      key: "id",
      render: (id) => <span className="font-mono text-xs">{id}</span>,
    },
    {
      title: "Tên Hiển Thị",
      dataIndex: "display_name",
      key: "display_name",
    },
    {
      title: "Mã Định Danh",
      dataIndex: "identifier",
      key: "identifier",
    },
  ];

  // Subscriptions table columns
  const subscriptionColumns = [
    {
      title: "ID Đăng Ký",
      dataIndex: "id",
      key: "id",
      render: (id) => <span className="font-mono text-xs">{id}</span>,
    },
    {
      title: "Khách Hàng",
      dataIndex: "customer_id",
      key: "customer_id",
      render: (id) => (
        <span className="font-mono text-xs">{id?.substring(0, 20)}...</span>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      render: formatSubscriptionStatus,
    },
    {
      title: "Sản Phẩm",
      dataIndex: "product_id",
      key: "product",
      render: (productId, record) =>
        record.product?.store_identifier || productId || "Không có",
    },
    {
      title: "Bắt Đầu",
      dataIndex: "starts_at",
      key: "starts_at",
      render: formatDate,
    },
    {
      title: "Hết Hạn",
      dataIndex: "ends_at",
      key: "ends_at",
      render: (endsAt, record) =>
        formatDate(endsAt || record.current_period_ends_at),
    },
    {
      title: "Thao Tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Bạn có chắc chắn muốn hủy đăng ký này?"
            onConfirm={() => handleCancelSubscription(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" danger icon={<StopOutlined />} size="small">
              Hủy
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Bạn có chắc chắn muốn hoàn tiền đăng ký này?"
            onConfirm={() => handleRefundSubscription(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" icon={<UndoOutlined />} size="small">
              Hoàn Tiền
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Render dashboard content
  const renderDashboard = () => (
    <>
      {/* Key Metrics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đăng Ký Đang Hoạt Động"
              value={activeSubscriptions}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: "#ed2a47c9" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Dùng Thử Đang Hoạt Động"
              value={activeTrials}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#FF914D" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh Thu Định Kỳ Hàng Tháng"
              value={formatCurrency(mrr)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh Thu (28 ngày)"
              value={formatCurrency(revenue)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khách Hàng Mới (28 ngày)"
              value={newCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Người Dùng Hoạt Động (28 ngày)"
              value={activeUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      {loading ? (
        <div className="flex items-center justify-center h-64 mb-6">
          <Spin
            indicator={
              <LoadingOutlined
                style={{ fontSize: 48, color: "#ed2a47c9" }}
                spin
              />
            }
            tip="Đang tải dữ liệu..."
            size="large"
          />
        </div>
      ) : (
        <Row gutter={[16, 16]} className="mb-6">
          {/* Revenue Comparison Chart */}
          <Col xs={24} lg={12}>
            <Card
              title="Tổng Quan Doanh Thu"
              className="shadow-sm"
              style={{ height: "100%" }}
            >
              <div style={{ height: "300px" }}>
                <Bar
                  data={revenuePeriodData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      title: {
                        display: false,
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return formatCurrency(context.parsed.y);
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function (value) {
                            return formatCurrency(value);
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </Card>
          </Col>

          {/* Subscriptions Doughnut Chart */}
          <Col xs={24} lg={12}>
            <Card
              title="Tổng Quan Đăng Ký"
              className="shadow-sm"
              style={{ height: "100%" }}
            >
              <div style={{ height: "300px" }}>
                <Doughnut
                  data={subscriptionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return `${context.label}: ${context.parsed}`;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </Card>
          </Col>

          {/* MRR by Currency Chart */}
          {revenueMetrics.length > 0 && (
            <Col xs={24}>
              <Card
                title="Doanh Thu Định Kỳ Hàng Tháng Theo Loại Tiền Tệ"
                className="shadow-sm"
              >
                <div style={{ height: "400px" }}>
                  <Bar
                    data={revenueChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              return formatCurrency(context.parsed.y);
                            },
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function (value) {
                              return formatCurrency(value);
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </Card>
            </Col>
          )}
        </Row>
      )}
    </>
  );

  // Render customers section
  const renderCustomers = () => (
    <Card
      title={
        <span className="flex items-center gap-2">
          <UserOutlined />
          Khách Hàng Premium
        </span>
      }
      className="shadow-sm"
      extra={
        <Space>
          <Input.Search
            placeholder="Tìm kiếm theo email..."
            allowClear
            onSearch={handleSearch}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() =>
              fetchCustomers(
                pagination.current,
                pagination.pageSize,
                searchTerm
              )
            }
          >
            Làm Mới
          </Button>
        </Space>
      }
    >
      <ConfigProvider
        theme={{
          components: {
            Table: {
              headerBg: "#FFE5E9",
            },
          },
        }}
      >
        <Table
          columns={customerColumns}
          dataSource={customers}
          rowKey="id"
          loading={customersLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            position: ["bottomCenter"],
            size: "middle",
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trong tổng ${total} khách hàng`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </ConfigProvider>
    </Card>
  );

  // Render products section
  const renderProducts = () => (
    <Card
      title={
        <span className="flex items-center gap-2">
          <ProductOutlined />
          Quản Lý Sản Phẩm
        </span>
      }
      className="shadow-sm"
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={() =>
            fetchProducts(
              productsPagination.current,
              productsPagination.pageSize
            )
          }
        >
          Làm Mới
        </Button>
      }
    >
      <Table
        columns={productColumns}
        dataSource={products}
        rowKey="id"
        loading={productsLoading}
        pagination={{
          current: productsPagination.current,
          pageSize: productsPagination.pageSize,
          total: productsPagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          position: ["bottomCenter"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} trong tổng ${total} sản phẩm`,
        }}
        onChange={(pagination) =>
          fetchProducts(pagination.current, pagination.pageSize)
        }
        scroll={{ x: 1000 }}
      />
    </Card>
  );

  // Render entitlements section
  const renderEntitlements = () => (
    <Card
      title={
        <span className="flex items-center gap-2">
          <GiftOutlined />
          Quản Lý Quyền Truy Cập
        </span>
      }
      className="shadow-sm"
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={() =>
            fetchEntitlements(
              entitlementsPagination.current,
              entitlementsPagination.pageSize
            )
          }
        >
          Làm Mới
        </Button>
      }
    >
      <Table
        columns={entitlementColumns}
        dataSource={entitlements}
        rowKey="id"
        loading={entitlementsLoading}
        pagination={{
          current: entitlementsPagination.current,
          pageSize: entitlementsPagination.pageSize,
          total: entitlementsPagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          position: ["bottomCenter"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} trong tổng ${total} quyền truy cập`,
        }}
        onChange={(pagination) =>
          fetchEntitlements(pagination.current, pagination.pageSize)
        }
        scroll={{ x: 800 }}
      />
    </Card>
  );

  // Render subscriptions section
  const renderSubscriptions = () => (
    <Card
      title={
        <span className="flex items-center gap-2">
          <ShoppingCartOutlined />
          Tìm Kiếm Đăng Ký
        </span>
      }
      className="shadow-sm"
      extra={
        <Space>
          <Input.Search
            placeholder="Nhập mã định danh đăng ký từ cửa hàng..."
            allowClear
            value={subscriptionSearchTerm}
            onSearch={handleSubscriptionSearch}
            onChange={(e) => {
              setSubscriptionSearchTerm(e.target.value);
              if (!e.target.value) {
                setSubscriptions([]);
              }
            }}
            style={{ width: 350 }}
            prefix={<SearchOutlined />}
            enterButton="Tìm Kiếm"
          />
          {subscriptionSearchTerm && (
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchSubscriptions(subscriptionSearchTerm)}
            >
              Làm Mới
            </Button>
          )}
        </Space>
      }
    >
      {!subscriptionSearchTerm ? (
        <div className="text-center py-12">
          <ShoppingCartOutlined
            style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
          />
          <p className="text-gray-500 text-lg mb-2">
            Tìm Kiếm Đăng Ký Theo Mã Định Danh
          </p>
          <p className="text-gray-400">
            Vui lòng nhập mã định danh đăng ký từ cửa hàng (Store Subscription
            Identifier) để tìm kiếm
          </p>
        </div>
      ) : subscriptions.length === 0 && !subscriptionsLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            Không tìm thấy đăng ký nào với mã định danh:{" "}
            <span className="font-mono">{subscriptionSearchTerm}</span>
          </p>
        </div>
      ) : (
        <Table
          columns={subscriptionColumns}
          dataSource={subscriptions}
          rowKey="id"
          loading={subscriptionsLoading}
          pagination={{
            current: subscriptionsPagination.current,
            pageSize: subscriptionsPagination.pageSize,
            total: subscriptionsPagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            position: ["bottomCenter"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} trong tổng ${total} đăng ký`,
          }}
          scroll={{ x: 1200 }}
        />
      )}
    </Card>
  );

  // Render offerings section
  const renderOfferings = () => (
    <Card
      title={
        <span className="flex items-center gap-2">
          <AppstoreOutlined />
          Quản Lý Gói Dịch Vụ
        </span>
      }
      className="shadow-sm"
      extra={
        <Button icon={<ReloadOutlined />} onClick={fetchOfferings}>
          Làm Mới
        </Button>
      }
    >
      {offeringsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {offerings.map((offering) => (
            <Col xs={24} sm={12} lg={8} key={offering.id}>
              <Card
                title={offering.display_name || offering.identifier}
                size="small"
                extra={
                  <Tag color="blue">
                    {offering.packages?.length || offeringPackages.length || 0}{" "}
                    Gói
                  </Tag>
                }
                actions={[
                  <Button
                    key="view"
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      setSelectedOffering(offering);
                      fetchOfferingPackages(offering.id);
                    }}
                  >
                    Xem Gói
                  </Button>,
                  <Button
                    key="create"
                    type="link"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setSelectedOffering(offering);
                      setCreatePackageModalVisible(true);
                    }}
                  >
                    Tạo Gói
                  </Button>,
                ]}
              >
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="ID">
                    <span className="font-mono text-xs">{offering.id}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã Định Danh">
                    {offering.identifier}
                  </Descriptions.Item>
                  {offering.packages && offering.packages.length > 0 && (
                    <Descriptions.Item label="Gói">
                      {offering.packages.map((pkg) => (
                        <Tag key={pkg.id} className="mb-1">
                          {pkg.display_name || pkg.lookup_key}
                        </Tag>
                      ))}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>
          ))}
          {offerings.length === 0 && (
            <Col span={24}>
              <div className="text-center py-8 text-gray-500">
                Không có gói dịch vụ nào
              </div>
            </Col>
          )}
        </Row>
      )}

      {/* Packages Modal for Selected Offering */}
      {selectedOffering && (
        <Modal
          title={
            <span>
              <AppstoreOutlined /> Gói trong{" "}
              {selectedOffering.display_name || selectedOffering.identifier}
            </span>
          }
          open={!!selectedOffering}
          onCancel={() => {
            setSelectedOffering(null);
            setOfferingPackages([]);
          }}
          footer={null}
          width={1000}
        >
          <div className="mb-4">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreatePackageModalVisible(true)}
            >
              Tạo Gói Mới
            </Button>
          </div>
          {packagesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
          ) : offeringPackages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có gói nào trong offering này
            </div>
          ) : (
            <Table
              dataSource={offeringPackages}
              rowKey="id"
              columns={[
                {
                  title: "Tên Hiển Thị",
                  dataIndex: "display_name",
                  key: "display_name",
                },
                {
                  title: "Lookup Key",
                  dataIndex: "lookup_key",
                  key: "lookup_key",
                  render: (key) => (
                    <span className="font-mono text-xs">{key}</span>
                  ),
                },
                {
                  title: "Vị Trí",
                  dataIndex: "position",
                  key: "position",
                },
                {
                  title: "Sản Phẩm",
                  key: "products",
                  render: (_, record) => (
                    <span>{record.products?.items?.length || 0} sản phẩm</span>
                  ),
                },
                {
                  title: "Thao Tác",
                  key: "action",
                  render: (_, record) => (
                    <Space>
                      <Button
                        type="link"
                        icon={<ProductOutlined />}
                        onClick={() => {
                          setSelectedPackage(record);
                          setAttachProductsModalVisible(true);
                        }}
                      >
                        Gắn Sản Phẩm
                      </Button>
                    </Space>
                  ),
                },
              ]}
              pagination={false}
            />
          )}
        </Modal>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bảng Điều Khiển Quản Lý Premium
              </h1>
              <p className="text-gray-600">
                Theo dõi chỉ số doanh thu và quản lý khách hàng premium
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleWizardStart}
            >
              Tạo Đăng Ký Mới
            </Button>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <Card className="mb-6">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={mainTabs}
            size="large"
          />
        </Card>

        {/* Content based on active tab */}
        {activeTab === "dashboard" && renderDashboard()}
        {activeTab === "customers" && renderCustomers()}
        {activeTab === "products" && renderProducts()}
        {activeTab === "entitlements" && renderEntitlements()}
        {activeTab === "subscriptions" && renderSubscriptions()}
        {activeTab === "offerings" && renderOfferings()}

        {/* Customer Details Modal */}
        <Modal
          title={
            <span>
              <UserOutlined /> Chi Tiết Khách Hàng
            </span>
          }
          open={customerDetailsModalVisible}
          onCancel={() => setCustomerDetailsModalVisible(false)}
          footer={null}
          width={1000}
        >
          {loadingCustomerDetails ? (
            <div className="flex items-center justify-center py-8">
              <Spin size="large" tip="Đang tải thông tin..." />
            </div>
          ) : (
            <Tabs items={customerDetailsTabs} />
          )}
        </Modal>

        {/* Grant Entitlement Modal */}
        <Modal
          title={
            <span>
              <GiftOutlined /> Cấp Quyền Truy Cập
            </span>
          }
          open={grantEntitlementModalVisible}
          onCancel={() => setGrantEntitlementModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            layout="vertical"
            onFinish={handleGrantEntitlement}
            initialValues={{
              expires_at: dayjs().add(30, "day"),
            }}
          >
            <Form.Item
              label="Quyền Truy Cập"
              name="entitlement_id"
              rules={[
                { required: true, message: "Vui lòng chọn quyền truy cập" },
              ]}
            >
              <Select
                placeholder="Chọn quyền truy cập"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={entitlements.map((ent) => ({
                  value: ent.id,
                  label: ent.display_name || ent.identifier,
                }))}
              />
            </Form.Item>
            <Form.Item
              label="Ngày Hết Hạn"
              name="expires_at"
              rules={[
                { required: true, message: "Vui lòng chọn ngày hết hạn" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                showTime
                format="DD/MM/YYYY HH:mm"
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Cấp Quyền
                </Button>
                <Button onClick={() => setGrantEntitlementModalVisible(false)}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Create Package Modal */}
        <Modal
          title={
            <span>
              <PlusOutlined /> Tạo Gói Mới
            </span>
          }
          open={createPackageModalVisible}
          onCancel={() => {
            setCreatePackageModalVisible(false);
            setSelectedOffering(null);
          }}
          footer={null}
          width={600}
        >
          <Form
            layout="vertical"
            onFinish={handleCreatePackage}
            initialValues={{
              position: 0,
            }}
          >
            <Form.Item
              label="Lookup Key"
              name="lookup_key"
              rules={[
                { required: true, message: "Vui lòng nhập lookup key" },
                {
                  min: 1,
                  max: 200,
                  message: "Lookup key phải từ 1 đến 200 ký tự",
                },
              ]}
              tooltip="Mã định danh duy nhất cho gói (ví dụ: monthly, annual)"
            >
              <Input placeholder="monthly" />
            </Form.Item>
            <Form.Item
              label="Tên Hiển Thị"
              name="display_name"
              rules={[
                { required: true, message: "Vui lòng nhập tên hiển thị" },
                {
                  min: 1,
                  max: 1500,
                  message: "Tên hiển thị phải từ 1 đến 1500 ký tự",
                },
              ]}
            >
              <Input placeholder="Gói Hàng Tháng" />
            </Form.Item>
            <Form.Item
              label="Vị Trí"
              name="position"
              tooltip="Vị trí của gói trong offering (số nhỏ hơn sẽ hiển thị trước)"
            >
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Tạo Gói
                </Button>
                <Button
                  onClick={() => {
                    setCreatePackageModalVisible(false);
                    setSelectedOffering(null);
                  }}
                >
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Attach Products to Package Modal */}
        <Modal
          title={
            <span>
              <ProductOutlined /> Gắn Sản Phẩm vào Gói
            </span>
          }
          open={attachProductsModalVisible}
          onCancel={() => {
            setAttachProductsModalVisible(false);
            setSelectedPackage(null);
          }}
          footer={null}
          width={700}
        >
          {selectedPackage && (
            <Form
              layout="vertical"
              onFinish={handleAttachProducts}
              initialValues={{
                products: [
                  { product_id: undefined, eligibility_criteria: "all" },
                ],
              }}
            >
              <Form.List name="products">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space
                        key={key}
                        style={{ display: "flex", marginBottom: 8 }}
                        align="baseline"
                      >
                        <Form.Item
                          {...restField}
                          name={[name, "product_id"]}
                          label="Sản Phẩm"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn sản phẩm",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Chọn sản phẩm"
                            style={{ width: 300 }}
                            showSearch
                            filterOption={(input, option) =>
                              (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            }
                            options={products.map((prod) => ({
                              value: prod.id,
                              label: `${
                                prod.display_name || prod.store_identifier
                              } (${prod.store_identifier})`,
                            }))}
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, "eligibility_criteria"]}
                          label="Điều Kiện"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn điều kiện",
                            },
                          ]}
                        >
                          <Select style={{ width: 200 }}>
                            <Select.Option value="all">Tất Cả</Select.Option>
                            <Select.Option value="google_sdk_lt_6">
                              Google SDK &lt; 6
                            </Select.Option>
                            <Select.Option value="google_sdk_ge_6">
                              Google SDK ≥ 6
                            </Select.Option>
                          </Select>
                        </Form.Item>
                        {fields.length > 1 && (
                          <Button
                            type="link"
                            danger
                            onClick={() => remove(name)}
                            icon={<DeleteOutlined />}
                          >
                            Xóa
                          </Button>
                        )}
                      </Space>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Thêm Sản Phẩm
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Gắn Sản Phẩm
                  </Button>
                  <Button
                    onClick={() => {
                      setAttachProductsModalVisible(false);
                      setSelectedPackage(null);
                    }}
                  >
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}
        </Modal>

        {/* Subscription Setup Wizard */}
        <Modal
          title={
            <span>
              <AppstoreOutlined /> Tạo Đăng Ký In-App Purchase Mới
            </span>
          }
          open={wizardVisible}
          onCancel={handleWizardCancel}
          footer={null}
          width={800}
          destroyOnClose
        >
          <Steps
            current={wizardCurrentStep}
            items={[
              {
                title: "Cấu Hình",
                description: "Cấu hình App Store Connect",
              },
              {
                title: "App Store",
                description: "Tạo subscription trong App Store",
              },
              {
                title: "Thiết Lập Giá",
                description: "Thiết lập giá cho subscription",
              },
              {
                title: "RevenueCat",
                description: "Tạo sản phẩm trong RevenueCat",
              },
              {
                title: "Quyền Truy Cập",
                description: "Tạo entitlement",
              },
              {
                title: "Gắn Sản Phẩm",
                description: "Gắn sản phẩm vào entitlement",
              },
              {
                title: "Gói Dịch Vụ",
                description: "Tạo offering",
              },
              {
                title: "Gói",
                description: "Tạo package",
              },
              {
                title: "Hoàn Tất",
                description: "Gắn sản phẩm vào package",
              },
            ]}
            style={{ marginBottom: 32 }}
          />

          <Form.Provider
            onFormFinish={(name, { forms }) => {
              if (name === `step-${wizardCurrentStep}`) {
                handleWizardNext(forms[`step-${wizardCurrentStep}`]);
              }
            }}
          >
            {/* Step 0: Configure App Store Connect Credentials */}
            {wizardCurrentStep === 0 && (
              <Form
                name="step-0"
                layout="vertical"
                onFinish={(values) => {
                  if (values.key_id && values.issuer_id && values.private_key) {
                    appStoreConnectService.setCredentials(
                      values.key_id,
                      values.issuer_id,
                      values.private_key
                    );
                    setAppStoreCredentialsConfigured(true);
                    toast.success(
                      "Đã lưu thông tin xác thực App Store Connect"
                    );
                    fetchAppStoreApps();
                    setWizardCurrentStep(1);
                  } else {
                    // Skip App Store Connect, go directly to RevenueCat
                    setWizardCurrentStep(2);
                  }
                }}
              >
                <Alert
                  message="Bước 1: Cấu Hình App Store Connect (Tùy Chọn)"
                  description="Nếu bạn muốn tạo subscription trong App Store Connect tự động, vui lòng nhập thông tin xác thực. Bạn có thể bỏ qua bước này và tạo sản phẩm trực tiếp trong RevenueCat."
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />

                {!appStoreCredentialsConfigured ? (
                  <>
                    <Form.Item
                      label="Key ID"
                      name="key_id"
                      tooltip="Key ID từ App Store Connect API Key"
                    >
                      <Input placeholder="ABC123DEFG" />
                    </Form.Item>
                    <Form.Item
                      label="Issuer ID"
                      name="issuer_id"
                      tooltip="Issuer ID từ App Store Connect"
                    >
                      <Input placeholder="12345678-1234-1234-1234-123456789012" />
                    </Form.Item>
                    <Form.Item
                      label="Private Key (.p8)"
                      name="private_key"
                      tooltip="Nội dung file .p8 (bao gồm BEGIN và END lines)"
                    >
                      <Input.TextArea
                        rows={6}
                        placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                      />
                    </Form.Item>
                    <Alert
                      message="Cảnh Báo Bảo Mật"
                      description="Private key sẽ được lưu trong localStorage. Trong môi trường production, nên sử dụng backend để bảo mật thông tin này."
                      type="warning"
                      showIcon
                      style={{ marginBottom: 24 }}
                    />
                  </>
                ) : (
                  <Alert
                    message="Đã Cấu Hình"
                    description="App Store Connect credentials đã được cấu hình. Bạn có thể tiếp tục hoặc cập nhật thông tin mới."
                    type="success"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                )}

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={wizardLoading}
                      icon={<ArrowRightOutlined />}
                    >
                      {appStoreCredentialsConfigured
                        ? "Tiếp Theo"
                        : "Lưu và Tiếp Theo"}
                    </Button>
                    <Button onClick={() => setWizardCurrentStep(2)}>
                      Bỏ Qua (Chỉ RevenueCat)
                    </Button>
                    <Button onClick={handleWizardCancel}>Hủy</Button>
                  </Space>
                </Form.Item>
              </Form>
            )}

            {/* Step 1: Create Subscription Group and Subscription in App Store Connect */}
            {wizardCurrentStep === 1 && appStoreCredentialsConfigured && (
              <Form
                name="step-1"
                layout="vertical"
                initialValues={{
                  subscription_period: "ONE_MONTH",
                  family_sharable: false,
                }}
              >
                <Alert
                  message="Bước 2: Tạo Subscription trong App Store Connect"
                  description="Tạo subscription group và subscription trong App Store Connect. Sau đó sẽ tạo sản phẩm tương ứng trong RevenueCat."
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />

                <Form.Item
                  label="App Store App"
                  name="app_store_app_id"
                  rules={[{ required: true, message: "Vui lòng chọn app" }]}
                >
                  <Select
                    placeholder="Chọn App Store app"
                    loading={appStoreAppsLoading}
                    showSearch
                    options={appStoreApps.map((app) => ({
                      value: app.id,
                      label: `${app.attributes.name} (${app.id})`,
                    }))}
                  />
                </Form.Item>

                <Form.Item
                  label="Tên Subscription Group"
                  name="subscription_group_name"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên group" },
                  ]}
                  tooltip="Tên reference cho subscription group"
                >
                  <Input placeholder="Premium Subscriptions" />
                </Form.Item>

                <Form.Item
                  label="Product ID"
                  name="product_id"
                  rules={[
                    { required: true, message: "Vui lòng nhập Product ID" },
                  ]}
                  tooltip="Product ID cho subscription (ví dụ: com.app.monthly)"
                >
                  <Input placeholder="com.app.premium.monthly" />
                </Form.Item>

                <Form.Item
                  label="Tên Subscription"
                  name="subscription_name"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tên subscription",
                    },
                  ]}
                >
                  <Input placeholder="Premium Monthly" />
                </Form.Item>

                <Form.Item
                  label="Thời Hạn"
                  name="subscription_period"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Select.Option value="ONE_WEEK">1 Tuần</Select.Option>
                    <Select.Option value="ONE_MONTH">1 Tháng</Select.Option>
                    <Select.Option value="TWO_MONTHS">2 Tháng</Select.Option>
                    <Select.Option value="THREE_MONTHS">3 Tháng</Select.Option>
                    <Select.Option value="SIX_MONTHS">6 Tháng</Select.Option>
                    <Select.Option value="ONE_YEAR">1 Năm</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item name="family_sharable" valuePropName="checked">
                  <Checkbox>Cho phép chia sẻ trong Family Sharing</Checkbox>
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={wizardLoading}
                      icon={<ArrowRightOutlined />}
                    >
                      Tạo Subscription
                    </Button>
                    <Button onClick={handleWizardPrev}>Quay Lại</Button>
                    <Button onClick={handleWizardCancel}>Hủy</Button>
                  </Space>
                </Form.Item>
              </Form>
            )}

            {/* Step 2: Set Price for Subscription in App Store Connect */}
            {wizardCurrentStep === 2 && wizardData.subscription && (
              <Form
                name="step-2"
                layout="vertical"
                onFinish={async (values) => {
                  await handleWizardStep(2, values);
                }}
              >
                <Alert
                  message="Bước 2: Thiết Lập Giá cho Subscription"
                  description="Thiết lập giá cho subscription đã tạo trong App Store Connect. Bạn có thể chọn từ các price points có sẵn hoặc bỏ qua để thiết lập sau."
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />

                {wizardData.subscription && (
                  <Alert
                    message={`Subscription: ${
                      wizardData.subscription.attributes?.name ||
                      wizardData.subscription.attributes?.productId
                    }`}
                    type="success"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                )}

                <Form.Item
                  label="Price Point"
                  name="price_point_id"
                  tooltip="Chọn price point từ danh sách có sẵn. Nếu không chọn, hệ thống sẽ sử dụng price point mặc định."
                >
                  <Select
                    placeholder="Chọn price point (tùy chọn)"
                    loading={pricePointsLoading}
                    showSearch
                    allowClear
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={pricePoints.map((pp) => {
                      const price =
                        pp.attributes?.customerPrice?.displayPrice ||
                        pp.attributes?.customerPrice ||
                        "N/A";
                      const currency =
                        pp.attributes?.customerPrice?.currency || "";
                      return {
                        value: pp.id,
                        label: `${price} ${currency} - ${pp.id.substring(
                          0,
                          8
                        )}...`,
                      };
                    })}
                  />
                </Form.Item>

                {pricePoints.length === 0 && !pricePointsLoading && (
                  <Alert
                    message="Không có price points"
                    description="Subscription này chưa có price points. Bạn có thể bỏ qua bước này và thiết lập giá sau trong App Store Connect."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                )}

                <Form.Item
                  label="Ngày Bắt Đầu (Tùy Chọn)"
                  name="start_date"
                  tooltip="Ngày bắt đầu áp dụng giá. Để trống để áp dụng ngay."
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                    placeholder="Chọn ngày (tùy chọn)"
                  />
                </Form.Item>

                <Alert
                  message="Lưu ý"
                  description="Nếu bạn bỏ qua bước này, bạn vẫn có thể thiết lập giá sau trong App Store Connect. Price points được quản lý bởi Apple và phụ thuộc vào subscription period."
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={wizardLoading}
                      icon={<ArrowRightOutlined />}
                    >
                      {pricePoints.length > 0 ? "Thiết Lập Giá" : "Bỏ Qua"}
                    </Button>
                    <Button onClick={handleWizardPrev}>Quay Lại</Button>
                    <Button onClick={() => setWizardCurrentStep(3)}>
                      Bỏ Qua Bước Này
                    </Button>
                    <Button onClick={handleWizardCancel}>Hủy</Button>
                  </Space>
                </Form.Item>
              </Form>
            )}

            {/* Step 2: Skip price setting if no subscription */}
            {wizardCurrentStep === 2 && !wizardData.subscription && (
              <div>
                <Alert
                  message="Bỏ Qua Thiết Lập Giá"
                  description="Không có subscription trong App Store Connect. Tiếp tục với việc tạo sản phẩm trong RevenueCat."
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
                <Space>
                  <Button
                    type="primary"
                    onClick={() => setWizardCurrentStep(3)}
                    icon={<ArrowRightOutlined />}
                  >
                    Tiếp Theo
                  </Button>
                  <Button onClick={handleWizardPrev}>Quay Lại</Button>
                  <Button onClick={handleWizardCancel}>Hủy</Button>
                </Space>
              </div>
            )}

            {/* Step 3: Create Product in RevenueCat */}
            {wizardCurrentStep === 3 && (
              <Form
                name="step-3"
                layout="vertical"
                initialValues={{
                  type: "subscription",
                  store_identifier:
                    wizardData.subscription?.attributes?.productId || "",
                  display_name: wizardData.subscription?.attributes?.name || "",
                }}
              >
                <Alert
                  message="Bước 4: Tạo Sản Phẩm trong RevenueCat"
                  description={
                    wizardData.subscription
                      ? `Sử dụng subscription đã tạo trong App Store Connect: ${
                          wizardData.subscription.attributes?.productId || "N/A"
                        }. Thông tin đã được điền sẵn.`
                      : "Tạo sản phẩm subscription trong RevenueCat. Bạn cần có App ID và Store Identifier từ App Store/Play Store."
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
                <Form.Item
                  label="Store Identifier"
                  name="store_identifier"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập store identifier",
                    },
                  ]}
                  tooltip="Product ID từ App Store hoặc SKU từ Play Store"
                >
                  <Input
                    placeholder="com.app.monthly"
                    disabled={!!wizardData.subscription}
                  />
                </Form.Item>
                <Form.Item
                  label="App"
                  name="app_id"
                  rules={[{ required: true, message: "Vui lòng chọn app" }]}
                >
                  <Select
                    placeholder="Chọn app"
                    loading={appsLoading}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    options={apps.map((app) => ({
                      value: app.id,
                      label: `${app.name} (${app.type})`,
                      appType: app.type,
                    }))}
                  />
                </Form.Item>
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.app_id !== currentValues.app_id
                  }
                >
                  {({ getFieldValue }) => {
                    const appId = getFieldValue("app_id");
                    const selectedApp = apps.find((app) => app.id === appId);
                    const appType = selectedApp?.type;

                    // Show pricing info for App Store/Play Store
                    if (appType === "app_store" || appType === "play_store") {
                      return (
                        <>
                          <Alert
                            message="Thiết Lập Giá cho App Store"
                            description="Bạn có thể thiết lập giá bằng App Store Connect API (REST API) hoặc thủ công trong App Store Connect. Sử dụng App Store Connect API cho phép tự động hóa việc thiết lập giá."
                            type="info"
                            showIcon
                            style={{ marginBottom: 24 }}
                          />
                          <Form.Item
                            name="use_app_store_api"
                            valuePropName="checked"
                            tooltip="Sử dụng App Store Connect API để thiết lập giá tự động (yêu cầu cấu hình API key ở backend)"
                          >
                            <Checkbox>
                              Sử dụng App Store Connect API để thiết lập giá
                            </Checkbox>
                          </Form.Item>
                        </>
                      );
                    }

                    // Show info for Test Store
                    if (appType === "test") {
                      return (
                        <Alert
                          message="Test Store - Giá Tùy Chỉnh"
                          description="Với Test Store, bạn có thể thiết lập giá tùy chỉnh trong RevenueCat Dashboard sau khi tạo sản phẩm. Test Store chỉ dùng cho mục đích testing."
                          type="info"
                          showIcon
                          style={{ marginBottom: 24 }}
                        />
                      );
                    }

                    // Show info for RevenueCat Billing
                    if (appType === "rc_billing") {
                      return (
                        <Alert
                          message="RevenueCat Billing - Giá Tùy Chỉnh"
                          description="Với RevenueCat Billing, bạn có thể thiết lập giá tùy chỉnh thông qua RevenueCat Dashboard hoặc Stripe (nếu đã kết nối). Giá được quản lý hoàn toàn trong RevenueCat và không cần App Store Connect."
                          type="success"
                          showIcon
                          style={{ marginBottom: 24 }}
                        />
                      );
                    }

                    return null;
                  }}
                </Form.Item>
                <Form.Item
                  label="Loại Sản Phẩm"
                  name="type"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Select.Option value="subscription">
                      Subscription (Đăng Ký)
                    </Select.Option>
                    <Select.Option value="one_time">
                      One-Time (Mua Một Lần)
                    </Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Tên Hiển Thị"
                  name="display_name"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên hiển thị" },
                  ]}
                >
                  <Input placeholder="Gói Premium Hàng Tháng" />
                </Form.Item>

                {/* Test Store specific fields */}
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.app_id !== currentValues.app_id ||
                    prevValues.type !== currentValues.type
                  }
                >
                  {({ getFieldValue }) => {
                    const appId = getFieldValue("app_id");
                    const productType = getFieldValue("type");
                    const selectedApp = apps.find((app) => app.id === appId);
                    const appType = selectedApp?.type;
                    const isTestStore = appType === "test";
                    const isSubscription = productType === "subscription";

                    if (!isTestStore || !isSubscription) {
                      return null;
                    }

                    return (
                      <>
                        <Form.Item
                          label="Thời Hạn Đăng Ký (Test Store)"
                          name="subscription_duration"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập thời hạn đăng ký",
                            },
                          ]}
                          tooltip="Thời hạn theo định dạng ISO 8601 (ví dụ: P1M = 1 tháng, P1W = 1 tuần)"
                        >
                          <Select placeholder="Chọn thời hạn">
                            <Select.Option value="P1W">
                              1 Tuần (P1W)
                            </Select.Option>
                            <Select.Option value="P1M">
                              1 Tháng (P1M)
                            </Select.Option>
                            <Select.Option value="P3M">
                              3 Tháng (P3M)
                            </Select.Option>
                            <Select.Option value="P6M">
                              6 Tháng (P6M)
                            </Select.Option>
                            <Select.Option value="P1Y">
                              1 Năm (P1Y)
                            </Select.Option>
                          </Select>
                        </Form.Item>
                        <Form.Item
                          label="Tiêu Đề (Test Store - Bắt Buộc)"
                          name="title"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập tiêu đề cho Test Store",
                            },
                          ]}
                          tooltip="Tiêu đề hiển thị cho sản phẩm Test Store"
                        >
                          <Input placeholder="Premium Monthly Subscription" />
                        </Form.Item>
                        <Alert
                          message="Test Store - Giá Tùy Chỉnh"
                          description="Với Test Store, bạn có thể thiết lập giá tùy chỉnh trong RevenueCat Dashboard sau khi tạo sản phẩm. Giá không cần thiết lập trong App Store Connect."
                          type="info"
                          showIcon
                          style={{ marginBottom: 24 }}
                        />
                      </>
                    );
                  }}
                </Form.Item>

                {/* App Store Connect API Price Configuration */}
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.app_id !== currentValues.app_id ||
                    prevValues.use_app_store_api !==
                      currentValues.use_app_store_api ||
                    prevValues.type !== currentValues.type
                  }
                >
                  {({ getFieldValue }) => {
                    const appId = getFieldValue("app_id");
                    const useAppStoreAPI = getFieldValue("use_app_store_api");
                    const productType = getFieldValue("type");
                    const selectedApp = apps.find((app) => app.id === appId);
                    const appType = selectedApp?.type;
                    const isAppStore = appType === "app_store";
                    const isSubscription = productType === "subscription";

                    if (!isAppStore || !useAppStoreAPI || !isSubscription) {
                      return null;
                    }

                    return (
                      <>
                        <Alert
                          message="App Store Connect API - Thiết Lập Giá"
                          description="Sử dụng App Store Connect API để thiết lập giá subscription. Yêu cầu cấu hình API key (Key ID, Issuer ID, Private Key) ở backend."
                          type="info"
                          showIcon
                          style={{ marginBottom: 24 }}
                        />
                        <Form.Item
                          label="Giá (USD)"
                          name="price"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập giá",
                            },
                            {
                              type: "number",
                              min: 0.01,
                              message: "Giá phải lớn hơn 0",
                            },
                          ]}
                          tooltip="Giá subscription tính bằng USD"
                        >
                          <InputNumber
                            min={0.01}
                            step={0.01}
                            precision={2}
                            style={{ width: "100%" }}
                            placeholder="9.99"
                            prefix="$"
                          />
                        </Form.Item>
                        <Form.Item
                          label="Lãnh Thổ"
                          name="territory"
                          initialValue="USA"
                          tooltip="Lãnh thổ áp dụng giá (mặc định: USA). Bạn có thể thiết lập giá cho nhiều lãnh thổ sau."
                        >
                          <Select showSearch placeholder="Chọn lãnh thổ">
                            <Select.Option value="USA">
                              USA - Hoa Kỳ
                            </Select.Option>
                            <Select.Option value="VNM">
                              VNM - Việt Nam
                            </Select.Option>
                            <Select.Option value="GBR">GBR - Anh</Select.Option>
                            <Select.Option value="DEU">DEU - Đức</Select.Option>
                            <Select.Option value="FRA">
                              FRA - Pháp
                            </Select.Option>
                            <Select.Option value="JPN">
                              JPN - Nhật Bản
                            </Select.Option>
                            <Select.Option value="KOR">
                              KOR - Hàn Quốc
                            </Select.Option>
                            <Select.Option value="CHN">
                              CHN - Trung Quốc
                            </Select.Option>
                            <Select.Option value="AUS">AUS - Úc</Select.Option>
                            <Select.Option value="CAN">
                              CAN - Canada
                            </Select.Option>
                            <Select.Option value="BRA">
                              BRA - Brazil
                            </Select.Option>
                            <Select.Option value="IND">
                              IND - Ấn Độ
                            </Select.Option>
                          </Select>
                        </Form.Item>
                        <Alert
                          message="Backend Integration Required"
                          description={
                            <div>
                              <p>Để sử dụng App Store Connect API, bạn cần:</p>
                              <ol style={{ marginLeft: 20, marginTop: 8 }}>
                                <li>
                                  Cấu hình backend endpoint:{" "}
                                  <code>
                                    POST
                                    /api/app-store-connect/set-subscription-price
                                  </code>
                                </li>
                                <li>
                                  Thiết lập App Store Connect API key (Key ID,
                                  Issuer ID, Private Key)
                                </li>
                                <li>
                                  Backend sẽ tự động tạo JWT token và gọi App
                                  Store Connect API
                                </li>
                              </ol>
                              <p style={{ marginTop: 8, marginBottom: 0 }}>
                                Xem file{" "}
                                <code>APP_STORE_CONNECT_API_SETUP.md</code> để
                                biết chi tiết.
                              </p>
                            </div>
                          }
                          type="warning"
                          showIcon
                          style={{ marginBottom: 24 }}
                        />
                      </>
                    );
                  }}
                </Form.Item>

                <Form.Item
                  name="push_to_store"
                  valuePropName="checked"
                  tooltip="Đẩy sản phẩm lên App Store/Play Store ngay sau khi tạo (chỉ áp dụng cho App Store/Play Store)"
                >
                  <Checkbox>
                    Đẩy sản phẩm lên cửa hàng ngay sau khi tạo
                  </Checkbox>
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.type !== currentValues.type ||
                    prevValues.push_to_store !== currentValues.push_to_store ||
                    prevValues.use_app_store_api !==
                      currentValues.use_app_store_api
                  }
                >
                  {({ getFieldValue }) => {
                    const productType = getFieldValue("type");
                    const pushToStore = getFieldValue("push_to_store");
                    const useAppStoreAPI = getFieldValue("use_app_store_api");
                    const isSubscription = productType === "subscription";

                    // Show push to store fields only if not using App Store API
                    if (!pushToStore || !isSubscription || useAppStoreAPI) {
                      return null;
                    }

                    return (
                      <>
                        <Form.Item
                          label="Thời Hạn Đăng Ký"
                          name="duration"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn thời hạn đăng ký",
                            },
                          ]}
                          tooltip="Thời hạn của subscription"
                        >
                          <Select placeholder="Chọn thời hạn">
                            <Select.Option value="ONE_WEEK">
                              1 Tuần
                            </Select.Option>
                            <Select.Option value="ONE_MONTH">
                              1 Tháng
                            </Select.Option>
                            <Select.Option value="TWO_MONTHS">
                              2 Tháng
                            </Select.Option>
                            <Select.Option value="THREE_MONTHS">
                              3 Tháng
                            </Select.Option>
                            <Select.Option value="SIX_MONTHS">
                              6 Tháng
                            </Select.Option>
                            <Select.Option value="ONE_YEAR">
                              1 Năm
                            </Select.Option>
                          </Select>
                        </Form.Item>
                        <Form.Item
                          label="Tên Nhóm Đăng Ký"
                          name="subscription_group_name"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập tên nhóm đăng ký",
                            },
                          ]}
                          tooltip="Tên của subscription group trong App Store Connect"
                        >
                          <Input placeholder="Premium Subscriptions" />
                        </Form.Item>
                        <Form.Item
                          label="ID Nhóm Đăng Ký (Tùy Chọn)"
                          name="subscription_group_id"
                          tooltip="ID của subscription group (nếu đã có)"
                        >
                          <Input placeholder="sub_group_123" />
                        </Form.Item>
                      </>
                    );
                  }}
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={wizardLoading}
                      icon={<ArrowRightOutlined />}
                    >
                      Tiếp Theo
                    </Button>
                    <Button onClick={handleWizardCancel}>Hủy</Button>
                  </Space>
                </Form.Item>
              </Form>
            )}

            {wizardCurrentStep === 3 && (
              <Form name="step-3" layout="vertical">
                <Alert
                  message="Bước 4: Tạo Quyền Truy Cập"
                  description="Tạo entitlement để quản lý quyền truy cập của người dùng."
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
                {wizardData.product && (
                  <Alert
                    message={`Sản phẩm đã tạo: ${
                      wizardData.product.display_name ||
                      wizardData.product.store_identifier
                    }`}
                    type="success"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                )}
                <Form.Item
                  label="Lookup Key"
                  name="lookup_key"
                  rules={[
                    { required: true, message: "Vui lòng nhập lookup key" },
                    { min: 1, max: 200 },
                  ]}
                  tooltip="Mã định danh duy nhất (ví dụ: premium, pro)"
                >
                  <Input placeholder="premium" />
                </Form.Item>
                <Form.Item
                  label="Tên Hiển Thị"
                  name="display_name"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên hiển thị" },
                  ]}
                >
                  <Input placeholder="Premium Access" />
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button
                      onClick={handleWizardPrev}
                      icon={<ArrowLeftOutlined />}
                    >
                      Quay Lại
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={wizardLoading}
                      icon={<ArrowRightOutlined />}
                    >
                      Tiếp Theo
                    </Button>
                    <Button onClick={handleWizardCancel}>Hủy</Button>
                  </Space>
                </Form.Item>
              </Form>
            )}

            {wizardCurrentStep === 4 && (
              <Form name="step-4" layout="vertical">
                <Alert
                  message="Bước 5: Gắn Sản Phẩm vào Quyền Truy Cập"
                  description="Gắn sản phẩm đã tạo vào entitlement."
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
                {wizardData.entitlement && (
                  <Alert
                    message={`Entitlement đã tạo: ${wizardData.entitlement.display_name}`}
                    type="success"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                )}
                <Alert
                  message="Sản phẩm sẽ được gắn tự động vào entitlement."
                  type="warning"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
                <Form.Item>
                  <Space>
                    <Button
                      onClick={handleWizardPrev}
                      icon={<ArrowLeftOutlined />}
                    >
                      Quay Lại
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => handleWizardStep(4, {})}
                      loading={wizardLoading}
                      icon={<ArrowRightOutlined />}
                    >
                      Tiếp Theo
                    </Button>
                    <Button onClick={handleWizardCancel}>Hủy</Button>
                  </Space>
                </Form.Item>
              </Form>
            )}

            {wizardCurrentStep === 5 && (
              <Form name="step-5" layout="vertical">
                <Alert
                  message="Bước 6: Tạo Gói Dịch Vụ (Offering)"
                  description="Tạo offering để nhóm các packages lại với nhau."
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
                <Form.Item
                  label="Lookup Key"
                  name="lookup_key"
                  rules={[
                    { required: true, message: "Vui lòng nhập lookup key" },
                    { min: 1, max: 200 },
                  ]}
                  tooltip="Mã định danh (ví dụ: default, premium_offering)"
                >
                  <Input placeholder="default" />
                </Form.Item>
                <Form.Item
                  label="Tên Hiển Thị"
                  name="display_name"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên hiển thị" },
                  ]}
                >
                  <Input placeholder="Gói Dịch Vụ Premium" />
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button
                      onClick={handleWizardPrev}
                      icon={<ArrowLeftOutlined />}
                    >
                      Quay Lại
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={wizardLoading}
                      icon={<ArrowRightOutlined />}
                    >
                      Tiếp Theo
                    </Button>
                    <Button onClick={handleWizardCancel}>Hủy</Button>
                  </Space>
                </Form.Item>
              </Form>
            )}

            {wizardCurrentStep === 6 && (
              <Form
                name="step-6"
                layout="vertical"
                initialValues={{ position: 0 }}
              >
                <Alert
                  message="Bước 7: Tạo Package"
                  description="Tạo package trong offering để hiển thị trên paywall."
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
                {wizardData.offering && (
                  <Alert
                    message={`Offering đã tạo: ${wizardData.offering.display_name}`}
                    type="success"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                )}
                <Form.Item
                  label="Lookup Key"
                  name="lookup_key"
                  rules={[
                    { required: true, message: "Vui lòng nhập lookup key" },
                    { min: 1, max: 200 },
                  ]}
                  tooltip="Mã định danh (ví dụ: monthly, annual)"
                >
                  <Input placeholder="monthly" />
                </Form.Item>
                <Form.Item
                  label="Tên Hiển Thị"
                  name="display_name"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên hiển thị" },
                  ]}
                >
                  <Input placeholder="Gói Hàng Tháng" />
                </Form.Item>
                <Form.Item
                  label="Vị Trí"
                  name="position"
                  tooltip="Vị trí hiển thị (số nhỏ hơn hiển thị trước)"
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button
                      onClick={handleWizardPrev}
                      icon={<ArrowLeftOutlined />}
                    >
                      Quay Lại
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={wizardLoading}
                      icon={<ArrowRightOutlined />}
                    >
                      Tiếp Theo
                    </Button>
                    <Button onClick={handleWizardCancel}>Hủy</Button>
                  </Space>
                </Form.Item>
              </Form>
            )}

            {wizardCurrentStep === 8 && (
              <Form
                name="step-8"
                layout="vertical"
                initialValues={{ eligibility_criteria: "all" }}
              >
                <Alert
                  message="Bước 9: Gắn Sản Phẩm vào Package"
                  description="Bước cuối cùng! Gắn sản phẩm vào package để hoàn tất."
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
                {wizardData.package && (
                  <Alert
                    message={`Package đã tạo: ${wizardData.package.display_name}`}
                    type="success"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                )}
                <Form.Item
                  label="Điều Kiện Đủ Điều Kiện"
                  name="eligibility_criteria"
                  rules={[{ required: true }]}
                  tooltip="Điều kiện để sản phẩm được hiển thị"
                >
                  <Select>
                    <Select.Option value="all">Tất Cả Người Dùng</Select.Option>
                    <Select.Option value="google_sdk_lt_6">
                      Google SDK &lt; 6
                    </Select.Option>
                    <Select.Option value="google_sdk_ge_6">
                      Google SDK ≥ 6
                    </Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Space>
                    <Button
                      onClick={handleWizardPrev}
                      icon={<ArrowLeftOutlined />}
                    >
                      Quay Lại
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={wizardLoading}
                      icon={<CheckOutlined />}
                    >
                      Hoàn Tất
                    </Button>
                    <Button onClick={handleWizardCancel}>Hủy</Button>
                  </Space>
                </Form.Item>
              </Form>
            )}
          </Form.Provider>
        </Modal>
      </div>
    </div>
  );
}
