
import "./index.css";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
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
import GymBillandContract from "./pages/GymPages/GymBillandContract/GymBillandContract";
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

// JWT Decode function
const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token');
    }

    const payload = parts[1];
    const paddedPayload = payload + '==='.slice((payload.length + 3) % 4);
    const decoded = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decoded);
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
};

// Get user role from tokens
const getUserRole = () => {
  const accessToken = Cookies.get('accessToken');
  const refreshToken = Cookies.get('refreshToken');
  
  // Try access token first
  if (accessToken) {
    const decoded = decodeJWT(accessToken);
    if (decoded) {
      // Check different possible role claim formats
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                   decoded.role || 
                   decoded['role'];
      return role;
    }
  }
  
  // Fallback to refresh token
  if (refreshToken) {
    const decoded = decodeJWT(refreshToken);
    console.log("Decoded Refresh Token:", decoded);
    if (decoded) {
      const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                   decoded.role || 
                   decoded['role'];
      return role;
    }
  }
  
  return null;
};


// Check if user is authenticated
const isAuthenticated = () => {
  const accessToken = Cookies.get('accessToken');
  const refreshToken = Cookies.get('refreshToken');
  return !!(accessToken || refreshToken);
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = getUserRole();
  const authenticated = isAuthenticated();
  
  console.log('ProtectedRoute - User Role:', userRole);
  console.log('ProtectedRoute - Authenticated:', authenticated);
  console.log('ProtectedRoute - Allowed Roles:', allowedRoles);
  
  if (!authenticated) {
    return <Navigate to={route.welcomeLogin} replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={route.welcomeLogin} replace />;
  }
  
  return children;
};

function App() {
  useEffect(() => {
    console.log("User Role from Tokens:", getUserRole());
  }, []);

  const router = createBrowserRouter([
    {
      path: route.welcomeLogin,
      element: <LoginPages />,
    },
    {
      path: route.confirmEmail,
      element: <EmailConfirmPage />,
    },
    {
      path: route.orderProcess,
      element: <OrderProcessPage />,
    },

    // Admin Routes - Protected for Admin role only
    {
      path: route.admin,
      element: (
        <ProtectedRoute allowedRoles={['Admin']}>
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: route.dashboard,
          element: (
            <ProtectedRoute allowedRoles={['Admin']}>
              <DashboardPage />
            </ProtectedRoute>
          ),
        },
        {
          path: route.manageGym,
          element: (
            <ProtectedRoute allowedRoles={['Admin']}>
              <ManageGymPage />
            </ProtectedRoute>
          ),
        },
        {
          path: route.managePT,
          element: (
            <ProtectedRoute allowedRoles={['Admin']}>
              <ManagePTPage />
            </ProtectedRoute>
          ),
        },
        {
          path: route.manageNotification,
          element: (
            <ProtectedRoute allowedRoles={['Admin']}>
              <ManageNotificationPage />
            </ProtectedRoute>
          ),
        },
        {
          path: route.managePackages,
          element: (
            <ProtectedRoute allowedRoles={['Admin']}>
              <ManagePackagesPage />
            </ProtectedRoute>
          ),
        },
        {
          path: route.manageUser,
          element: (
            <ProtectedRoute allowedRoles={['Admin']}>
              <ManageUserPage />
            </ProtectedRoute>
          ),
        },
        {
          path: route.manageTransaction,
          element: (
            <ProtectedRoute allowedRoles={['Admin']}>
              <ManageTransactionPage />
            </ProtectedRoute>
          ),
        },
        {
          path: `manage-premium`,
          element: (
            <ProtectedRoute allowedRoles={['Admin']}>
              <ManagePremiumPage />
            </ProtectedRoute>
          ),
        },
        {
          path: route.manageVoucher,
          element: (
            <ProtectedRoute allowedRoles={['Admin']}>
              <ManageVoucher />
            </ProtectedRoute>
          ),
        },
      ],
    },

    // Gym Routes - Protected for GymOwner role
    {
      path: route.gym,
      element: (
        <ProtectedRoute allowedRoles={['GymOwner', 'GYM']}>
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: route.dashboardGym,
          element: (
            <ProtectedRoute allowedRoles={['GymOwner', 'GYM']}>
              <DashboardGym />
            </ProtectedRoute>
          ),
        },
        {
          path: route.manageinformationGym,
          element: (
            <ProtectedRoute allowedRoles={['GymOwner', 'GYM']}>
              <ManageGymInformation />
            </ProtectedRoute>
          ),
        },
        {
          path: route.managePTGym,
          element: (
            <ProtectedRoute allowedRoles={['GymOwner', 'GYM']}>
              <ManagePTGym />
            </ProtectedRoute>
          ),
        },
        {
          path: route.managePackagesGym,
          element: (
            <ProtectedRoute allowedRoles={['GymOwner', 'GYM']}>
              <ManageGymPackages />
            </ProtectedRoute>
          ),
        },
        {
          path: route.manageTransactionGym,
          element: (
            <ProtectedRoute allowedRoles={['GymOwner', 'GYM']}>
              <ManageGymTransaction />
            </ProtectedRoute>
          ),
        },
        {
          path: route.manageSlotGym,
          element: (
            <ProtectedRoute allowedRoles={['GymOwner', 'GYM']}>
              <ManageSlotGym />
            </ProtectedRoute>
          ),
        },
        {
          path: route.billandcontract,
          element: (
            <ProtectedRoute allowedRoles={['GymOwner', 'GYM']}>
              <GymBillandContract />
            </ProtectedRoute>
          ),
        },
      ],
    },

    // Freelance PT Routes - Protected for FreelancePT role
    {
      path: route.freelancePt,
      element: (
        <ProtectedRoute allowedRoles={['FreelancePT']}>
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: route.manageVoucherPT,
          element: (
            <ProtectedRoute allowedRoles={['FreelancePT']}>
              <ManageVoucherPT />
            </ProtectedRoute>
          ),
        },
        {
          path: route.managePackageFPT,
          element: (
            <ProtectedRoute allowedRoles={['FreelancePT']}>
              <ManagePackageFPT />
            </ProtectedRoute>
          ),
        },
      ],
    },

    {
      path: "*",
      element: <Navigate to={route.welcomeLogin} />,
    },
  ]);
  return <RouterProvider router={router} />;
}

export default App;
