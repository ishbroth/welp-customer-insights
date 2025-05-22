
import React from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchButtonProps {
  buttonText: string;
}

const SearchButton = ({ buttonText }: SearchButtonProps) => {
  return (
    <Button type="submit" className="welp-button w-full flex items-center justify-center">
      <Search className="mr-2 h-4 w-4" />
      {buttonText}
    </Button>
  );
};

export default SearchButton;
