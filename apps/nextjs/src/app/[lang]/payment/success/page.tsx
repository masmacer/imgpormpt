import Link from "next/link";
import { Button } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
  const planName = searchParams.plan ? 
    searchParams.plan.replace('-monthly', '').replace('-', ' ') : 'Premium';

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icons.Check className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
          Thank you for upgrading to {planName} plan.
        </p>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Your account has been activated and you now have access to all premium features.
        </p>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📧 A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
}