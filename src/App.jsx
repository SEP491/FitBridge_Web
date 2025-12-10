import "./index.css";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useLocation,
  Outlet,
} from "react-router-dom";
import Cookies from "js-cookie";
import { route } from "./routes";
import ManageGymPage from "./pages/AdminPages/ManageGymPage/ManageGymPage";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import DashboardPage from "./pages/AdminPages/DashboardPage/DashboardPage";
import ManagePTPage from "./pages/AdminPages/ManagePTPage/ManagePTPage";
import ManageNotificationPage from "./pages/AdminPages/ManageNotificationPage/ManageNotificationPage";
import ManagePackagesPage from "./pages/AdminPages/ManagePackagesPage/ManagePackagesPage";
import ManageUserPage from "./pages/AdminPages/ManageUserPage/ManageUserPage";
import ManagePTGym from "./pages/GymPages/ManagePTGym/ManagePTGym";
import ManageGymTransaction from "./pages/GymPages/ManageGymTransaction/ManageGymTransaction";
import ManageGymInformation from "./pages/GymPages/ManageGymInformation/ManageGymInformation";
import DashboardGym from "./pages/GymPages/DashboardGym/DashboardGym";
import ManageGymPackages from "./pages/GymPages/ManageGymPackages/ManageGymPackages";
import ManageSlotGym from "./pages/GymPages/ManageSlotGym/ManageSlotGym";
import OrderProcessPage from "./pages/OrderProcessPage/OrderProcessPage";
import ManageTransactionPage from "./pages/AdminPages/ManageTransactionPage/ManageTransactionPage";
import ManagePremiumPage from "./pages/AdminPages/ManagePremiumPage/ManagePremiumPage";
import LoginPages from "./pages/LoginPages/LoginPages";
import EmailConfirmPage from "./pages/EmailConfirmPage/EmailConfirmPage";
import ManageVoucherPT from "./pages/FreelancePT-Pages/ManageVoucher/ManageVoucherPT";
import { useEffect } from "react";
import ManageVoucher from "./pages/AdminPages/ManageVoucher/ManageVoucher";
import ManagePackageFPT from "./pages/FreelancePT-Pages/ManagePackageFPT/ManagePackageFPT";
import DashboardFPT from "./pages/FreelancePT-Pages/DashboardFPT/DashboardFPT";
import CustomerVoucherPage from "./pages/CustomerVoucherPage/CustomerVoucherPage";
import ManageWithdrawalPage from "./pages/AdminPages/ManageWithdrawalPage/ManageWithdrawalPage";
import ManageGymCustomers from "./pages/GymPages/ManageCustomer/ManageCustomer";
import ManageReportPage from "./pages/AdminPages/ManageReportPage/ManageReportPage";
import ManageProductPage from "./pages/AdminPages/ManageProductPage/ManageProductPage";
import ManageOrderPage from "./pages/AdminPages/ManageOrderPage/ManageOrderPage";
import ManageContractPage from "./pages/AdminPages/ManageContractPage/ManageContractPage";
import ContractSigningPage from "./pages/GymPages/ContractSigningPage/ContractSigningPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import { MessagingStateProvider } from "./context/messagingStateContext";
import { NotificationSignalRProvider } from "./context/NotificationSignalRContext";
import { NotificationProvider } from "./context/NotificationContext";
import ChatBubble from "./components/Chat/ChatBubble";
import ManageCerPage from "./pages/AdminPages/ManageCerPage/ManageCerPage";

// JWT Decode function with expiration validation
const decodeJWT = (token) => {
  try {
    if (!token) return null;

    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT token");
    }

    const payload = parts[1];
    const paddedPayload = payload + "===".slice((payload.length + 3) % 4);
    const decoded = atob(paddedPayload.replace(/-/g, "+").replace(/_/g, "/"));

    const parsedPayload = JSON.parse(decoded);

    // Check if token is expired
    if (parsedPayload.exp) {
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      if (parsedPayload.exp < currentTime) {
        console.log("Token expired:", new Date(parsedPayload.exp * 1000));
        return null; // Token is expired
      }
    }

    return parsedPayload;
  } catch (error) {
    console.error("JWT decode error:", error);
    return null;
  }
};

// Get user role from tokens (with expiration check)
const getUserRole = () => {
  const accessToken = Cookies.get("accessToken");
  const refreshToken = Cookies.get("refreshToken");

  // Try access token first
  if (accessToken) {
    const decoded = decodeJWT(accessToken);
    if (decoded) {
      // Check different possible role claim formats
      const role =
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] ||
        decoded.role ||
        decoded["role"];
      return role;
    } else {
      // Access token is expired or invalid, remove it
      Cookies.remove("accessToken");
    }
  }

  // Fallback to refresh token
  if (refreshToken) {
    const decoded = decodeJWT(refreshToken);
    console.log("Decoded Refresh Token:", decoded);
    if (decoded) {
      const role =
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] ||
        decoded.role ||
        decoded["role"];
      return role;
    } else {
      // Refresh token is expired or invalid, remove all tokens
      Cookies.remove("refreshToken");
      Cookies.remove("accessToken");
      Cookies.remove("idToken");
      Cookies.remove("user");
    }
  }

  return null;
};

// Check if user is authenticated (with expiration validation)
const isAuthenticated = () => {
  // const accessToken = Cookies.get('accessToken');
  const refreshToken = Cookies.get("refreshToken");

  // // Check access token first
  // if (accessToken) {
  //   const decoded = decodeJWT(accessToken);
  //   if (decoded) {
  //     return true; // Access token is valid and not expired
  //   } else {
  //     // Access token is expired or invalid, remove it
  //     Cookies.remove('accessToken');
  //   }
  // }

  // Check refresh token as fallback
  if (refreshToken) {
    const decoded = decodeJWT(refreshToken);
    if (decoded) {
      return true; // Refresh token is valid and not expired
    } else {
      // Refresh token is expired or invalid, remove all tokens
      Cookies.remove("refreshToken");
      Cookies.remove("accessToken");
      Cookies.remove("idToken");
      Cookies.remove("user");
      return false;
    }
  }

  return false;
};

// Get dashboard route based on user role
const getDashboardRoute = (role) => {
  switch (role) {
    case "Admin":
      return route.admin + "/" + route.dashboard;
    case "GymOwner":
    case "GYM":
      return route.gym + "/" + route.dashboardGym;
    case "FreelancePT":
      return route.freelancePt + "/" + route.dashboardPT;
    default:
      return route.welcomeLogin;
  }
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = getUserRole();
  const authenticated = isAuthenticated();

  console.log("ProtectedRoute - User Role:", userRole);
  console.log("ProtectedRoute - Authenticated:", authenticated);
  console.log("ProtectedRoute - Allowed Roles:", allowedRoles);

  if (!authenticated) {
    return <Navigate to={route.welcomeLogin} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={route.welcomeLogin} replace />;
  }

  return children;
};

// Conditional ChatBubble Component - hides on specific routes
const ConditionalChatBubble = () => {
  const location = useLocation();

  // Routes where ChatBubble should be hidden (using absolute paths)
  const hiddenRoutes = [
    route.welcomeLogin, // "/"
    route.confirmEmail, // "/confirm-email"
    `/${route.orderProcess}`, // "/order-process"
    "/voucher",
  ];

  // Check if current path should hide ChatBubble
  const shouldHide = hiddenRoutes.some((hiddenRoute) => {
    // Handle both exact matches and pathname starts with
    return (
      location.pathname === hiddenRoute ||
      location.pathname.startsWith(hiddenRoute + "/")
    );
  });

  if (shouldHide) {
    return null;
  }

  return <ChatBubble />;
};

// Root Layout Component - wraps all routes and includes ConditionalChatBubble
const RootLayout = () => {
  return (
    <>
      <Outlet />
      <ConditionalChatBubble />
    </>
  );
};

function App() {
  useEffect(() => {
    console.log("User Role from Tokens:", getUserRole());
  }, []);

  // Component to handle login redirect
  const LoginRedirect = () => {
    const userRole = getUserRole();
    const authenticated = isAuthenticated();

    if (authenticated && userRole) {
      const dashboardRoute = getDashboardRoute(userRole);
      return <Navigate to={dashboardRoute} replace />;
    }

    return <LoginPages />;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <RootLayout />,
      children: [
        {
          index: true,
          element: <LoginRedirect />,
        },
        {
          path: route.confirmEmail,
          element: <EmailConfirmPage />,
        },
        {
          path: route.orderProcess,
          element: <OrderProcessPage />,
        },
        {
          path: "/voucher",
          element: <CustomerVoucherPage />,
        },

        // Admin Routes - Protected for Admin role only
        {
          path: route.admin,
          element: (
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          ),
          children: [
            {
              path: route.dashboard,
              element: (
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <DashboardPage />
                </ProtectedRoute>
              ),
            },
            {
              path: route.manageGym,
              element: (
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <ManageGymPage />
                </ProtectedRoute>
              ),
            },
            {
              path: route.managePT,
              element: (
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <ManagePTPage />
                </ProtectedRoute>
              ),
            },
            {
              path: route.manageNotification,
              element: (
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <ManageNotificationPage />
                </ProtectedRoute>
              ),
            },
            {
              path: route.managePackages,
              element: (
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <ManagePackagesPage />
                </ProtectedRoute>
              ),
            },
            {
              path: route.manageUser,
              element: (
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <ManageUserPage />
                </ProtectedRoute>
              ),
            },
            {
              path: route.manageTransaction,
              element: (
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <ManageTransactionPage />
                </ProtectedRoute>
              ),
            },
            {
              path: `manage-premium`,
              element: (
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <ManagePremiumPage />
                </ProtectedRoute>
              ),
            },
            {
              path: route.manageVoucher,
              element: (
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <ManageVoucher />
                </ProtectedRoute>
              ),
            },
            {
              path: route.manageWithdrawal,
              element: (
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <ManageWithdrawalPage />
                </ProtectedRoute>
              ),
            },
            {
              path: route.manageReport,
              element: (
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <ManageReportPage />
                </ProtectedRoute>
              ),
            },
            {
              path: route.manageProduct,
              element: (
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <ManageProductPage />
                </ProtectedRoute>
              ),
            },
            {
              path: route.manageOrder,
              element: (
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <ManageOrderPage />
                </ProtectedRoute>
              ),
            },
            {
              path: route.manageContract,
              element: (
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <ManageContractPage />
                </ProtectedRoute>
              ),
            },
            {
              path: route.manageCertificate,
              element: (
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <ManageCerPage />
                </ProtectedRoute>
              ),
            },
          ],
        },

        // Gym Routes - Protected for GymOwner role
        {
          path: route.gym,
          element: (
            <ProtectedRoute allowedRoles={["GymOwner", "GYM"]}>
              <AdminLayout />
            </ProtectedRoute>
          ),
          children: [
            {
              path: route.dashboardGym,
              element: (
                <ProtectedRoute allowedRoles={["GymOwner", "GYM"]}>
                  <DashboardGym />
                </ProtectedRoute>
              ),
            },
            {
              path: route.manageinformationGym,
              element: (
                <ProtectedRoute allowedRoles={["GymOwner", "GYM"]}>
                  <ManageGymInformation />
                </ProtectedRoute>
              ),
            },
            {
              path: route.managePTGym,
              element: (
                <ProtectedRoute allowedRoles={["GymOwner", "GYM"]}>
                  <ManagePTGym />
                </ProtectedRoute>
              ),
            },
            {
              path: route.managePackagesGym,
              element: (
                <ProtectedRoute allowedRoles={["GymOwner", "GYM"]}>
                  <ManageGymPackages />
                </ProtectedRoute>
              ),
            },
            {
              path: route.manageTransactionGym,
              element: (
                <ProtectedRoute allowedRoles={["GymOwner", "GYM"]}>
                  <ManageGymTransaction />
                </ProtectedRoute>
              ),
            },
            {
              path: route.manageSlotGym,
              element: (
                <ProtectedRoute allowedRoles={["GymOwner", "GYM"]}>
                  <ManageSlotGym />
                </ProtectedRoute>
              ),
            },
            {
              path: route.manageVoucherGym,
              element: (
                <ProtectedRoute allowedRoles={["GymOwner", "GYM"]}>
                  <ManageVoucherPT />
                </ProtectedRoute>
              ),
            },
            {
              path: `${route.contractSigning}`,
              element: (
                <ProtectedRoute allowedRoles={["GymOwner", "GYM"]}>
                  <ContractSigningPage />
                </ProtectedRoute>
              ),
            },
            {
              path: "manage-customers",
              element: (
                <ProtectedRoute allowedRoles={["GymOwner", "GYM"]}>
                  <ManageGymCustomers />
                </ProtectedRoute>
              ),
            },
            {
              path: "profile",
              element: (
                <ProtectedRoute allowedRoles={["GymOwner", "GYM"]}>
                  <ProfilePage />
                </ProtectedRoute>
              ),
            },
          ],
        },

        // Freelance PT Routes - Protected for FreelancePT role
        {
          path: route.freelancePt,
          element: (
            <ProtectedRoute allowedRoles={["FreelancePT"]}>
              <AdminLayout />
            </ProtectedRoute>
          ),
          children: [
            {
              path: route.dashboardPT,
              element: (
                <ProtectedRoute allowedRoles={["FreelancePT"]}>
                  <DashboardFPT />
                </ProtectedRoute>
              ),
            },

            {
              path: route.manageVoucherPT,
              element: (
                <ProtectedRoute allowedRoles={["FreelancePT"]}>
                  <ManageVoucherPT />
                </ProtectedRoute>
              ),
            },
            {
              path: route.managePackageFPT,
              element: (
                <ProtectedRoute allowedRoles={["FreelancePT"]}>
                  <ManagePackageFPT />
                </ProtectedRoute>
              ),
            },
            {
              path: "profile",
              element: (
                <ProtectedRoute allowedRoles={["FreelancePT"]}>
                  <ProfilePage />
                </ProtectedRoute>
              ),
            },
          ],
        },
        {
          path: "*",
          element: <LoginRedirect />,
        },
      ],
    },
  ]);
  return (
    <MessagingStateProvider>
      <NotificationSignalRProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </NotificationSignalRProvider>
    </MessagingStateProvider>
  );
}

export default App;
