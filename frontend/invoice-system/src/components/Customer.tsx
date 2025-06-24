import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";

// --- Mock Redux & External Components ---
// This section simulates the necessary hooks and components to make this
// file runnable on its own. In your real app, you would import these
// from your actual project setup.

const mockCustomers = [
    { _id: 'cust_1', name: 'John Doe', address: '123 Main St, Anytown, USA', phone: '5551234567', state: 'California' },
    { _id: 'cust_2', name: 'Jane Smith', address: '456 Oak Ave, Sometown, USA', phone: '5559876543', state: 'New York' },
    { _id: 'cust_3', name: 'Peter Jones', address: '789 Pine Ln, Otherville, USA', phone: '5555551212', state: 'Texas' },
];

const useAppDispatch = () => (action) => {
    console.log("Dispatching Action:", action);
    return Promise.resolve({ payload: action.payload });
};

const useAppSelector = (selector) => {
    const mockState = {
        customer: {
            customers: mockCustomers,
            loading: false,
            error: null,
        },
    };
    return selector(mockState);
};

// --- Mock UI Components & Icons (Styled like shadcn/ui) ---
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }) => {
    const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    const variants = {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
    };
    const sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        icon: "h-10 w-10",
    }
    return <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
};
const Input = (props) => <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...props} />;
const Label = (props) => <label className="text-sm font-medium leading-none" {...props} />;
const Card = ({ children, className = '' }) => <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ children, className = '' }) => <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>;
const CardTitle = ({ children, className = '' }) => <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardDescription = ({ children, ...props }) => <p className="text-sm text-muted-foreground" {...props}>{children}</p>;
const CardContent = ({ children, className = '' }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;
const Table = ({ children }) => <table className="w-full caption-bottom text-sm">{children}</table>;
const TableHeader = ({ children }) => <thead className="[&_tr]:border-b">{children}</thead>;
const TableBody = ({ children }) => <tbody className="[&_tr:last-child]:border-0">{children}</tbody>;
const TableRow = ({ children }) => <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">{children}</tr>;
const TableHead = ({ children }) => <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">{children}</th>;
const TableCell = ({ children, className = '' }) => <td className={`p-4 align-middle ${className}`}>{children}</td>;
const Dialog = ({ children, open }) => open ? <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"><div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg">{children}</div></div> : null;
const DialogContent = ({ children }) => <div className="p-6">{children}</div>;
const DialogHeader = ({ children }) => <div className="flex flex-col space-y-2 text-center sm:text-left">{children}</div>;
const DialogTitle = ({ children }) => <h2 className="text-lg font-semibold">{children}</h2>;
const DialogDescription = ({ children }) => <p className="text-sm text-muted-foreground">{children}</p>;
const DialogFooter = ({ children, className = '' }) => <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 ${className}`}>{children}</div>;
const Skeleton = ({ className = '' }) => <div className={`animate-pulse rounded-md bg-muted ${className}`} />

const Users = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const PlusCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>;
const Edit = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const Trash2 = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

// --- Zod Schema for Customer Form ---
const customerSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    address: z.string().min(5, "Please provide a valid address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\d+$/, "Phone must contain only digits"),
    state: z.string().min(2, "State is required"),
});
type CustomerFormInputs = z.infer<typeof customerSchema>;

// --- Customer Form Component ---
const CustomerForm = ({ customer, onSave, onCancel }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<CustomerFormInputs>({
        resolver: zodResolver(customerSchema),
        defaultValues: customer || { name: "", address: "", phone: "", state: "" },
    });

    const onSubmit: SubmitHandler<CustomerFormInputs> = (data) => {
        onSave({ ...customer, ...data });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register("address")} />
                {errors.address && <p className="text-xs text-red-600">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" {...register("phone")} />
                    {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" {...register("state")} />
                    {errors.state && <p className="text-xs text-red-600">{errors.state.message}</p>}
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Customer</Button>
            </DialogFooter>
        </form>
    );
};


// --- Main Customer Page Component ---
const CustomerPage = () => {
    const dispatch = useAppDispatch();
    const { customers, loading, error } = useAppSelector((state) => state.customer);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    useEffect(() => {
        // In a real app, you'd dispatch an action to fetch customers.
        // dispatch(fetchCustomers());
    }, [dispatch]);

    const handleAddNew = () => {
        setEditingCustomer(null);
        setIsFormOpen(true);
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setIsFormOpen(true);
    };

    const handleDelete = (customerId) => {
        // In a real app, you would show a confirmation dialog first.
        console.log("Deleting customer:", customerId);
        // dispatch(deleteCustomer(customerId));
    };

    const handleSave = (customerData) => {
        if (customerData._id) {
            console.log("Updating customer:", customerData);
            // dispatch(updateCustomer(customerData));
        } else {
            console.log("Adding new customer:", customerData);
            // dispatch(addCustomer(customerData));
        }
        setIsFormOpen(false);
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <CardTitle className="flex items-center"><Users /> Customers</CardTitle>
                                <CardDescription>View, add, and manage your customers.</CardDescription>
                            </div>
                            <Button onClick={handleAddNew}><PlusCircle /> Add New Customer</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                            </div>
                        ) : error ? (
                            <div className="text-center py-8 text-red-600">{error}</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Address</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>State</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {customers.map((customer) => (
                                            <TableRow key={customer._id}>
                                                <TableCell className="font-medium">{customer.name}</TableCell>
                                                <TableCell>{customer.address}</TableCell>
                                                <TableCell>{customer.phone}</TableCell>
                                                <TableCell>{customer.state}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(customer)}>
                                                        <Edit />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(customer._id)}>
                                                        <Trash2 />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
                            <DialogDescription>
                                {editingCustomer ? 'Update the details for this customer.' : 'Fill in the details for the new customer.'}
                            </DialogDescription>
                        </DialogHeader>
                        <CustomerForm
                            customer={editingCustomer}
                            onSave={handleSave}
                            onCancel={() => setIsFormOpen(false)}
                        />
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    );
};

export default CustomerPage
