import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function ServerError() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="p-6 rounded-full bg-orange-500/10 text-orange-500 mb-6">
        <ShieldAlert className="h-16 w-16" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-foreground">
        500 - Intelligence Failure
      </h1>
      <p className="text-muted-foreground text-lg max-w-md mb-8">
        The ERP core encountered an unexpected internal error. High-level diagnostics have been logged for review.
      </p>
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          size="lg" 
          className="rounded-xl font-bold"
          onClick={() => window.location.reload()}
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Restart Module
        </Button>
        <Link 
          to="/admin/dashboard" 
          className={cn(buttonVariants({ size: "lg" }), "rounded-xl font-bold shadow-lg shadow-primary/20")}
        >
          Return to Command Center
        </Link>
      </div>
    </div>
  );
}
