import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchCompany } from '@/redux/slices/companySlice';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import ModernCompanyForm from './CompanyForm';
import ModernCompanyTable from './CompanyTable';
import ModernDashboardHeader from './DashboardHeader';
import ModernDashboardStats from './DashboardStats';

// ============================================================================
// Custom Hook for Company Dashboard Logic
// ============================================================================
const useCompanyDashboard = () => {
  const dispatch = useAppDispatch();
  const { company, loading, error } = useAppSelector((state) => state.company);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<typeof company | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCompany());
  }, [dispatch]);

  const handleAddNew = () => {
    setSelectedCompany(null);
    setIsFormOpen(true);
  };

  const handleEdit = (companyData: typeof company) => {
    setSelectedCompany(companyData);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    console.log('Deleting company:', company);
    setIsDeleteOpen(false);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedCompany(null);
  };

  return {
    company,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCompany,
    isFormOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    handleAddNew,
    handleEdit,
    handleDelete,
    closeForm,
  };
};

// ============================================================================
// Main Dashboard Component
// ============================================================================
const ModernCompanyDashboard = () => {
  const {
    company,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCompany,
    isFormOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    handleAddNew,
    handleEdit,
    handleDelete,
    closeForm,
  } = useCompanyDashboard();

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <ModernDashboardHeader company={company} loading={loading} />

        <ModernCompanyTable
          filteredCompanies={company ? [company] : []} // single company as array
          loading={loading}
          error={error}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleAddNew={handleAddNew}
          handleEdit={handleEdit}
          handleDelete={() => setIsDeleteOpen(true)}
        />

        <ModernDashboardStats />
      </div>

      <ModernCompanyForm
        isOpen={isFormOpen}
        onClose={closeForm}
        company={selectedCompany}
      />

      <AnimatePresence>
        {isDeleteOpen && company && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <div className="bg-red-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <AlertTriangle size={32} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Company</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{company.name}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsDeleteOpen(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
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
