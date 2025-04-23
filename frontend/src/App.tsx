import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "./Components/Dashboard/Dashboard";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import EmailVerification from "./Verification/EmailVerification";
import ProtectedRoute from "./Components/ProtectedRoute";
import Profile from "./Components/Dashboard/Profile";
import Settings from "./Components/Dashboard/Settings";
import Categorizer from "./Components/Dashboard/Categorizer";
import AboutUs from "./Components/Dashboard/AboutUs";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ResetPassword from "./Components/ResetPassword/ResetPassword";
import SetNewPassword from "./Components/ResetPassword/SetNewPassword";
import ProductSystem from "./Components/Main/ProtuctSystem";
import EmailVerificationPage from "./Verification/EmailVerificationPage";
import Channels from "./Components/Main/Channels";
import FilesOverview from "./Components/Uploader/FilesOverview";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ResetPassword />,
  },
  {
    path: "/reset-password/:token",
    element: <SetNewPassword />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/about-us",
    element: (
      <ProtectedRoute>
        <AboutUs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/categorizer",
    element: (
      <ProtectedRoute>
        <Categorizer />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ProductSystem",
    element: (
      <ProtectedRoute>
        <ProductSystem />
      </ProtectedRoute>
    ),
  },
  {
    path: "/channels",
    element: (
      <ProtectedRoute>
        <Channels />
      </ProtectedRoute>
    ),
  },
  {
    path: "/filesOverview",
    element: (
      <ProtectedRoute>
        <FilesOverview />
      </ProtectedRoute>
    ),
  },
  {
    path: "/verify/:token",
    element: <EmailVerification />,
  },
  {
    path: "/email-verification",
    element: <EmailVerificationPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
