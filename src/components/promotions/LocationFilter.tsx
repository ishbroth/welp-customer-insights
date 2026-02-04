import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MapPin } from "lucide-react";

interface LocationFilterProps {
  onFilterChange: (filter: { city?: string; zipCodes?: string[] }) => void;
}

const LocationFilter = ({ onFilterChange }: LocationFilterProps) => {
  const [mode, setMode] = useState<"city" | "zip">("city");
  const [city, setCity] = useState("");
  const [zipInput, setZipInput] = useState("");
  const [zipCodes, setZipCodes] = useState<string[]>([]);

  const handleCityChange = (value: string) => {
    setCity(value);
    onFilterChange({ city: value || undefined });
  };

  const handleAddZip = () => {
    const zip = zipInput.trim();
    if (zip && zipCodes.length < 5 && /^\d{5}$/.test(zip) && !zipCodes.includes(zip)) {
      const newZips = [...zipCodes, zip];
      setZipCodes(newZips);
      setZipInput("");
      onFilterChange({ zipCodes: newZips });
    }
  };

  const handleRemoveZip = (zip: string) => {
    const newZips = zipCodes.filter((z) => z !== zip);
    setZipCodes(newZips);
    onFilterChange({ zipCodes: newZips.length > 0 ? newZips : undefined });
  };

  const handleModeChange = (newMode: "city" | "zip") => {
    setMode(newMode);
    setCity("");
    setZipCodes([]);
    setZipInput("");
    onFilterChange({});
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <label className="text-sm font-medium">Location Filter</label>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "city" ? "default" : "outline"}
          size="sm"
          onClick={() => handleModeChange("city")}
        >
          City
        </Button>
        <Button
          type="button"
          variant={mode === "zip" ? "default" : "outline"}
          size="sm"
          onClick={() => handleModeChange("zip")}
        >
          Zip Codes
        </Button>
      </div>

      {mode === "city" ? (
        <Input
          placeholder="Enter city name"
          value={city}
          onChange={(e) => handleCityChange(e.target.value)}
        />
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter zip code"
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value)}
              maxLength={5}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddZip())}
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddZip}
              disabled={zipCodes.length >= 5}
            >
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">{zipCodes.length}/5 zip codes</p>
          {zipCodes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {zipCodes.map((zip) => (
                <Badge key={zip} variant="secondary" className="gap-1">
                  {zip}
                  <button type="button" onClick={() => handleRemoveZip(zip)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationFilter;
