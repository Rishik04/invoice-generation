import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "./redux/hooks"; // Import your custom Redux hooks
import Dashboard from "./components/Dashboard";
import DashTest from "./components/DashTest";
import Authentication from "./components/Authentication"; // Assuming this is your login/auth component
import InvoiceForm from "./components/InvoiceForm";
import DashboardLayout from "./components/layouts/DashboardLayout"

// A simple component to protect routes
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  // You might want a loading spinner here while auth state is being determined
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Loading authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to the login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children; // Render the child component if authenticated
};

function App() {
  const { isAuthenticated } = useAppSelector((state) => state.auth); // Get auth state for root redirect

  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<Authentication />} />

        {/* Protected Dashboard Route */}
        <Route path="/" element={<DashboardLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashTest />
            </ProtectedRoute>
          }
        />

        {/* Default Route: Redirect based on authentication status */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/:id/invoice"
          element={
            <ProtectedRoute>
              <InvoiceForm />
            </ProtectedRoute>
          }
        />
        </Route>

        {/* Optional: Add a 404 Not Found page */}
        <Route
          path="*"
          element={
            <h1 style={{ textAlign: "center", marginTop: "50px" }}>
              404 - Page Not Found
            </h1>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
