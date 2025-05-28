import { useAppSelector } from "@/redux/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowUpRight, Clock, Info } from "lucide-react";

const DashboardHeader = () => {
  const { companies, loading } = useAppSelector((state) => state.company);
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col md:flex-row justify-between md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your companies and view important metrics
          </p>
        </div>
        
        <div className="mt-2 md:mt-0 flex items-center gap-2">
          <Badge variant="outline" className="text-muted-foreground font-normal">
            <Clock className="h-3 w-3 mr-1" />
            Last updated: {new Date().toLocaleDateString()}
          </Badge>
          
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <Info className="h-3 w-3 mr-1" />
            {loading ? "Loading..." : `${companies.length} Companies`}
          </Badge>
        </div>
      </div>
      
      <Card className="mt-4 bg-gradient-to-r from-muted/50 to-card border-none">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-semibold">Welcome to your company dashboard</h2>
            <p className="text-muted-foreground">
              Add, edit, and manage your companies from one central location
            </p>
          </div>
          
          <div className="hidden md:flex items-center text-sm font-medium text-primary">
            View analytics
            <ArrowUpRight className="h-3 w-3 ml-1" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHeader;