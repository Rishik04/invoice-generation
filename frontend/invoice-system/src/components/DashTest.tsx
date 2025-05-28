import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { fetchCompanies } from "@/redux/slices/companySlice";

import DashboardHeader from "./Dashboard/DashboardHeader";
import DashboardStats from "./Dashboard/DashboardStats";
import CompanyTable from "./Dashboard/CompanyTable";

const DashTest = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <DashboardHeader />
      <CompanyTable />
      <DashboardStats />
    </div>
  );
};

export default DashTest;