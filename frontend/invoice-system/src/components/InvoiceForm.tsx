import React, { useEffect, useMemo } from "react";
import {
  useForm,
  SubmitHandler,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Icons
import { PlusCircle, Trash2, Home, Loader2 } from "lucide-react";

// Redux Hooks and Slices
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { Company, generateInvoice } from "@/redux/slices/companySlice";
import { DatePicker } from "./custom-ui/DatePicker";

// --- Zod Schemas for Invoice Form ---
const invoiceItemSchema = z.object({
  type: z.enum(["S", "G"], { required_error: "Type is required" }),
  description: z.string().min(1, "Description is required"),
  hsnCode: z.string().min(1, "HSN Code is required"),
  purity: z.string().min(1, "Purity is required"),
  grossWeight: z.coerce.number().min(0.01, "Gross Weight must be positive"),
  netWeight: z.coerce.number().min(0.01, "Net Weight must be positive"),
  rate: z.coerce.number().min(0.01, "Rate must be positive"),
  makingCharges: z.coerce
    .number()
    .min(0, "Making Charges must be non-negative"),
  otherCharges: z.coerce.number().min(0, "Other Charges must be non-negative"),
});

const invoiceCustomerSchema = z.object({
  name: z.string().min(1, "Customer Name is required"),
  address: z.string().min(1, "Customer Address is required"),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .regex(/^\d+$/, "Phone must contain only digits"),
  state: z.string().min(1, "Customer State is required"),
});

const generateInvoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice Number is required"),
  date: z.string().min(1, "Date is required"),
  items: z
    .array(invoiceItemSchema)
    .min(1, "At least one item is required for the invoice"),
  customer: invoiceCustomerSchema,
});

const generateUniqueInvoiceNumber = (): string => {
  const prefix = "INV";
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase(); // 5 random alphanumeric chars
  return `${prefix}-${timestamp}-${randomSuffix}`;
};

type GenerateInvoiceFormInputs = z.infer<typeof generateInvoiceFormSchema>;

// Helper function to convert number to words (simple example, you might use a library like 'number-to-words')
function convertNumberToWords(num: number) {
  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";

  function convertChunk(n: number): string {
    let result = "";
    if (n >= 100) {
      result += units[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 10 && n <= 19) {
      result += teens[n - 10] + " ";
    } else if (n >= 20) {
      result += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n >= 1 && n <= 9) {
      result += units[n] + " ";
    }
    return result;
  }

  const crores = Math.floor(num / 10000000);
  num %= 10000000;
  const lakhs = Math.floor(num / 100000);
  num %= 100000;
  const thousands = Math.floor(num / 1000);
  num %= 1000;
  const hundreds = Math.floor(num);
  const paise = Math.round((num - hundreds) * 100);

  let words = "";
  if (crores > 0) words += convertChunk(crores) + "Crore ";
  if (lakhs > 0) words += convertChunk(lakhs) + "Lakh ";
  if (thousands > 0) words += convertChunk(thousands) + "Thousand ";
  if (hundreds > 0) words += convertChunk(hundreds);

  if (words.trim() === "") words = "Zero";

  words = words.trim();
  if (paise > 0) {
    words += ` and ${convertChunk(paise)} Paise`;
  }

  return words.trim() + " Only";
}

const InvoiceForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const selectedCompany = useAppSelector(
    (state) => state.company.selectedCompany
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GenerateInvoiceFormInputs>({
    resolver: zodResolver(generateInvoiceFormSchema),
    defaultValues: {
      invoiceNumber: generateUniqueInvoiceNumber(),
      date: new Date().toISOString().split("T")[0],
      items: [
        {
          type: "S",
          description: "",
          hsnCode: "7113",
          purity: "",
          grossWeight: 0,
          netWeight: 0,
          rate: 0,
          makingCharges: 0,
          otherCharges: 0,
        },
      ],
      customer: {
        name: "",
        address: "",
        phone: "",
        state: "",
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Redirect if no company is selected
  useEffect(() => {
    if (!selectedCompany) {
      navigate("/dashboard");
    }
  }, [selectedCompany, navigate]);

  // Watch all items for real-time calculation
  const watchedItems = useWatch({
    control,
    name: "items",
  });

  //   console.log("Watched Items:", watchedItems);

  // Calculate totals whenever items change
  const { subtotal, sgst, cgst, total, amountInWords } = useMemo(() => {
    if (!watchedItems || !Array.isArray(watchedItems)) {
      return { subtotal: 0, sgst: 0, cgst: 0, total: 0, amountInWords: "" };
    }

    // Assuming 3% GST for gold/jewelry
    const GST_RATE = 0.03;

    // Step 1: Calculate subtotal from watched items
    const currentSubtotal = watchedItems.reduce((acc, item) => {
      const itemRate = (Number(item.netWeight) || 0) * (Number(item.rate) || 0);
      const itemValue =
        itemRate +
        (itemRate * (Number(item.makingCharges) / 100) || 0) +
        (Number(item.otherCharges) || 0);
      return acc + itemValue;
    }, 0);

    // Step 2: Calculate SGST and CGST
    const currentSgst = parseFloat(
      (currentSubtotal * (GST_RATE / 2)).toFixed(2)
    );
    const currentCgst = parseFloat(
      (currentSubtotal * (GST_RATE / 2)).toFixed(2)
    );

    // Step 3: Total amount
    const currentTotal = parseFloat(
      (currentSubtotal + currentSgst + currentCgst).toFixed(2)
    );

    // Step 4: Convert total to words
    const currentAmountInWords = convertNumberToWords(currentTotal);

    return {
      subtotal: parseFloat(currentSubtotal.toFixed(2)),
      sgst: currentSgst,
      cgst: currentCgst,
      total: currentTotal,
      amountInWords: currentAmountInWords,
    };
  }, [watchedItems]);

  // Update calculated fields in the form state (though not directly submitted via register)
  // This is more for internal state management or if you were to display them as disabled inputs
  useEffect(() => {
    console.log("Updating calculated values in form state");
    console.log("wacth:", watchedItems);
    setValue("subtotal", subtotal as any, { shouldValidate: false }); // Using 'any' for simplicity here as it's not part of Zod schema
    setValue("sgst", sgst as any, { shouldValidate: false });
    setValue("cgst", cgst as any, { shouldValidate: false });
    setValue("total", total as any, { shouldValidate: false });
    setValue("amountInWords", amountInWords as any, { shouldValidate: false });
  }, [subtotal, sgst, cgst, total, amountInWords]);

  const onSubmit: SubmitHandler<GenerateInvoiceFormInputs> = async (data) => {
    if (!selectedCompany) {
      console.error("No company selected to generate invoice!");
      return;
    }

    const fullInvoiceData = {
      invoice: {
        ...data,
        subtotal,
        sgst,
        cgst,
        total,
        amountInWords,
      },
      company: {
        name: selectedCompany.name,
        address: selectedCompany.address,
        gstin: selectedCompany.gstin,
        email: selectedCompany.email,
        phone: selectedCompany.phone.join(", "), // Ensure phone is string for invoice
        state: selectedCompany.state,
        bankDetails: selectedCompany.bankDetails,
        termsConditions: selectedCompany.termsConditions,
      } as Company, // Type assertion to match original structure
    };

    // Log data for now. In a real app, you'd dispatch an action to send this to your API.
    // console.log(
    //   "Invoice Data to Send:",
    //   JSON.stringify(fullInvoiceData, null, 2)
    // );
    // alert(
    //   "Invoice data logged to console. (In a real app, this would be sent to your API)"
    // );

    // Optionally navigate back or to an invoice preview page
    // navigate('/dashboard');
    try {
      const getInvoice = await dispatch(
        generateInvoice(fullInvoiceData)
      ).unwrap();
      const result = getInvoice.data;

      // Ensure it's a Blob and has the correct type
      if (result instanceof Blob && result.type === "application/pdf") {
        const pdfUrl = URL.createObjectURL(result);
        window.open(pdfUrl, "_blank");

        // Optional: revoke the URL after some time to free memory
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000); // after 1 minute
      } else {
        console.warn("Expected a PDF Blob, but got:", result);
        alert(
          "PDF generation did not return a valid Blob. Please try again or check the console for details."
        );
      }
    } catch (error: any) {
      console.error("Error during PDF generation:", error);
      alert(
        `An error occurred while generating the PDF: ${
          error.message || "Unknown error. Check console."
        }`
      );
    }
  };

  if (!selectedCompany) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-5 text-center">
        <h2 className="text-2xl font-bold mb-4">No Company Selected</h2>
        <p className="text-gray-600 mb-6">
          Please select a company from the dashboard to generate an invoice.
        </p>
        <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="w-full mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Generate Invoice</h1>
        <Button
          onClick={() => navigate("/dashboard")}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" /> Back to Dashboard
        </Button>
      </div>

      <Card className="w-full shadow-md mb-6">
        <CardHeader className="pb-4 border-b border-gray-200">
          <CardTitle className="text-xl text-gray-700">
            Company Details for Invoice
          </CardTitle>
          <p className="text-sm text-gray-500">
            Invoice will be generated for:{" "}
            <span className="font-semibold">{selectedCompany.name}</span>
          </p>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div>
            <p>
              <strong className="text-gray-800">Name:</strong>{" "}
              {selectedCompany.name}
            </p>
            <p>
              <strong className="text-gray-800">GSTIN:</strong>{" "}
              {selectedCompany.gstin}
            </p>
            <p>
              <strong className="text-gray-800">Hallmark No.:</strong>{" "}
              {selectedCompany.hallMarkNumber}
            </p>
          </div>
          <div>
            <p>
              <strong className="text-gray-800">Address:</strong>{" "}
              {selectedCompany.address}
            </p>
            <p>
              <strong className="text-gray-800">State:</strong>{" "}
              {selectedCompany.state}
            </p>
            <p>
              <strong className="text-gray-800">Email:</strong>{" "}
              {selectedCompany.email}
            </p>
            <p>
              <strong className="text-gray-800">Phone:</strong>{" "}
              {selectedCompany.phone.join(", ")}
            </p>
          </div>
          <div>
            <p>
              <strong className="text-gray-800">Bank:</strong>{" "}
              {selectedCompany.bankDetails.name}
            </p>
            <p>
              <strong className="text-gray-800">Branch:</strong>{" "}
              {selectedCompany.bankDetails.branch}
            </p>
            <p>
              <strong className="text-gray-800">A/C No:</strong>{" "}
              {selectedCompany.bankDetails.accountNumber}
            </p>
            <p>
              <strong className="text-gray-800">IFSC:</strong>{" "}
              {selectedCompany.bankDetails.ifsc}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full shadow-md">
        <CardHeader className="pb-4 border-b border-gray-200">
          <CardTitle className="text-xl text-gray-700">
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Invoice & Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Invoice Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="invoiceNumber" className="mb-1 block">
                      Invoice Number
                    </Label>
                    <Input id="invoiceNumber" {...register("invoiceNumber")} />
                    {errors.invoiceNumber && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.invoiceNumber.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="date" className="mb-1 block">
                      Date
                    </Label>
                    <DatePicker />
                    {errors.date && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.date.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Customer Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customer.name" className="mb-1 block">
                      Customer Name
                    </Label>
                    <Input id="customer.name" {...register("customer.name")} />
                    {errors.customer?.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.customer.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="customer.address" className="mb-1 block">
                      Customer Address
                    </Label>
                    <Input
                      id="customer.address"
                      {...register("customer.address")}
                    />
                    {errors.customer?.address && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.customer.address.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer.phone" className="mb-1 block">
                        Customer Phone
                      </Label>
                      <Input
                        id="customer.phone"
                        type="tel"
                        {...register("customer.phone")}
                      />
                      {errors.customer?.phone && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.customer.phone.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="customer.state" className="mb-1 block">
                        Customer State
                      </Label>
                      <Input
                        id="customer.state"
                        {...register("customer.state")}
                      />
                      {errors.customer?.state && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.customer.state.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Invoice Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Invoice Items
              </h3>
              {fields.map((field, index) => (
                <Card
                  key={field.id}
                  className="mb-4 p-4 border border-gray-200 bg-gray-50"
                >
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                      <div>
                        <Label
                          htmlFor={`items.${index}.type`}
                          className="mb-1 block"
                        >
                          Item Type
                        </Label>
                        <Select
                          onValueChange={(value) =>
                            setValue(`items.${index}.type`, value as "S" | "G")
                          }
                          value={watch(`items.${index}.type`)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="S">Silver</SelectItem>
                            <SelectItem value="G">Gold</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.items?.[index]?.type && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.items[index]?.type?.message}
                          </p>
                        )}
                      </div>
                      <div className="lg:col-span-2">
                        <Label
                          htmlFor={`items.${index}.description`}
                          className="mb-1 block"
                        >
                          Description
                        </Label>
                        <Input
                          id={`items.${index}.description`}
                          {...register(`items.${index}.description`)}
                        />
                        {errors.items?.[index]?.description && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.items[index]?.description?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor={`items.${index}.hsnCode`}
                          className="mb-1 block"
                        >
                          HSN Code
                        </Label>
                        <Input
                          id={`items.${index}.hsnCode`}
                          {...register(`items.${index}.hsnCode`)}
                        />
                        {errors.items?.[index]?.hsnCode && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.items[index]?.hsnCode?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor={`items.${index}.purity`}
                          className="mb-1 block"
                        >
                          Purity
                        </Label>

                        <Select
                          onValueChange={(value) =>
                            setValue(
                              `items.${index}.purity`,
                              value as "18k" | "22k"
                            )
                          }
                          value={watch(`items.${index}.purity`)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="18k">18k/750</SelectItem>
                            <SelectItem value="22k">22k/916</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* <Input id={`items.${index}.purity`} {...register(`items.${index}.purity`)} /> */}
                        {errors.items?.[index]?.purity && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.items[index]?.purity?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor={`items.${index}.grossWeight`}
                          className="mb-1 block"
                        >
                          Gross Weight (grams)
                        </Label>
                        <Input
                          id={`items.${index}.grossWeight`}
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.grossWeight`)}
                        />
                        {errors.items?.[index]?.grossWeight && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.items[index]?.grossWeight?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor={`items.${index}.netWeight`}
                          className="mb-1 block"
                        >
                          Net Weight (grams)
                        </Label>
                        <Input
                          id={`items.${index}.netWeight`}
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.netWeight`)}
                        />
                        {errors.items?.[index]?.netWeight && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.items[index]?.netWeight?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor={`items.${index}.rate`}
                          className="mb-1 block"
                        >
                          Rate (per gram)
                        </Label>
                        <Input
                          id={`items.${index}.rate`}
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.rate`)}
                        />
                        {errors.items?.[index]?.rate && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.items[index]?.rate?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor={`items.${index}.makingCharges`}
                          className="mb-1 block"
                        >
                          Making Charges (%)
                        </Label>
                        <Input
                          id={`items.${index}.makingCharges`}
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.makingCharges`)}
                        />
                        {errors.items?.[index]?.makingCharges && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.items[index]?.makingCharges?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor={`items.${index}.otherCharges`}
                          className="mb-1 block"
                        >
                          Other Charges
                        </Label>
                        <Input
                          id={`items.${index}.otherCharges`}
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.otherCharges`)}
                        />
                        {errors.items?.[index]?.otherCharges && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.items[index]?.otherCharges?.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Remove Item
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                onClick={() =>
                  append({
                    type: "S",
                    description: "",
                    hsnCode: "",
                    purity: "",
                    grossWeight: 0,
                    netWeight: 0,
                    rate: 0,
                    makingCharges: 0,
                    otherCharges: 0,
                  })
                }
                className="mt-4 flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" /> Add Another Item
              </Button>
              {errors.items && (
                <p className="text-red-500 text-xs mt-2">
                  {errors.items.message}
                </p>
              )}
            </div>

            <Separator className="my-6" />

            {/* Totals and Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Invoice Summary
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between font-medium">
                    <span>Subtotal:</span>
                    <span>₹ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST (1.5%):</span>
                    <span>₹ {sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST (1.5%):</span>
                    <span>₹ {cgst.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-lg text-gray-800">
                    <span>Total Amount:</span>
                    <span>₹ {total.toFixed(2)}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 italic">
                    Amount in words:{" "}
                    <span className="font-semibold">{amountInWords}</span>
                  </p>
                </div>
              </div>
              <div className="md:col-span-1">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Terms & Conditions
                </h3>
                <Textarea
                  value={
                    selectedCompany.termsConditions?.join("\n") ||
                    "No specific terms and conditions provided."
                  }
                  readOnly
                  className="min-h-[120px] bg-gray-100 text-gray-700"
                />
                <p className="text-xs text-gray-500 mt-2">
                  These are the terms and conditions from the selected company.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="px-6 py-3"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Generate Invoice
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceForm;
