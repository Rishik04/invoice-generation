import { useAppDispatch } from '@/redux/hooks';
import { loginUser } from '@/redux/slices/authSlice';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Sparkles,
  User,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

// Mock Redux hooks for demo - replace with your actual Redux implementation
// const useAppSelector = (selector) => ({
//   loading: false,
//   error: null,
//   successMessage: null,
//   isAuthenticated: false
// });

const ModernOnboarding = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    username: '',
    tenantName: '',
    companyName: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep = () => {
    const newErrors = {};

    if (activeTab === 'login') {
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
    } else if (activeTab === 'onboard') {
      if (step === 1) {
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.username) newErrors.username = 'Username is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
      } else if (step === 2) {
        if (!formData.tenantName) newErrors.tenantName = 'Tenant name is required';
        if (!formData.companyName) newErrors.companyName = 'Company name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validateStep()) return;

    if (activeTab === 'onboard' && step === 1) {
      setStep(2);
      return;
    }

    setIsLoading(true);
    const data = await dispatch(loginUser(formData))
    console.log(data);
    if (data?.payload?.success) {
      setIsLoading(false);
      navigate("/dashboard")
    }
    // Simulate API call - replace with your actual API calls
    // setTimeout(() => {
    //   setIsLoading(false);
    //   console.log('Form submitted:', formData);
    //   // Here you would dispatch your actual Redux actions:
    //   // or dispatch(onboardUser(formData))
    // }, 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: { duration: 0.3, ease: "easeIn" }
    }
  };

  const InputField = ({ icon: Icon, type = "text", placeholder, value, onChange, error, showToggle }) => (
    <motion.div
      className="relative group"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
        <Icon size={20} className={`transition-colors duration-200 ${error ? 'text-red-400' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
      </div>
      <input
        type={type === 'password' && showPassword ? 'text' : type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-12 pr-${showToggle ? '12' : '4'} py-4 bg-gray-50/50 backdrop-blur-sm border-2 rounded-2xl transition-all duration-300 outline-none font-medium
          ${error
            ? 'border-red-300 bg-red-50/50 text-red-900 placeholder-red-400'
            : 'border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:bg-white focus:shadow-lg'
          }`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm mt-2 ml-1 font-medium"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );

  const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
    >
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
        <Icon size={24} className="text-white" />
      </div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-white/80 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-6xl mx-auto"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Hero Content */}
          <motion.div
            className="space-y-8 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div>
              <motion.h1
                className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Welcome to the
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                  Future of Work
                </span>
              </motion.h1>
              <motion.p
                className="text-xl text-gray-300 leading-relaxed max-w-lg mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Join thousands of teams already transforming their workflow with our cutting-edge platform.
              </motion.p>
            </div>

            <div className="grid gap-4">
              <FeatureCard
                icon={Zap}
                title="Lightning Fast"
                description="Experience unprecedented speed and performance in every interaction."
                delay={0.6}
              />
              <FeatureCard
                icon={Shield}
                title="Enterprise Security"
                description="Bank-level security with end-to-end encryption for your data."
                delay={0.8}
              />
              <FeatureCard
                icon={Sparkles}
                title="AI-Powered"
                description="Smart automation that learns and adapts to your workflow."
                delay={1.0}
              />
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md mx-auto"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Tab Navigation */}
              <div className="p-8 pb-0">
                <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
                  {['login', 'onboard'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setStep(1);
                        setErrors({});
                      }}
                      className={`flex-1 py-3 px-4 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === tab
                        ? 'bg-white text-gray-900 shadow-lg'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                      {tab === 'login' ? 'Sign In' : 'Get Started'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Content */}
              <div className="px-8 pb-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'login' && (
                    <motion.div
                      // key="login"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                        <p className="text-gray-600">Sign in to your account to continue</p>
                      </div>

                      <div className="space-y-6">
                        <InputField
                          icon={Mail}
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(value) => handleInputChange('email', value)}
                          error={errors.email}
                        />

                        <InputField
                          icon={Lock}
                          type="password"
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(value) => handleInputChange('password', value)}
                          error={errors.password}
                          showToggle={true}
                        />

                        <motion.button
                          type="button"
                          onClick={handleSubmit}
                          disabled={isLoading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Signing In...
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              Sign In
                              <ArrowRight size={20} />
                            </div>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'onboard' && (
                    <motion.div
                      // key="onboard"
                      variants={stepVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          {step === 1 ? 'Create Account' : 'Company Details'}
                        </h2>
                        <p className="text-gray-600">
                          {step === 1 ? 'Set up your personal account' : 'Tell us about your company'}
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-6 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: step === 1 ? '50%' : '100%' }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <AnimatePresence mode="wait">
                          {step === 1 ? (
                            <motion.div
                              // key="step1"
                              variants={stepVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              className="space-y-6"
                            >
                              <InputField
                                icon={User}
                                placeholder="Full name"
                                value={formData.name}
                                onChange={(value) => handleInputChange('name', value)}
                                error={errors.name}
                              />

                              <InputField
                                icon={User}
                                placeholder="Username"
                                value={formData.username}
                                onChange={(value) => handleInputChange('username', value)}
                                error={errors.username}
                              />

                              <InputField
                                icon={Mail}
                                type="email"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={(value) => handleInputChange('email', value)}
                                error={errors.email}
                              />

                              <InputField
                                icon={Lock}
                                type="password"
                                placeholder="Create password"
                                value={formData.password}
                                onChange={(value) => handleInputChange('password', value)}
                                error={errors.password}
                                showToggle={true}
                              />

                              <motion.button
                                type="button"
                                onClick={handleSubmit}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/25"
                              >
                                <div className="flex items-center justify-center gap-2">
                                  Continue
                                  <ArrowRight size={20} />
                                </div>
                              </motion.button>
                            </motion.div>
                          ) : (
                            <motion.div
                              // key="step2"
                              variants={stepVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              className="space-y-6"
                            >
                              <InputField
                                icon={Building}
                                placeholder="Tenant name"
                                value={formData.tenantName}
                                onChange={(value) => handleInputChange('tenantName', value)}
                                error={errors.tenantName}
                              />

                              <InputField
                                icon={Briefcase}
                                placeholder="Company name"
                                value={formData.companyName}
                                onChange={(value) => handleInputChange('companyName', value)}
                                error={errors.companyName}
                              />

                              <div className="flex gap-4">
                                <motion.button
                                  type="button"
                                  onClick={() => setStep(1)}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl transition-all duration-300 hover:bg-gray-200"
                                >
                                  <div className="flex items-center justify-center gap-2">
                                    <ArrowLeft size={20} />
                                    Back
                                  </div>
                                </motion.button>

                                <motion.button
                                  type="button"
                                  onClick={handleSubmit}
                                  disabled={isLoading}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="flex-[2] bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      Creating Account...
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center gap-2">
                                      Complete Setup
                                      <Sparkles size={20} />
                                    </div>
                                  )}
                                </motion.button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ModernOnboarding;