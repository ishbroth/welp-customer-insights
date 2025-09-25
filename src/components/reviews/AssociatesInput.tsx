import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";

interface AssociatesInputProps {
  associates: Array<{ firstName: string; lastName: string }>;
  setAssociates: (associates: Array<{ firstName: string; lastName: string }>) => void;
}

const AssociatesInput: React.FC<AssociatesInputProps> = ({
  associates,
  setAssociates,
}) => {
  const handleAssociateChange = (index: number, field: 'firstName' | 'lastName', value: string) => {
    const newAssociates = [...associates];
    if (!newAssociates[index]) {
      newAssociates[index] = { firstName: '', lastName: '' };
    }
    newAssociates[index][field] = value;
    setAssociates(newAssociates);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Friends, Partners, Associates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {[0, 1, 2].map((index) => (
          <div key={index} className="space-y-2">
            <Label className="text-sm font-medium">
              Associate #{index + 1}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                id={`associate-${index}-first`}
                type="text"
                placeholder="First Name"
                value={associates[index]?.firstName || ""}
                onChange={(e) => handleAssociateChange(index, 'firstName', e.target.value)}
                className="w-full"
              />
              <Input
                id={`associate-${index}-last`}
                type="text"
                placeholder="Last Name"
                value={associates[index]?.lastName || ""}
                onChange={(e) => handleAssociateChange(index, 'lastName', e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AssociatesInput;