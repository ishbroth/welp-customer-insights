
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Phone } from 'lucide-react';

interface VerificationLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  icon?: ReactNode;
}

const VerificationLayout = ({ 
  title, 
  subtitle, 
  children, 
  icon = <Phone className="mx-auto h-10 w-10 text-blue-500" />
}: VerificationLayoutProps) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-4">
        <CardContent className="flex flex-col space-y-4">
          <div className="text-center">
            {icon}
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationLayout;
