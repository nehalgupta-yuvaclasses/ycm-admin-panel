import { Hammer, Clock, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Maintenance() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="p-6 rounded-full bg-blue-500/10 text-blue-500 mb-6 relative">
        <Hammer className="h-16 w-16" />
        <Clock className="h-6 w-6 absolute bottom-4 right-4 animate-bounce text-blue-600" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4 text-foreground">
        Scheduled Maintenance
      </h1>
      <p className="text-muted-foreground text-lg max-w-md mb-8">
        The Yuva ERP is currently undergoing a scheduled architectural upgrade. We'll be back online in approximately 15 minutes.
      </p>
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          size="lg" 
          className="rounded-xl font-bold"
          onClick={() => window.location.reload()}
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Check Status
        </Button>
      </div>
    </div>
  );
}
