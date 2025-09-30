import React from "react";
import { Input } from "@/components/ui/input";
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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <h4 className="text-sm font-medium">Friends, Partners, or Associates:</h4>
      </div>
      <div className="space-y-2">
        {[0, 1, 2].map((index) => (
          <div key={index} className="grid grid-cols-2 gap-2">
            <Input
              id={`associate-${index}-first`}
              type="text"
              placeholder={`Associate ${index + 1} First Name`}
              value={associates[index]?.firstName || ""}
              onChange={(e) => handleAssociateChange(index, 'firstName', e.target.value)}
              className="text-sm h-8"
            />
            <Input
              id={`associate-${index}-last`}
              type="text"
              placeholder={`Associate ${index + 1} Last Name`}
              value={associates[index]?.lastName || ""}
              onChange={(e) => handleAssociateChange(index, 'lastName', e.target.value)}
              className="text-sm h-8"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssociatesInput;