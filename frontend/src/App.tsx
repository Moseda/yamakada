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
    path: "/dashboard/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/settings",
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/about-us",
    element: (
      <ProtectedRoute>
        <AboutUs />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard/categorizer",
    element: (
      <ProtectedRoute>
        <Categorizer />
      </ProtectedRoute>
    ),
  },
  {
    path: "/verify/:token",
    element: <EmailVerification />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
