
import { Customer } from "@/types/search";

// Function to search customers based on search criteria
export const searchCustomers = async (
  searchParams: {
    lastName?: string;
    firstName?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    fuzzyMatch?: boolean;
    similarityThreshold?: number;
  }
): Promise<Customer[]> => {
  try {
    // For now, return an empty array as we're not connecting to Supabase
    return [];
  } catch (error) {
    console.error("Error searching customers:", error);
    return [];
  }
};

// Function to create a searchable customer - mocked version
export const createSearchableCustomer = async (
  customerData: {
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode: string;
  }
) => {
  try {
    // Mock implementation that doesn't use Supabase
    return { id: `mock-${Math.random().toString(36).substring(2, 9)}` };
  } catch (error) {
    console.error("Error creating searchable customer:", error);
    throw error;
  }
};
