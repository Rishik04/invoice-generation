import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  Company, 
  setSelectedCompany,
  fetchCompanies, 
  deleteCompany,
  clearCompanyMessages 
} from "@/redux/slices/companySlice";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Loader2, Building2, ExternalLink, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import CompanyForm from "./CompanyForm";

const CompanyTable = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { companies, loading, error } = useAppSelector(
    (state) => state.company
  );

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDeleteId, setCompanyToDeleteId] = useState<string | null>(null);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);

  const openFormDialog = (company?: Company) => {
    if (company) {
      setCompanyToEdit(company);
      dispatch(setSelectedCompany(company));
    } else {
      setCompanyToEdit(null);
      dispatch(setSelectedCompany(null));
    }
    setIsFormDialogOpen(true);
  };

  const closeFormDialog = () => {
    setIsFormDialogOpen(false);
    setCompanyToEdit(null);
    dispatch(setSelectedCompany(null));
    dispatch(clearCompanyMessages());
  };

  const openDeleteDialog = (companyId: string) => {
    setCompanyToDeleteId(companyId);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setCompanyToDeleteId(null);
    setIsDeleteDialogOpen(false);
    dispatch(clearCompanyMessages());
  };

  const handleDeleteConfirm = async () => {
    if (companyToDeleteId) {
      const actionResult = await dispatch(deleteCompany(companyToDeleteId));
      if (actionResult.meta.requestStatus === "fulfilled") {
        dispatch(fetchCompanies());
      }
      closeDeleteDialog();
    }
  };

  const handleCompanySelect = (company: Company) => {
    dispatch(setSelectedCompany(company));
    navigate(`/${company._id}/invoice`);
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <CardTitle className="text-xl flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-primary" />
                Companies
              </CardTitle>
              <CardDescription>
                Manage your business entities and their details
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-3.5 w-3.5 mr-1" /> Filter
              </Button>
              <Button
                onClick={() => openFormDialog()}
                size="sm"
                className="h-8"
              >
                <PlusCircle className="h-3.5 w-3.5 mr-1" /> Add Company
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading && companies.length === 0 ? (
            <div className="p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4 mb-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="h-10 w-10 text-destructive" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Error Loading Companies</h3>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <Button onClick={() => dispatch(fetchCompanies())} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : companies.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Building2 className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No Companies Yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Add your first company to get started.
              </p>
              <Button onClick={() => openFormDialog()} className="mt-4">
                Add Company
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-b-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[200px]">Company Name</TableHead>
                    <TableHead>GSTIN</TableHead>
                    <TableHead>Hallmark No.</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Phone</TableHead>
                    <TableHead className="hidden lg:table-cell">State</TableHead>
                    <TableHead className="hidden xl:table-cell">Bank Account</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company._id} className="group">
                      <TableCell 
                        className="font-medium cursor-pointer group-hover:text-primary group-hover:underline transition-colors"
                        onClick={() => handleCompanySelect(company)}
                      >
                        <div className="flex items-center">
                          {company.name}
                          <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{company.gstin}</TableCell>
                      <TableCell>{company.hallMarkNumber}</TableCell>
                      <TableCell className="hidden md:table-cell">{company.email}</TableCell>
                      <TableCell className="hidden lg:table-cell">{company.phone.join(", ")}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {company.state} <span className="text-xs text-muted-foreground">({company.stateCode})</span>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <span className="font-mono text-xs">{company.bankDetails.accountNumber}</span>
                        <span className="block text-xs text-muted-foreground">
                          {company.bankDetails.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openFormDialog(company)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(company._id)}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Company Dialog - Using CompanyForm component */}
      <Dialog open={isFormDialogOpen} onOpenChange={closeFormDialog}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-2xl font-bold">
              {companyToEdit ? "Edit Company" : "Add New Company"}
            </DialogTitle>
            <DialogDescription>
              {companyToEdit
                ? "Make changes to company details here."
                : "Enter details for your new company."}
            </DialogDescription>
          </DialogHeader>
          <CompanyForm 
            company={companyToEdit} 
            onClose={closeFormDialog} 
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-destructive">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this company? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={closeDeleteDialog}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={loading}
              className="px-4 py-2"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CompanyTable;