import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import ScanPrescription from "@/pages/ScanPrescription";
import PatientRecords from "@/pages/PatientRecords";
import PostSurgery from "@/pages/PostSurgery";
import SecurityCenter from "@/pages/SecurityCenter";
import PatientDashboard from "@/pages/PatientDashboard";
import NotificationsSystem from "@/components/layout/Notifications";
import { useState, useEffect } from "react";

type RouterProps = {
  userRole?: string;
};

function Router({ userRole = "doctor" }: RouterProps) {
  // Check if user role is patient or doctor
  const isPatient = userRole === "patient";

  return (
    <Switch>
      <Route path="/" component={isPatient ? PatientDashboard : Dashboard} />
      <Route path="/patient-dashboard" component={PatientDashboard} />
      <Route path="/prescriptions" component={ScanPrescription} />
      <Route path="/patients" component={PatientRecords} />
      <Route path="/post-surgery" component={PostSurgery} />
      <Route path="/security" component={SecurityCenter} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = useState<{ id: number, name: string, role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo purposes, set a user (in a real app, this would verify authentication)
    setUser({
      id: 1,
      name: "Dr. Sarah Chen",
      role: "doctor",
    });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-[#f5f7fa] min-h-screen">
        <Router userRole={user?.role} />
      </div>
      <NotificationsSystem />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
