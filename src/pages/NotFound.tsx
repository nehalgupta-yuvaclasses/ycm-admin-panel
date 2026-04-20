import { Link } from "react-router-dom";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="p-6 rounded-full bg-muted text-muted-foreground mb-6">
        <FileQuestion className="h-16 w-16" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-foreground">
        404 - Module Not Found
      </h1>
      <p className="text-muted-foreground text-lg max-w-md mb-8">
        The requested panel or module does not exist in the current ERP configuration.
      </p>
      <div className="flex gap-4">
        <Link 
          to="/admin/dashboard" 
          className={cn(buttonVariants({ size: "lg" }), "rounded-xl font-bold shadow-lg shadow-primary/20")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Return to Command Center
        </Link>
      </div>
    </div>
  );
}
