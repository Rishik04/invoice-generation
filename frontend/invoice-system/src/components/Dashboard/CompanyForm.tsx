import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Building2,
  CreditCard,
  FileSignature,
  FileText,
  Hash,
  Landmark,
  Mail,
  MapPin, Phone
} from 'lucide-react';
import { useEffect, useState } from 'react';

const ModernCompanyForm = ({ company, onClose, isOpen }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initialData = {
      name: "",
      address: "",
      gstin: "",
      hallMarkNumber: "",
      email: "",
      phone: "",
      state: "",
      stateCode: "",
      bankDetails: { name: "", branch: "", accountNumber: "", ifsc: "" },
      termsConditions: "",
    };
    if (company) {
      setFormData({
        ...initialData,
        ...company,
        phone: company.phone?.join(", ") || "",
        termsConditions: company.termsConditions?.join("\n") || "",
      });
    } else {
      setFormData(initialData);
    }
    setStep(1);
    setErrors({});
  }, [company, isOpen]);

  const handleInputChange = (field, value) => {
    const newFormData = { ...formData };
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      newFormData[parent] = { ...newFormData[parent], [child]: value };
    } else {
      newFormData[field] = value;
    }
    setFormData(newFormData);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name) newErrors.name = "Company name is required";
      if (!formData.gstin) newErrors.gstin = "GSTIN is required";
      if (!formData.address) newErrors.address = "Address is required";
    } else if (step === 2) {
      if (!formData.email) newErrors.email = "Email is required";
      if (!formData.phone) newErrors.phone = "Phone is required";
      if (!formData.state) newErrors.state = "State is required";
    } else if (step === 3) {
      if (!formData.bankDetails.name)
        newErrors["bankDetails.name"] = "Bank name is required";
      if (!formData.bankDetails.accountNumber)
        newErrors["bankDetails.accountNumber"] = "Account number is required";
      if (!formData.bankDetails.ifsc)
        newErrors["bankDetails.ifsc"] = "IFSC code is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      console.log("Submitting form data:", formData);
      setIsLoading(false);
      onClose();
    }, 1500);
  };

  const InputField = ({
    label,
    field,
    placeholder,
    type = "text",
    icon: Icon,
    required = false,
  }) => (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        {Icon && <Icon size={16} />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={
            field.includes(".")
              ? formData[field.split(".")[0]]?.[field.split(".")[1]] || ""
              : formData[field] || ""
          }
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={`w-full px-4 py-3.5 bg-gray-50/80 border-2 rounded-xl transition-all duration-300 outline-none font-medium 
            ${errors[field]
              ? "border-red-300 bg-red-50/50 focus:border-red-400"
              : "border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:bg-white focus:shadow-lg"
            }`}
        />
        {errors[field] && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm mt-2 flex items-center gap-2"
          >
            <AlertTriangle size={14} />
            {errors[field]}
          </motion.p>
        )}
      </div>
    </motion.div>
  );

  const StepIndicator = ({ currentStep, totalSteps }) => (
    <div className="flex items-center justify-center mb-8">
      {[...Array(totalSteps)].map((_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-colors ${index + 1 === currentStep
              ? "bg-blue-500 text-white"
              : index + 1 < currentStep
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-600"
              }`}
          >
            {index + 1}
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`w-12 h-1 ${index + 1 < currentStep ? "bg-green-500" : "bg-gray-300"
                }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/40 z-50 transition ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {company ? "Edit Company" : "Add New Company"}
        </h2>

        <StepIndicator currentStep={step} totalSteps={3} />

        <AnimatePresence mode="popLayout">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <InputField
                label="Company Name"
                field="name"
                placeholder="Enter company name"
                required
                icon={Building2}
              />
              <InputField
                label="GSTIN"
                field="gstin"
                placeholder="Enter GSTIN"
                required
                icon={Hash}
              />
              <InputField
                label="Address"
                field="address"
                placeholder="Enter address"
                required
                icon={MapPin}
              />
              <InputField
                label="Hallmark Number"
                field="hallMarkNumber"
                placeholder="Enter hallmark number"
                icon={FileText}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <InputField
                label="Email"
                field="email"
                placeholder="Enter email"
                type="email"
                required
                icon={Mail}
              />
              <InputField
                label="Phone"
                field="phone"
                placeholder="Enter phone numbers (comma separated)"
                required
                icon={Phone}
              />
              <InputField
                label="State"
                field="state"
                placeholder="Enter state"
                required
                icon={MapPin}
              />
              <InputField
                label="State Code"
                field="stateCode"
                placeholder="Enter state code"
                icon={Hash}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <InputField
                label="Bank Name"
                field="bankDetails.name"
                placeholder="Enter bank name"
                required
                icon={Landmark}
              />
              <InputField
                label="Branch"
                field="bankDetails.branch"
                placeholder="Enter branch"
                icon={Building2}
              />
              <InputField
                label="Account Number"
                field="bankDetails.accountNumber"
                placeholder="Enter account number"
                required
                icon={CreditCard}
              />
              <InputField
                label="IFSC Code"
                field="bankDetails.ifsc"
                placeholder="Enter IFSC code"
                required
                icon={Hash}
              />
              <InputField
                label="Terms & Conditions"
                field="termsConditions"
                placeholder="Enter terms and conditions (one per line)"
                icon={FileSignature}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
            >
              Back
            </button>
          )}
          <button
            onClick={() => onClose()}
            className="px-6 py-3 rounded-xl mx-2 bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`ml-auto px-6 py-3 rounded-xl font-semibold text-white transition ${isLoading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
              }`}
          >
            {isLoading
              ? "Saving..."
              : step < 3
                ? "Next"
                : company
                  ? "Update Company"
                  : "Create Company"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ModernCompanyForm;