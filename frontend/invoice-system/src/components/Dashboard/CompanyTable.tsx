import { motion } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  CreditCard,
  Edit,
  Eye,
  Filter,
  LayoutGrid,
  List,
  Mail,
  MapPin,
  PlusCircle,
  Receipt,
  Search,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

const ModernCompanyTable = ({
  filteredCompanies,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  handleEdit,
  handleDelete,
  handleAddNew,
  filterStatus,
  setFilterStatus,
  viewMode,
  setViewMode,
  onRetry
}) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const navigate = useNavigate();

  // ======================
  // Company Card Component
  // ======================
  const CompanyCard = ({ company, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: 0, scale: 1.01 }}
      className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden w-full max-w-sm"
    >
      {/* Status */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${"active" === "active" ? "bg-emerald-400" : "bg-gray-300"
            } shadow-sm`}
        ></div>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full ${"active" === "active"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-gray-100 text-gray-600"
            }`}
        >
          {/* {company.status.charAt(0).toUpperCase() + company.status.slice(1)} */}
        </span>
      </div>

      {/* Info */}
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <Building2 size={20} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors truncate">
              {company.name}
            </h3>
            <p className="text-gray-500 text-sm font-mono">{company.gstin}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail size={14} />
            <span className="truncate">{company.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={14} />
            <span className="truncate">{company.address?.city}, {company.address.state}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <CreditCard size={14} />
            <span className="truncate">{company.bank?.bankName}</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3">
          <p className="text-xs text-gray-600 mb-1">Revenue</p>
          <p className="font-bold text-gray-900">
            ₹{204}K
          </p>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3">
          <p className="text-xs text-gray-600 mb-1">Growth</p>
          <p
            className={`font-bold ${company.growth > 0 ? "text-emerald-600" : "text-red-600"
              }`}
          >
            {"24"}
            {""}%
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={()=>navigate(`/${company._id}/invoice`)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-100 text-blue-700 rounded-xl font-medium hover:bg-blue-200 transition-colors text-sm"
        >
          <Receipt size={14} />
          Invoice
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
          onClick={()=>navigate(`/${company._id}/invoice`)}
        >
          <Eye size={16} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleDelete(company)}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <Trash2 size={16} />
        </motion.button>
      </div>
    </motion.div>
  );

  // ======================
  // Content Renderer
  // ======================
  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/80 rounded-2xl p-6 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-300 rounded"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16">
          <AlertTriangle
            size={64}
            className="mx-auto text-red-500 mb-6"
          />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Unable to Load Data
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium"
          >
            Try Again
          </motion.button>
        </div>
      );
    }

    if (!filteredCompanies?.length) {
      return (
        <div className="text-center py-16">
          <Building2 size={64} className="mx-auto text-gray-400 mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {searchTerm ? "No matching companies found" : "No companies yet"}
          </h3>
          <p className="text-gray-600 mb-8">
            {searchTerm
              ? "Try adjusting your search or filter criteria."
              : "Create your first company to get started."}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddNew}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <PlusCircle size={20} />
            Add Your First Company
          </motion.button>
        </div>
      );
    }

    return (
      <div
        className={`${viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
          }`}
      >
        {filteredCompanies.map((company, index) => (
          <CompanyCard key={company._id} company={company} index={index} />
        ))}
      </div>
    );
  };

  // ======================
  // Main Render
  // ======================
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-sm border-b border-white/30 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Companies</h2>
              <p className="text-gray-600">Manage your business entities</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 lg:w-80">
              <Search
                size={18}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-xl 
                  outline-none transition-all duration-300 focus:border-blue-400 focus:shadow-lg font-medium"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-4 pr-8 py-3 bg-white/80 border-2 border-gray-200/50 rounded-xl outline-none font-medium appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <Filter
                  size={16}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>

              {/* Toggle View */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${viewMode === "grid"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-400 hover:bg-gray-100"
                    }`}
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${viewMode === "list"
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-400 hover:bg-gray-100"
                    }`}
                >
                  <List size={18} />
                </button>
              </div>

              {/* Add */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddNew}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold 
                  shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
              >
                <PlusCircle size={18} />
                Add Company
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">{renderContent()}</div>
    </motion.div>
  );
};

export default ModernCompanyTable;
