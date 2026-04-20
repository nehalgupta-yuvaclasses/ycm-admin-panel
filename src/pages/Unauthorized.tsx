import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function Unauthorized() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="p-6 rounded-full bg-destructive/10 text-destructive mb-6">
        <ShieldAlert className="h-16 w-16" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-foreground">
        Access Restricted
      </h1>
      <p className="text-muted-foreground text-lg max-w-md mb-8">
        Your current account permissions do not allow access to this ERP module. Please contact your system administrator.
      </p>
      <div className="flex gap-4">
        <Link 
          to="/admin/dashboard" 
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-xl")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
