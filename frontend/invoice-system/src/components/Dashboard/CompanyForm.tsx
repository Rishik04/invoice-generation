import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  Company,
  addCompany,
  updateCompany,
  fetchCompanies,
} from "@/redux/slices/companySlice";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";

// Zod Schema for validation
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
  phone: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        return val
          .split(/[\n,]/)
          .map((s) => s.trim())
          .filter((s) => s !== "");
      }
      return val; // Return as-is if already an array
    },
    z.array(
      z
        .string()
        .min(1, "Phone number is required")
        .regex(/^\d+$/, "Phone must contain only digits")
    ).min(1, "At least one phone number is required")
  ),
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
  termsConditions: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        return val
          .split(/[\n,]/)
          .map((s) => s.trim())
          .filter((s) => s !== "");
      }
      return val; // Return as-is if already an array
    },
    z.array(z.string()).optional()
  ),
});

type CompanyFormInputs = z.infer<typeof companyFormSchema>;

interface CompanyFormProps {
  company: Company | null;
  onClose: () => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ company, onClose }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.company);

  const form = useForm<CompanyFormInputs>({
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

  // Set form values when editing a company
  useEffect(() => {
    if (company) {
      form.reset({
        ...company,
        phone: Array.isArray(company.phone) ? company.phone.join(", ") : company.phone,
        termsConditions: company.termsConditions || [""],
      });
    } else {
      form.reset({
        name: "",
        address: "",
        gstin: "",
        hallMarkNumber: "",
        email: "",
        phone: [""],
        state: "",
        stateCode: "",
        bankDetails: {
          name: "",
          branch: "",
          accountNumber: "",
          ifsc: "",
        },
        termsConditions: [""],
      });
    }
  }, [company, form]);

  const onSubmit = async (data: CompanyFormInputs) => {
    const companyDataToSend = {
      ...data,
      phone:
        typeof data.phone === "string"
          ? data.phone
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s !== "")
          : data.phone,
      termsConditions:
        typeof data.termsConditions === "string"
          ? data.termsConditions
            .split(/[\n,]/)
            .map((s) => s.trim())
            .filter((s) => s !== "")
          : data.termsConditions,
    };

    let actionResult;
    if (company) {
      actionResult = await dispatch(
        updateCompany({ ...companyDataToSend, _id: company._id })
      );
    } else {
      actionResult = await dispatch(addCompany(companyDataToSend));
    }

    if (actionResult.meta.requestStatus === "fulfilled") {
      dispatch(fetchCompanies());
      onClose();
    }
  };

  return (
    <>
      <div className="flex-grow overflow-y-auto px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Company Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                Company Information
              </h3>
              <Separator className="mb-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gstin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GSTIN</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 22AABCS1429B1ZX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hallMarkNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hallmark Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter hallmark number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Maharashtra" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stateCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., MH" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                Contact Information
              </h3>
              <Separator className="mb-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="contact@company.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Numbers</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Comma separated numbers"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Bank Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                Bank Details
              </h3>
              <Separator className="mb-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <FormField
                  control={form.control}
                  name="bankDetails.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., HDFC Bank" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankDetails.branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Andheri East" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankDetails.accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 1234567890"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankDetails.ifsc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IFSC Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., HDFC0001234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Terms & Conditions Section */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                Terms & Conditions
              </h3>
              <Separator className="mb-4" />

              <FormField
                control={form.control}
                name="termsConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms & Conditions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter terms separated by commas or new lines"
                        className="min-h-[100px] resize-y"
                        {...field}
                        value={
                          Array.isArray(field.value)
                            ? field.value.join("\n")
                            : field.value
                        }
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {error && (
              <div className="text-destructive text-sm text-center bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
          </form>
        </Form>
      </div>

      <DialogFooter className="p-6 pt-4 border-t flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          onClick={form.handleSubmit(onSubmit)}
          className="gap-1"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {company ? "Save Changes" : "Add Company"}
        </Button>
      </DialogFooter>
    </>
  );
};

export default CompanyForm;