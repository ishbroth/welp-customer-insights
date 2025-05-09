import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfileSidebar from "@/components/ProfileSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CreditCard, Eye, Plus, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const BillingPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useAuth();
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);
  const [isProcessingRenew, setIsProcessingRenew] = useState(false);
  
  // Mock subscription status - in a real app, this would come from your backend
  const [isSubscriptionCancelled, setIsSubscriptionCancelled] = useState(false);

  // Mock payment method
  const [paymentMethod, setPaymentMethod] = useState({
    type: "Credit Card",
    cardNumber: "**** **** **** 4242",
    expiryDate: "12/25",
    cardholderName: currentUser?.name || "John Doe"
  });

  // Mock transactions based on user type
  const mockTransactions = currentUser?.type === "business" 
    ? [
        { id: "t123", date: "2024-04-22", amount: "$19.95", description: "Business Pro Plan - Monthly" },
        { id: "t122", date: "2024-03-22", amount: "$19.95", description: "Business Pro Plan - Monthly" },
        { id: "t121", date: "2024-02-22", amount: "$19.95", description: "Business Pro Plan - Monthly" },
        { id: "t120", date: "2024-01-22", amount: "$19.95", description: "Business Pro Plan - Monthly" },
        { id: "t119", date: "2023-12-22", amount: "$19.95", description: "Business Pro Plan - Monthly" },
        { id: "t118", date: "2023-11-22", amount: "$19.95", description: "Business Pro Plan - Monthly" }
      ]
    : [
        { id: "t234", date: "2024-04-15", amount: "$9.99", description: "Premium Customer Plan - Monthly" },
        { id: "t233", date: "2024-03-15", amount: "$9.99", description: "Premium Customer Plan - Monthly" },
        { id: "t232", date: "2024-02-15", amount: "$9.99", description: "Premium Customer Plan - Monthly" },
        { id: "t231", date: "2024-01-15", amount: "$9.99", description: "Premium Customer Plan - Monthly" }
      ];

  const visibleTransactions = showAllTransactions 
    ? mockTransactions 
    : mockTransactions.slice(0, 3);

  // Credit card form schema
  const creditCardSchema = z.object({
    cardholderName: z.string().min(2, "Cardholder name is required"),
    cardNumber: z.string().regex(/^\d{16}$/, "Card number must be 16 digits"),
    expiryMonth: z.string().min(1, "Month is required"),
    expiryYear: z.string().min(1, "Year is required"),
    cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
  });

  // Credit card form
  const form = useForm<z.infer<typeof creditCardSchema>>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      cardholderName: currentUser?.name || "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof creditCardSchema>) => {
    // In a real app, this would send data to a payment processor
    console.log("Payment method update:", values);
    
    // Update the mock payment method
    setPaymentMethod({
      type: "Credit Card",
      cardNumber: `**** **** **** ${values.cardNumber.slice(-4)}`,
      expiryDate: `${values.expiryMonth}/${values.expiryYear.slice(-2)}`,
      cardholderName: values.cardholderName
    });
    
    // Show success message
    toast("Payment method updated", {
      description: "Your credit card information has been updated successfully.",
    });
  };

  // Handle subscription cancellation
  const handleCancelSubscription = () => {
    setIsProcessingCancel(true);
    
    // Simulate API call to cancel subscription
    setTimeout(() => {
      setIsProcessingCancel(false);
      setIsSubscriptionCancelled(true);
      
      // Show success message
      toast("Subscription cancelled", {
        description: "Your subscription has been cancelled successfully. You will still have access until the end of your current billing period.",
      });
    }, 1500);
  };

  // Handle subscription renewal
  const handleRenewSubscription = () => {
    setIsProcessingRenew(true);
    
    // Simulate API call to renew subscription
    setTimeout(() => {
      setIsProcessingRenew(false);
      setIsSubscriptionCancelled(false);
      
      // Show success message
      toast("Subscription renewed", {
        description: "Your subscription has been renewed successfully. Your billing cycle will resume at the end of your current period.",
      });
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow flex flex-col md:flex-row">
        <ProfileSidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-3xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <CreditCard className="h-6 w-6" /> Billing & Subscriptions
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your payment methods and view your transaction history
              </p>
            </div>

            <div className="space-y-6">
              {/* Current Subscription */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Subscription</CardTitle>
                  <CardDescription>Details about your current subscription plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-lg">
                      {currentUser?.type === "business" ? "Business Pro Plan" : "Premium Customer Plan"}
                    </p>
                    <p className="text-gray-600">
                      {currentUser?.type === "business" ? "$19.95/month" : "$9.99/month"}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Next billing date: May 15, 2024</p>
                    
                    <div className="mt-4 flex items-center justify-end">
                      {isSubscriptionCancelled ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="default" 
                              className="bg-green-600 hover:bg-green-700" 
                              size="sm"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Renew Subscription
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <RefreshCw className="h-5 w-5 text-green-600" />
                                Renew Subscription?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Would you like to renew your subscription? Your billing cycle will resume at the end of your current period.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleRenewSubscription}
                                disabled={isProcessingRenew}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {isProcessingRenew ? "Processing..." : "Yes, Renew Subscription"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Cancel Subscription
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                                Cancel Subscription?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleCancelSubscription}
                                disabled={isProcessingCancel}
                              >
                                {isProcessingCancel ? "Processing..." : "Yes, Cancel Subscription"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Your current payment method on file</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-100 p-2 rounded">
                        <CreditCard className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{paymentMethod.type}</p>
                        <p className="text-gray-600">{paymentMethod.cardNumber}</p>
                        <p className="text-sm text-gray-500">Expires {paymentMethod.expiryDate}</p>
                      </div>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          Edit Payment Method
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Update Payment Method</DialogTitle>
                          <DialogDescription>
                            Enter your credit card information
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="cardholderName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cardholder Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="cardNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Card Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="1234 5678 9012 3456" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="expiryMonth"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Month</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="MM" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => {
                                          const month = (i + 1).toString().padStart(2, '0');
                                          return (
                                            <SelectItem key={month} value={month}>{month}</SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="expiryYear"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Year</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="YYYY" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {Array.from({ length: 10 }, (_, i) => {
                                          const year = (new Date().getFullYear() + i).toString();
                                          return (
                                            <SelectItem key={year} value={year}>{year}</SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name="cvv"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>CVV</FormLabel>
                                    <FormControl>
                                      <Input placeholder="123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <DialogFooter>
                              <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Your recent payments and charges</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {visibleTransactions.length > 0 ? (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b text-left text-sm text-gray-500">
                                <th className="pb-2 font-medium">Date</th>
                                <th className="pb-2 font-medium">Description</th>
                                <th className="pb-2 font-medium text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {visibleTransactions.map(transaction => (
                                <tr key={transaction.id} className="border-b border-gray-100">
                                  <td className="py-3 text-sm">
                                    {new Date(transaction.date).toLocaleDateString()}
                                  </td>
                                  <td className="py-3 text-sm">{transaction.description}</td>
                                  <td className="py-3 text-sm text-right font-medium">{transaction.amount}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        {mockTransactions.length > 3 && (
                          <div className="text-center pt-2">
                            <Button 
                              variant="ghost" 
                              onClick={() => setShowAllTransactions(!showAllTransactions)}
                              className="text-sm"
                            >
                              {showAllTransactions ? "Show Less" : "View All Transactions"} 
                              <Eye className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <p>No transactions found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default BillingPage;
