
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const AdminDashboard = () => {
  return (
    <Card className="p-6 bg-gradient-to-r from-yellow-100 to-yellow-50">
      <h2 className="text-xl font-semibold mb-4">Administrator Dashboard</h2>
      <p className="text-gray-600 mb-6">
        As an administrator, you have full access to all parts of the application.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button variant="secondary" asChild>
          <Link to="/review/new">Create Review</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/search">Search Users</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to="/subscription">Manage Subscriptions</Link>
        </Button>
      </div>
    </Card>
  );
};

export default AdminDashboard;
