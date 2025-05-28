import { useAppSelector } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Users, CreditCard, Building, Map } from "lucide-react";

const DashboardStats = () => {
  const { companies } = useAppSelector((state) => state.company);
  
  // Generate state distribution data
  const stateData = companies.reduce((acc: Record<string, number>, company) => {
    const state = company.state;
    if (!acc[state]) acc[state] = 0;
    acc[state]++;
    return acc;
  }, {});
  
  const stateChartData = Object.entries(stateData).map(([name, value]) => ({
    name,
    value,
  }));

  // Generate bank distribution data
  const bankData = companies.reduce((acc: Record<string, number>, company) => {
    const bank = company.bankDetails.name;
    if (!acc[bank]) acc[bank] = 0;
    acc[bank]++;
    return acc;
  }, {});
  
  const bankChartData = Object.entries(bankData).map(([name, value]) => ({
    name,
    value,
  }));
  
  // Random colors for pie chart
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];
  
  const stats = [
    {
      title: "Total Companies",
      value: companies.length,
      icon: <Building className="h-4 w-4" />,
      change: "+12.5%",
      trend: "up",
    },
    {
      title: "Active States",
      value: Object.keys(stateData).length,
      icon: <Map className="h-4 w-4" />,
      change: "+3.2%",
      trend: "up",
    },
    {
      title: "Bank Accounts",
      value: companies.length,
      icon: <CreditCard className="h-4 w-4" />,
      change: "+5.7%",
      trend: "up",
    },
    {
      title: "Unique Customers",
      value: 245,
      icon: <Users className="h-4 w-4" />,
      change: "-1.5%",
      trend: "down",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              {stat.icon}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className={`text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'} flex items-center mt-1`}>
              {stat.change}
              <span className="ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>
      ))}

      {/* Charts */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Company Distribution by State</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stateChartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <Tooltip
                  contentStyle={{ 
                    background: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))" 
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Bank Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bankChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {bankChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    background: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))" 
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;