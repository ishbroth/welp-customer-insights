
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { AlertCircle, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface MockDataToggleProps {
  compact?: boolean;
  className?: string;
}

const MockDataToggle = ({ compact = false, className = "" }: MockDataToggleProps) => {
  const { useMockData, setUseMockData } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setUseMockData(!useMockData);
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-2 ${className}`}>
              <Switch
                checked={!useMockData}
                onCheckedChange={handleToggle}
              />
              <span className="text-sm font-medium">
                {useMockData ? "Demo Mode" : "Real DB"}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle between demo data and real database</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Data Source</h3>
        <Switch
          checked={!useMockData}
          onCheckedChange={handleToggle}
        />
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className={`font-semibold ${useMockData ? "text-blue-600" : "text-gray-400"}`}>Demo Mode</span>
        <span className="mx-1">|</span>
        <span className={`font-semibold ${!useMockData ? "text-green-600" : "text-gray-400"}`}>Real Database</span>
      </div>
      
      {!isExpanded && (
        <Button
          variant="link"
          size="sm"
          className="p-0 h-auto mt-2 text-xs"
          onClick={() => setIsExpanded(true)}
        >
          Show details
        </Button>
      )}
      
      {isExpanded && (
        <div className="mt-3 text-xs">
          <div className="p-2 bg-gray-50 rounded-md">
            {useMockData ? (
              <>
                <div className="flex items-start gap-1 mb-1">
                  <Check className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p>Using pre-populated mock data</p>
                </div>
                <div className="flex items-start gap-1">
                  <Check className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p>Great for demos without real data</p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-1 mb-1">
                  <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>Connected to real Supabase database</p>
                </div>
                <div className="flex items-start gap-1">
                  <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <p>Any new data will be stored in the database</p>
                </div>
              </>
            )}
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto mt-1 text-xs"
              onClick={() => setIsExpanded(false)}
            >
              Hide details
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default MockDataToggle;
