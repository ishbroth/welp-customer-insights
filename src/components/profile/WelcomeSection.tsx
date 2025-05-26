
import { Shield } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@/data/mockUsers";

interface WelcomeSectionProps {
  currentUser: User | null;
}

const WelcomeSection = ({ currentUser }: WelcomeSectionProps) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-white shadow-md">
          {currentUser?.avatar ? (
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
          ) : (
            <AvatarFallback className="text-xl bg-welp-primary text-white">
              {currentUser?.name?.[0] || "U"}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {currentUser?.name}
            {currentUser?.type === "admin" && (
              <span className="inline-flex items-center ml-2 text-lg bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md">
                <Shield className="h-4 w-4 mr-1" /> Administrator
              </span>
            )}
          </h1>
          <p className="text-gray-600">
            {currentUser?.type === "admin" 
              ? "Administrator access - You can manage all aspects of the application"
              : currentUser?.type === "customer"
              ? "View what businesses are saying about you"
              : "Manage your profile and customer reviews"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;
