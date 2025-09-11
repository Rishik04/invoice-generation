import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle
} from 'lucide-react';
import { useMemo, useState } from 'react';
import ModernCompanyForm from './CompanyForm';
import ModernCompanyTable from './CompanyTable';
import ModernDashboardHeader from './DashboardHeader';
import ModernDashboardStats from './DashboardStats';

// ============================================================================
// Mock Data & Hooks (For Demonstration)
// ============================================================================

const mockCompanies = [
  {
    _id: '1', name: 'TechCorp Solutions', gstin: '22AABCS1429B1ZX', hallMarkNumber: 'HM12345',
    email: 'contact@techcorp.com', phone: ['9876543210', '9876543211'], address: '123 Tech Street, Mumbai',
    state: 'Maharashtra', stateCode: '27', status: 'active', lastInvoice: '2024-03-15',
    bankDetails: { name: 'HDFC Bank', branch: 'Andheri East', accountNumber: '1234567890', ifsc: 'HDFC0001234' },
    termsConditions: ['Payment within 30 days', 'Late fees applicable'],
    revenue: 245000, growth: 12.5
  },
  {
    _id: '2', name: 'Global Enterprises', gstin: '07AABCG1429B1ZY', hallMarkNumber: 'HM67890',
    email: 'info@global.com', phone: ['9876543212'], address: '456 Business Ave, Delhi',
    state: 'Delhi', stateCode: '07', status: 'active', lastInvoice: '2024-03-10',
    bankDetails: { name: 'ICICI Bank', branch: 'CP Branch', accountNumber: '0987654321', ifsc: 'ICIC0000123' },
    termsConditions: ['Net 45 payment terms'],
    revenue: 180000, growth: 8.2
  },
  {
    _id: '3', name: 'Jewelry Express', gstin: '27AABCJ1429B1ZZ', hallMarkNumber: 'HM99999',
    email: 'hello@jewelryexpress.com', phone: ['9876543213'], address: '789 Gold Street, Pune',
    state: 'Maharashtra', stateCode: '27', status: 'inactive', lastInvoice: '2024-02-28',
    bankDetails: { name: 'SBI Bank', branch: 'Pune Main', accountNumber: '5555666677', ifsc: 'SBIN0001234' },
    termsConditions: ['Payment on delivery'],
    revenue: 95000, growth: -2.1
  }
];

// Mock Redux-like hooks
const useAppSelector = (selector) => ({
  companies: mockCompanies,
  loading: false,
  error: null // Change to "Failed to fetch data." to test the error state
});

const useAppDispatch = () => (action) => console.log('Dispatched:', action);

// ============================================================================
// Custom Hook for Logic Separation
// ============================================================================

/**
 * @description A custom hook to manage all state and logic for the company dashboard.
 * This separates business logic from the UI components.
 */
const useCompanyDashboard = () => {
  const { companies, loading, error } = useAppSelector((state) => state.company);
  const dispatch = useAppDispatch();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);

  const filteredCompanies = useMemo(() =>
    companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [companies, searchTerm]);

  const handleAddNew = () => {
    setSelectedCompany(null);
    setIsFormOpen(true);
  };

  const handleEdit = (company) => {
    setSelectedCompany(company);
    setIsFormOpen(true);
  };

  const handleDelete = (company) => {
    setCompanyToDelete(company);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (companyToDelete) {
      // dispatch(deleteCompanyAction(companyToDelete._id));
      console.log('Deleting company:', companyToDelete);
    }
    setIsDeleteOpen(false);
    setCompanyToDelete(null);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedCompany(null);
  }

  return {
    companies, loading, error, searchTerm, setSearchTerm, filteredCompanies,
    selectedCompany, isFormOpen, closeForm, handleAddNew, handleEdit,
    isDeleteOpen, setIsDeleteOpen, companyToDelete, handleDelete, confirmDelete
  };
};

// ============================================================================
// Main Dashboard Component
// ============================================================================

const ModernCompanyDashboard = () => {
  const {
    companies, loading, error, searchTerm, setSearchTerm, filteredCompanies,
    selectedCompany, isFormOpen, closeForm, handleAddNew, handleEdit,
    isDeleteOpen, setIsDeleteOpen, companyToDelete, handleDelete, confirmDelete
  } = useCompanyDashboard();

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <ModernDashboardHeader companies={companies} loading={loading} />
        
        <ModernCompanyTable
          filteredCompanies={filteredCompanies}
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleAddNew={handleAddNew}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
        
        <ModernDashboardStats />
      </div>

      <ModernCompanyForm
        isOpen={isFormOpen}
        onClose={closeForm}
        company={selectedCompany}
      />

      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"><AlertTriangle size={32} className="text-red-500" /></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Company</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete "{companyToDelete?.name}"? This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setIsDeleteOpen(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                  <button onClick={confirmDelete} className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors">Delete</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModernCompanyDashboard;