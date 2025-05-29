
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StateSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

const StateSelect = ({ value, onValueChange }: StateSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger 
        className="welp-input" 
        aria-label="State"
      >
        <SelectValue placeholder="State" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="AL">AL</SelectItem>
        <SelectItem value="AK">AK</SelectItem>
        <SelectItem value="AZ">AZ</SelectItem>
        <SelectItem value="AR">AR</SelectItem>
        <SelectItem value="CA">CA</SelectItem>
        <SelectItem value="CO">CO</SelectItem>
        <SelectItem value="CT">CT</SelectItem>
        <SelectItem value="DE">DE</SelectItem>
        <SelectItem value="FL">FL</SelectItem>
        <SelectItem value="GA">GA</SelectItem>
        <SelectItem value="HI">HI</SelectItem>
        <SelectItem value="ID">ID</SelectItem>
        <SelectItem value="IL">IL</SelectItem>
        <SelectItem value="IN">IN</SelectItem>
        <SelectItem value="IA">IA</SelectItem>
        <SelectItem value="KS">KS</SelectItem>
        <SelectItem value="KY">KY</SelectItem>
        <SelectItem value="LA">LA</SelectItem>
        <SelectItem value="ME">ME</SelectItem>
        <SelectItem value="MD">MD</SelectItem>
        <SelectItem value="MA">MA</SelectItem>
        <SelectItem value="MI">MI</SelectItem>
        <SelectItem value="MN">MN</SelectItem>
        <SelectItem value="MS">MS</SelectItem>
        <SelectItem value="MO">MO</SelectItem>
        <SelectItem value="MT">MT</SelectItem>
        <SelectItem value="NE">NE</SelectItem>
        <SelectItem value="NV">NV</SelectItem>
        <SelectItem value="NH">NH</SelectItem>
        <SelectItem value="NJ">NJ</SelectItem>
        <SelectItem value="NM">NM</SelectItem>
        <SelectItem value="NY">NY</SelectItem>
        <SelectItem value="NC">NC</SelectItem>
        <SelectItem value="ND">ND</SelectItem>
        <SelectItem value="OH">OH</SelectItem>
        <SelectItem value="OK">OK</SelectItem>
        <SelectItem value="OR">OR</SelectItem>
        <SelectItem value="PA">PA</SelectItem>
        <SelectItem value="RI">RI</SelectItem>
        <SelectItem value="SC">SC</SelectItem>
        <SelectItem value="SD">SD</SelectItem>
        <SelectItem value="TN">TN</SelectItem>
        <SelectItem value="TX">TX</SelectItem>
        <SelectItem value="UT">UT</SelectItem>
        <SelectItem value="VT">VT</SelectItem>
        <SelectItem value="VA">VA</SelectItem>
        <SelectItem value="WA">WA</SelectItem>
        <SelectItem value="WV">WV</SelectItem>
        <SelectItem value="WI">WI</SelectItem>
        <SelectItem value="WY">WY</SelectItem>
        <SelectItem value="DC">DC</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default StateSelect;
