import { motion } from 'framer-motion';
import {
  MapPin,
  TrendingUp
} from 'lucide-react';
import { useMemo } from 'react';
import { Area, AreaChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

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


const ModernDashboardStats = () => {
  const useAppSelector = (selector) => ({
    companies: mockCompanies,
    loading: false,
    error: null // Change to "Failed to fetch data." to test the error state
  });
  const { companies } = useAppSelector((state) => state.company);

  const stateChartData = useMemo(() => {
    const stateData = companies.reduce((acc, company) => {
      acc[company.state] = (acc[company.state] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(stateData).map(([name, value]) => ({
      name,
      value,
    }));
  }, [companies]);

  const monthlyData = [
    { name: "Jan", companies: 2, revenue: 24 },
    { name: "Feb", companies: 3, revenue: 32 },
    { name: "Mar", companies: 4, revenue: 45 },
    { name: "Apr", companies: 5, revenue: 38 },
    { name: "May", companies: 6, revenue: 52 },
    { name: "Jun", companies: 8, revenue: 67 },
  ];

  const COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
  ];

  const ChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((pld, index) => (
            <div
              key={index}
              className="text-sm font-medium"
              style={{ color: pld.color }}
            >
              {`${pld.name}: ${pld.value}`}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="grid gap-6 md:grid-cols-2"
    >
      {/* Growth Metrics */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-gray-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Growth Metrics</h3>
            <p className="text-gray-600 text-sm">
              Company count and revenue growth
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-2xl shadow-md">
            <TrendingUp size={20} className="text-white" />
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="cR" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#6366f1"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="#6366f1"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="cC" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#8b5cf6"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="#8b5cf6"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#cR)"
              />
              <Area
                type="monotone"
                dataKey="companies"
                stroke="#8b5cf6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#cC)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* State Distribution */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 border border-gray-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              State Distribution
            </h3>
            <p className="text-gray-600 text-sm">
              Active companies by state
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl shadow-md">
            <MapPin size={20} className="text-white" />
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stateChartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {stateChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-gray-700 font-medium">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default ModernDashboardStats