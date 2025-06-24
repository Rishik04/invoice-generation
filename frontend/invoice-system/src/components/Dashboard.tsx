import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Redux Hooks and Slices
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  Company,
  fetchCompanies,
  addCompany,
  updateCompany,
  deleteCompany,
  setSelectedCompany,
  clearCompanyMessages,
} from "@/redux/slices/companySlice";
import { useNavigate } from "react-router";

// --- Zod Schema for Company Form Validation ---
const companyFormSchema = z.object({
  name: z.string().min(1, "Company Name is required"),
  address: z.string().min(1, "Address is required"),
  gstin: z
    .string()
    .min(1, "GSTIN is required")
    .length(15, "GSTIN must be 15 characters")
    .regex(
      /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GSTIN format"
    ),
  hallMarkNumber: z.string().min(1, "Hallmark Number is required"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  phone: z
    .string()
    .min(1, "Phone is required")
    .regex(/^\d+$/, "Phone must contain only digits"),
  state: z.string().min(1, "State is required"),
  stateCode: z.string().min(1, "State Code is required"),
  bankDetails: z.object({
    name: z.string().min(1, "Bank Name is required"),
    branch: z.string().min(1, "Branch is required"),
    accountNumber: z
      .string()
      .min(1, "Account Number is required")
      .regex(/^\d+$/, "Account Number must contain only digits"),
    ifsc: z
      .string()
      .min(1, "IFSC is required")
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC format"),
  }),
  termsConditions: z.array(z.string()).optional(),
});

type CompanyFormInputs = z.infer<typeof companyFormSchema>;

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { companies, loading, error, selectedCompany } = useAppSelector(
    (state) => state.company
  );

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDeleteId, setCompanyToDeleteId] = useState<string | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormInputs>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      address: "",
      gstin: "",
      hallMarkNumber: "",
      email: "",
      phone: "",
      state: "",
      stateCode: "",
      bankDetails: {
        name: "",
        branch: "",
        accountNumber: "",
        ifsc: "",
      },
      termsConditions: [""],
    },
  });

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  const openFormDialog = (company?: Company) => {
    dispatch(setSelectedCompany(company || null));
    if (company) {
      reset({
        ...company,
        phone: company.phone ? company.phone.join(", ") : "",
        termsConditions: company.termsConditions ?? [],
        bankDetails: { ...company.bankDetails }, // Ensure deep copy for nested objects
      });
    } else {
      reset({
        name: "",
        address: "",
        gstin: "",
        hallMarkNumber: "",
        email: "",
        phone: "",
        state: "",
        stateCode: "",
        bankDetails: {
          name: "",
          branch: "",
          accountNumber: "",
          ifsc: "",
        },
        termsConditions: [],
      });
    }
    setIsFormDialogOpen(true);
  };

  const closeFormDialog = () => {
    setIsFormDialogOpen(false);
    dispatch(setSelectedCompany(null));
    reset();
    dispatch(clearCompanyMessages());
  };

  const onSubmit: SubmitHandler<CompanyFormInputs> = async (data) => {
    dispatch(clearCompanyMessages());

    const companyDataToSend = {
      ...data,
      phone: data.phone
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== ""),
      termsConditions:
        typeof data.termsConditions === "string"
          ? data.termsConditions
              .split(/[\n,]/)
              .map((s) => s.trim())
              .filter((s) => s !== "")
          : data.termsConditions,
    };

    let actionResult;
    if (selectedCompany) {
      actionResult = await dispatch(
        updateCompany({ ...companyDataToSend, _id: selectedCompany._id })
      );
    } else {
      actionResult = await dispatch(addCompany(companyDataToSend));
    }

    if (actionResult.meta.requestStatus === "fulfilled") {
      dispatch(fetchCompanies());
      closeFormDialog();
    }
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

  const selectCompanyToggle = (company) => {
    console.log("Selected company:", company);
    dispatch(setSelectedCompany(company));
    navigate(`/${company._id}/invoice`);
  };

  return (
    <div className="flex flex-col items-center p-5 min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Company Dashboard</h1>
        <Button
          onClick={() => openFormDialog()}
          className="flex items-center gap-2 px-4 py-2"
        >
          <PlusCircle className="h-4 w-4" /> Add New Company
        </Button>
      </div>

      <div className="flex flex-col gap-5 w-full max-w-4xl">
        <Card className="shadow-md">
          <CardHeader className="pb-4 border-b border-gray-200">
            <CardTitle className="text-xl text-gray-700">
              Your Companies
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading && companies.length === 0 && (
              <p className="text-center p-6 text-gray-500 flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading
                companies...
              </p>
            )}
            {error && (
              <p className="text-red-500 text-sm p-4 text-center">{error}</p>
            )}
            {!loading && companies.length === 0 && !error && (
              <p className="text-center p-6 text-gray-500">
                No companies added yet. Click "Add New Company" to get started!
              </p>
            )}
            {companies.length > 0 && (
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company Name
                      </TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        GSTIN
                      </TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hallmark No.
                      </TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        State
                      </TableHead>
                      <TableHead className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bank Account
                      </TableHead>
                      <TableHead className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company._id} className="hover:bg-gray-50">
                        <TableCell
                          className="py-3 px-4 font-medium text-gray-900"
                          onClick={() => selectCompanyToggle(company)}
                          style={{
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          {company.name}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-gray-700">
                          {company.gstin}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-gray-700">
                          {company.hallMarkNumber}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-gray-700">
                          {company.address}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-gray-700">
                          {company.email}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-gray-700">
                          {company.phone.join(", ")}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-gray-700">
                          {company.state} ({company.stateCode})
                        </TableCell>
                        <TableCell className="py-3 px-4 text-gray-700">
                          {company.bankDetails.accountNumber} (
                          {company.bankDetails.name})
                        </TableCell>
                        <TableCell className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openFormDialog(company)}
                              title="Edit Company"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => openDeleteDialog(company._id)}
                              title="Delete Company"
                            >
                              <Trash2 className="h-4 w-4" />
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
      </div>

      {/* Add/Edit Company Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={closeFormDialog}>
        {/* Added flex-col and max-h-screen to DialogContent */}
        <DialogContent className="sm:max-w-xl md:max-w-2xl flex flex-col max-h-[90vh]">
          <DialogHeader className="p-6 pb-4">
            {" "}
            {/* Added padding to header */}
            <DialogTitle className="text-2xl font-bold">
              {selectedCompany ? "Edit Company" : "Add New Company"}
            </DialogTitle>
            <DialogDescription>
              {selectedCompany
                ? "Make changes to company details here."
                : "Enter details for your new company."}
            </DialogDescription>
          </DialogHeader>
          {/* New scrollable wrapper div for the form content */}
          <div className="flex-grow overflow-y-auto px-6">
            {" "}
            {/* flex-grow ensures it takes available space */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
            >
              {/* Company Details */}
              <div className="col-span-full">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Company Information
                </h3>
                <Separator className="mb-4" />
              </div>
              <div>
                <Label htmlFor="name" className="mb-1 block">
                  Company Name
                </Label>
                <Input id="name" {...register("name")} className="w-full" />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="gstin" className="mb-1 block">
                  GSTIN
                </Label>
                <Input id="gstin" {...register("gstin")} className="w-full" />
                {errors.gstin && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.gstin.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="hallMarkNumber" className="mb-1 block">
                  Hallmark Number
                </Label>
                <Input
                  id="hallMarkNumber"
                  {...register("hallMarkNumber")}
                  className="w-full"
                />
                {errors.hallMarkNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.hallMarkNumber.message}
                  </p>
                )}
              </div>
              <div className="col-span-full">
                <Label htmlFor="address" className="mb-1 block">
                  Address
                </Label>
                <Input
                  id="address"
                  {...register("address")}
                  className="w-full"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="state" className="mb-1 block">
                  State
                </Label>
                <Input id="state" {...register("state")} className="w-full" />
                {errors.state && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.state.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="stateCode" className="mb-1 block">
                  State Code
                </Label>
                <Input
                  id="stateCode"
                  {...register("stateCode")}
                  className="w-full"
                />
                {errors.stateCode && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.stateCode.message}
                  </p>
                )}
              </div>

              {/* Contact Details */}
              <div className="col-span-full mt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Contact Information
                </h3>
                <Separator className="mb-4" />
              </div>
              <div>
                <Label htmlFor="email" className="mb-1 block">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="w-full"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone" className="mb-1 block">
                  Phone (comma-separated if multiple)
                </Label>
                <Input
                  id="phone"
                  type="text"
                  {...register("phone")}
                  className="w-full"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Bank Details */}
              <div className="col-span-full mt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Bank Details
                </h3>
                <Separator className="mb-4" />
              </div>
              <div>
                <Label htmlFor="bankDetails.name" className="mb-1 block">
                  Bank Name
                </Label>
                <Input
                  id="bankDetails.name"
                  {...register("bankDetails.name")}
                  className="w-full"
                />
                {errors.bankDetails?.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.bankDetails.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="bankDetails.branch" className="mb-1 block">
                  Branch
                </Label>
                <Input
                  id="bankDetails.branch"
                  {...register("bankDetails.branch")}
                  className="w-full"
                />
                {errors.bankDetails?.branch && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.bankDetails.branch.message}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="bankDetails.accountNumber"
                  className="mb-1 block"
                >
                  Account Number
                </Label>
                <Input
                  id="bankDetails.accountNumber"
                  {...register("bankDetails.accountNumber")}
                  className="w-full"
                />
                {errors.bankDetails?.accountNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.bankDetails.accountNumber.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="bankDetails.ifsc" className="mb-1 block">
                  IFSC Code
                </Label>
                <Input
                  id="bankDetails.ifsc"
                  {...register("bankDetails.ifsc")}
                  className="w-full"
                />
                {errors.bankDetails?.ifsc && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.bankDetails.ifsc.message}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="col-span-full mt-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Terms & Conditions
                </h3>
                <Separator className="mb-4" />
              </div>
              <div className="col-span-full">
                <Label htmlFor="termsConditions" className="mb-1 block">
                  Terms & Conditions (comma or new-line separated)
                </Label>
                <Input
                  as="textarea"
                  id="termsConditions"
                  className="w-full min-h-[80px]"
                  {...register("termsConditions", {
                    setValueAs: (value) => {
                      if (typeof value !== "string") return [];
                      return value
                        .split(/[\n,]/)
                        .map((s) => s.trim())
                        .filter((s) => s !== "");
                    },
                  })}
                />
                {errors.termsConditions && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.termsConditions.message}
                  </p>
                )}
              </div>

              {error && (
                <p className="text-red-500 text-sm col-span-full text-center mt-4">
                  {error}
                </p>
              )}
            </form>
          </div>{" "}
          {/* End of scrollable wrapper div */}
          <DialogFooter className="p-6 pt-4 border-t flex justify-end gap-2">
            {" "}
            {/* Added padding and border-t */}
            <Button
              type="button"
              variant="outline"
              onClick={closeFormDialog}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || isSubmitting}
              onClick={handleSubmit(onSubmit)}
              className="px-4 py-2"
            >
              {loading || isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {selectedCompany ? "Save Changes" : "Add Company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog (unchanged, as it's typically shorter) */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
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
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
