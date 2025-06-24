import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  ShoppingCart,
  Package,
  Settings,
  HelpCircle,
  LogOut,
  BarChart3,
} from "lucide-react";

type SidebarProps = {
  isMobile?: boolean;
};

const Sidebar = ({ isMobile }: SidebarProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <aside
      className={cn(
        "w-64 border-r bg-card flex-shrink-0 flex flex-col",
        isMobile ? "w-full h-[100dvh]" : "hidden md:flex"
      )}
    >
      <div className="p-6 flex items-center">
        <BarChart3 className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-xl font-bold">CompanyDash</h1>
      </div>
      
      <div className="flex-1 px-3 py-2 space-y-1">
        <NavItem 
          href="/" 
          icon={<LayoutDashboard className="h-4 w-4 mr-3" />} 
          label="Dashboard" 
          active={isActive("/")} 
        />
        <NavItem 
          href="/invoices" 
          icon={<FileText className="h-4 w-4 mr-3" />} 
          label="Invoices" 
          active={isActive("/invoices")} 
        />
        <NavItem 
          href="/customers" 
          icon={<Users className="h-4 w-4 mr-3" />} 
          label="Customers" 
          active={isActive("/customers")} 
        />
        <NavItem 
          href="/products" 
          icon={<Package className="h-4 w-4 mr-3" />} 
          label="Products" 
          active={isActive("/products")} 
        />
        <NavItem 
          href="/orders" 
          icon={<ShoppingCart className="h-4 w-4 mr-3" />} 
          label="Orders" 
          active={isActive("/orders")} 
        />
        
        <div className="pt-4 mt-4 border-t">
          <NavItem 
            href="/settings" 
            icon={<Settings className="h-4 w-4 mr-3" />} 
            label="Settings" 
            active={isActive("/settings")} 
          />
          <NavItem 
            href="/help" 
            icon={<HelpCircle className="h-4 w-4 mr-3" />} 
            label="Help & Support" 
            active={isActive("/help")} 
          />
        </div>
      </div>
      
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full justify-start text-muted-foreground">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
};

const NavItem = ({ href, icon, label, active }: NavItemProps) => {
  return (
    <Button
      asChild
      variant={active ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start",
        active ? "bg-secondary text-secondary-foreground font-medium" : "text-muted-foreground"
      )}
    >
      <Link to={href}>
        {icon}
        {label}
      </Link>
    </Button>
  );
};

export default Sidebar;