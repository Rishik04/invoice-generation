import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Authentication from "./components/Authentication";
import DashTest from "./components/DashTest";
import InvoiceForm from "./components/InvoiceForm";
import DashboardLayout from "./components/layouts/DashboardLayout";
import { useAppSelector } from "./redux/hooks";
import CustomerPage from "./components/Customer";
import InvoicePage from "./components/Invoice";

const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Authentication />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashTest />} />
          <Route path=":id/invoice" element={<InvoiceForm />} />
          <Route path="customers" element={<CustomerPage />} />
          <Route path="invoices" element={<InvoicePage />} />
        </Route>
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;