import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContactForm } from "@/hooks/useContactForm";

const issueTypes = [
  { value: "technical", label: "Technical Issues" },
  { value: "account", label: "Account Problems" },
  { value: "billing", label: "Billing Questions" },
  { value: "general", label: "General Inquiry" },
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
];

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    issueType: "",
    message: "",
  });

  const { submitForm, isLoading } = useContactForm();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.issueType || !formData.message.trim()) {
      return;
    }

    const success = await submitForm(formData);
    if (success) {
      // Reset form on success
      setFormData({
        name: "",
        email: "",
        issueType: "",
        message: "",
      });
    }
  };

  const isFormValid = formData.name.trim() && 
                      formData.email.trim() && 
                      formData.issueType && 
                      formData.message.trim() &&
                      formData.message.length <= 1500;

  const remainingChars = 1500 - formData.message.length;

  return (
    <Card className="welp-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Get Support</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issueType">Issue Type *</Label>
            <Select value={formData.issueType} onValueChange={(value) => handleInputChange("issueType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select the type of issue" />
              </SelectTrigger>
              <SelectContent>
                {issueTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">
              Message * 
              <span className={`ml-2 text-sm ${remainingChars < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                ({remainingChars} characters remaining)
              </span>
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Please describe your issue or question in detail..."
              className="min-h-[120px] resize-vertical"
              maxLength={1500}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#ea384c] hover:bg-[#d02e3d]"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;