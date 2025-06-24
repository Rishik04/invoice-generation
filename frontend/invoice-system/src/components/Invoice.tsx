import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

// --- Mock Data & API ---
// This simulates fetching invoice files from your local disk.
// In a real application, this would be a call to a backend API endpoint.
const mockInvoiceFiles = [
    "invoice_INV-2023-1001.pdf",
    "invoice_INV-2023-1002.pdf",
    "invoice_INV-1748448387241-O00Z1.pdf",
    "invoice_INV-1748446172053-KADHY.pdf",
    "invoice_INV-1748438823481-2MBBE.pdf",
    "invoice_INV-1748432437626-TRNIV.pdf",
];

const fetchInvoicesFromDisk = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const formattedInvoices = mockInvoiceFiles.map(file => {
        const parts = file.replace('.pdf', '').split('_');
        const idPart = parts[1] || 'N/A';
        const date = idPart.startsWith('INV-') ? new Date().toLocaleDateString() : new Date(parseInt(idPart.split('-')[1])).toLocaleDateString();
        return {
          id: file,
          fileName: file,
          invoiceNumber: idPart,
          customerName: "Mock Customer", // This would come from invoice metadata in a real app
          date: date,
          amount: (Math.random() * 5000 + 1000).toFixed(2), // Random amount for display
        };
      });
      resolve(formattedInvoices);
    }, 1000); // Simulate network delay
  });
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
const TableCell = ({ children, className='' }) => <td className={`p-4 align-middle ${className}`}>{children}</td>;
const Skeleton = ({className=''}) => <div className={`animate-pulse rounded-md bg-muted ${className}`}/>
const Badge = ({ children, className = '', variant = 'default' }) => {
    const variants = {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
    }
    return <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>{children}</div>;
}


// Mock Icons
const FileText = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 mr-2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>;
const PlusCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 mr-2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
const Download = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const Eye = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const Trash2 = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;


// --- Invoice Page Component ---
const InvoicePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const data = await fetchInvoicesFromDisk();
        setInvoices(data);
      } catch (err) {
        setError("Failed to load invoices.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadInvoices();
  }, []);

  const handleAction = (action, fileName) => {
      // In a real app, these would trigger file operations.
      alert(`${action} action for: ${fileName}`);
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <CardTitle className="flex items-center"><FileText /> All Invoices</CardTitle>
                    <CardDescription>Browse, view, and manage all generated invoices.</CardDescription>
                </div>
                <Link to="/generate-invoice">
                    <Button><PlusCircle /> Generate New Invoice</Button>
                </Link>
            </div>
             <div className="mt-4">
                <Input placeholder="Search by invoice #, customer name, or date..." className="max-w-sm" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
            ) : error ? (
                <div className="text-center py-8 text-red-600 bg-red-50 rounded-lg">{error}</div>
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>₹{invoice.amount}</TableCell>
                        <TableCell><Badge variant="secondary">Paid</Badge></TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => handleAction('View', invoice.fileName)} title="View">
                            <Eye />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleAction('Download', invoice.fileName)} title="Download">
                            <Download />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleAction('Delete', invoice.fileName)} title="Delete">
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
      </div>
    </div>
  );
};

export default InvoicePage;