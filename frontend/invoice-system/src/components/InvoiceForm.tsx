import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle, 
  Trash2, 
  Home, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  FileText,
  Calculator,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  Check,
  Receipt,
  Coins
} from 'lucide-react';

const ModernInvoiceForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    invoiceNumber: 'INV-2024-001',
    date: new Date().toISOString().split('T')[0],
    customer: {
      name: '',
      address: '',
      phone: '',
      state: ''
    },
    items: [{
      type: 'S',
      description: '',
      hsnCode: '7113',
      purity: '18k',
      grossWeight: 0,
      netWeight: 0,
      rate: 0,
      makingCharges: 0,
      otherCharges: 0
    }]
  });

  // Mock company data
  const selectedCompany = {
    name: "Golden Ornaments Ltd",
    address: "123 Jewelry Street, Mumbai, Maharashtra 400001",
    gstin: "27ABCDE1234F1Z5",
    email: "info@goldenornaments.com",
    phone: ["022-12345678", "9876543210"],
    state: "Maharashtra",
    hallMarkNumber: "HM-12345",
    bankDetails: {
      name: "HDFC Bank",
      branch: "Bandra West",
      accountNumber: "12345678901234",
      ifsc: "HDFC0001234"
    }
  };

  const handleInputChange = (field, value, index = null, subField = null) => {
    setFormData(prev => {
      if (index !== null) {
        const newItems = [...prev.items];
        newItems[index] = { ...newItems[index], [field]: value };
        return { ...prev, items: newItems };
      } else if (subField) {
        return {
          ...prev,
          [field]: { ...prev[field], [subField]: value }
        };
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        type: 'S',
        description: '',
        hsnCode: '7113',
        purity: '18k',
        grossWeight: 0,
        netWeight: 0,
        rate: 0,
        makingCharges: 0,
        otherCharges: 0
      }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const { subtotal, sgst, cgst, total } = useMemo(() => {
    const GST_RATE = 0.03;
    
    const currentSubtotal = formData.items.reduce((acc, item) => {
      const itemRate = (Number(item.netWeight) || 0) * (Number(item.rate) || 0);
      const itemValue = itemRate + (itemRate * (Number(item.makingCharges) / 100) || 0) + (Number(item.otherCharges) || 0);
      return acc + itemValue;
    }, 0);

    const currentSgst = parseFloat((currentSubtotal * (GST_RATE / 2)).toFixed(2));
    const currentCgst = parseFloat((currentSubtotal * (GST_RATE / 2)).toFixed(2));
    const currentTotal = parseFloat((currentSubtotal + currentSgst + currentCgst).toFixed(2));

    return {
      subtotal: parseFloat(currentSubtotal.toFixed(2)),
      sgst: currentSgst,
      cgst: currentCgst,
      total: currentTotal
    };
  }, [formData.items]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.3 } }
  };

  const InputField = ({ 
    icon: Icon, 
    type = "text", 
    placeholder, 
    value, 
    onChange, 
    className = "",
    ...props 
  }) => (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
        <Icon size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-12 pr-4 py-3.5 bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl 
          transition-all duration-300 outline-none font-medium text-gray-900 placeholder-gray-500
          hover:border-gray-300 focus:border-blue-400 focus:bg-white focus:shadow-lg ${className}`}
        {...props}
      />
    </motion.div>
  );

  const SelectField = ({ 
    icon: Icon, 
    value, 
    onChange, 
    options, 
    placeholder = "Select option" 
  }) => (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
        <Icon size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3.5 bg-gray-50/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl 
          transition-all duration-300 outline-none font-medium text-gray-900 appearance-none
          hover:border-gray-300 focus:border-blue-400 focus:bg-white focus:shadow-lg"
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={16} />
    </motion.div>
  );

  const StepIndicator = ({ currentStep, totalSteps }) => (
    <div className="flex items-center justify-center mb-8">
      {[...Array(totalSteps)].map((_, index) => (
        <React.Fragment key={index}>
          <motion.div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
              ${index + 1 <= currentStep 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                : 'bg-gray-200 text-gray-500'}`}
            animate={{
              scale: index + 1 === currentStep ? 1.1 : 1,
              boxShadow: index + 1 === currentStep ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none'
            }}
          >
            {index + 1 <= currentStep - 1 ? <Check size={16} /> : index + 1}
          </motion.div>
          {index < totalSteps - 1 && (
            <div className={`w-12 h-1 mx-2 rounded transition-all duration-300 
              ${index + 1 < currentStep ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Create Invoice
            </h1>
            <p className="text-gray-600 mt-2">Generate professional invoices for your jewelry business</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl 
              text-gray-700 font-medium hover:bg-white hover:shadow-lg transition-all duration-300"
          >
            <Home size={18} />
            Dashboard
          </motion.button>
        </div>

        {/* Company Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mb-8 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{selectedCompany.name}</h3>
              <p className="text-gray-600">Invoice will be generated for this company</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <p><span className="font-semibold text-gray-800">GSTIN:</span> {selectedCompany.gstin}</p>
              <p><span className="font-semibold text-gray-800">Hallmark:</span> {selectedCompany.hallMarkNumber}</p>
              <p><span className="font-semibold text-gray-800">Email:</span> {selectedCompany.email}</p>
            </div>
            <div className="space-y-2">
              <p><span className="font-semibold text-gray-800">Address:</span> {selectedCompany.address}</p>
              <p><span className="font-semibold text-gray-800">Phone:</span> {selectedCompany.phone.join(", ")}</p>
            </div>
            <div className="space-y-2">
              <p><span className="font-semibold text-gray-800">Bank:</span> {selectedCompany.bankDetails.name}</p>
              <p><span className="font-semibold text-gray-800">A/C:</span> {selectedCompany.bankDetails.accountNumber}</p>
              <p><span className="font-semibold text-gray-800">IFSC:</span> {selectedCompany.bankDetails.ifsc}</p>
            </div>
          </div>
        </motion.div>

        {/* Main Form */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          <div className="p-8">
            <StepIndicator currentStep={step} totalSteps={3} />

            <AnimatePresence mode="wait">
              {/* Step 1: Invoice Details */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Invoice Information</h2>
                    <p className="text-gray-600">Set up basic invoice details</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div className="space-y-6">
                      <InputField
                        icon={Receipt}
                        placeholder="Invoice Number"
                        value={formData.invoiceNumber}
                        onChange={(value) => handleInputChange('invoiceNumber', value)}
                      />
                      <InputField
                        icon={Calendar}
                        type="date"
                        value={formData.date}
                        onChange={(value) => handleInputChange('date', value)}
                      />
                    </div>
                    <div className="space-y-6">
                      <InputField
                        icon={User}
                        placeholder="Customer Name"
                        value={formData.customer.name}
                        onChange={(value) => handleInputChange('customer', value, null, 'name')}
                      />
                      <InputField
                        icon={Phone}
                        placeholder="Customer Phone"
                        value={formData.customer.phone}
                        onChange={(value) => handleInputChange('customer', value, null, 'phone')}
                      />
                    </div>
                  </div>

                  <div className="flex justify-center mt-8">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(2)}
                      className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 
                        text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Continue
                      <ChevronRight size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Customer Details */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Customer Details</h2>
                    <p className="text-gray-600">Complete customer information</p>
                  </div>

                  <div className="max-w-2xl mx-auto space-y-6">
                    <InputField
                      icon={MapPin}
                      placeholder="Customer Address"
                      value={formData.customer.address}
                      onChange={(value) => handleInputChange('customer', value, null, 'address')}
                    />
                    <InputField
                      icon={MapPin}
                      placeholder="Customer State"
                      value={formData.customer.state}
                      onChange={(value) => handleInputChange('customer', value, null, 'state')}
                    />
                  </div>

                  <div className="flex gap-4 justify-center mt-8">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300"
                    >
                      <ArrowLeft size={18} />
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(3)}
                      className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 
                        text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Continue
                      <ChevronRight size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Items & Summary */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Invoice Items</h2>
                    <p className="text-gray-600">Add items and review totals</p>
                  </div>

                  <div className="space-y-6">
                    {formData.items.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50/80 rounded-xl p-6 border border-gray-200"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-semibold text-gray-800">Item {index + 1}</h4>
                          {formData.items.length > 1 && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => removeItem(index)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          <SelectField
                            icon={Coins}
                            value={item.type}
                            onChange={(value) => handleInputChange('type', value, index)}
                            options={[
                              { value: 'S', label: 'Silver' },
                              { value: 'G', label: 'Gold' }
                            ]}
                          />
                          <div className="md:col-span-2 lg:col-span-1">
                            <InputField
                              icon={FileText}
                              placeholder="Description"
                              value={item.description}
                              onChange={(value) => handleInputChange('description', value, index)}
                            />
                          </div>
                          <InputField
                            icon={FileText}
                            placeholder="HSN Code"
                            value={item.hsnCode}
                            onChange={(value) => handleInputChange('hsnCode', value, index)}
                          />
                          <SelectField
                            icon={Sparkles}
                            value={item.purity}
                            onChange={(value) => handleInputChange('purity', value, index)}
                            options={[
                              { value: '18k', label: '18k/750' },
                              { value: '22k', label: '22k/916' }
                            ]}
                          />
                          <InputField
                            icon={Calculator}
                            type="number"
                            placeholder="Gross Weight"
                            step="0.01"
                            value={item.grossWeight}
                            onChange={(value) => handleInputChange('grossWeight', value, index)}
                          />
                          <InputField
                            icon={Calculator}
                            type="number"
                            placeholder="Net Weight"
                            step="0.01"
                            value={item.netWeight}
                            onChange={(value) => handleInputChange('netWeight', value, index)}
                          />
                          <InputField
                            icon={Calculator}
                            type="number"
                            placeholder="Rate/gram"
                            step="0.01"
                            value={item.rate}
                            onChange={(value) => handleInputChange('rate', value, index)}
                          />
                          <InputField
                            icon={Calculator}
                            type="number"
                            placeholder="Making Charges %"
                            step="0.01"
                            value={item.makingCharges}
                            onChange={(value) => handleInputChange('makingCharges', value, index)}
                          />
                        </div>
                      </motion.div>
                    ))}

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={addItem}
                      className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-300 
                        rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all duration-300"
                    >
                      <PlusCircle size={20} />
                      Add Another Item
                    </motion.button>
                  </div>

                  {/* Summary */}
                  <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Invoice Summary</h3>
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="flex justify-between text-gray-700">
                        <span>Subtotal:</span>
                        <span className="font-semibold">₹ {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>SGST (1.5%):</span>
                        <span className="font-semibold">₹ {sgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>CGST (1.5%):</span>
                        <span className="font-semibold">₹ {cgst.toFixed(2)}</span>
                      </div>
                      <div className="border-t-2 border-gray-300 pt-3">
                        <div className="flex justify-between text-xl font-bold text-gray-900">
                          <span>Total Amount:</span>
                          <span>₹ {total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center mt-8">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(2)}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300"
                    >
                      <ArrowLeft size={18} />
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 
                        text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Receipt size={20} />
                      Generate Invoice
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ModernInvoiceForm;