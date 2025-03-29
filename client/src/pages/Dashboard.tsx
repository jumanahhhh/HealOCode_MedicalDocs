import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import QuickActions from "@/components/dashboard/QuickActions";
import PatientSearch from "@/components/dashboard/PatientSearch";
import PatientRecord from "@/components/dashboard/PatientRecord";
// import PrescriptionOCR from "@/components/dashboard/PrescriptionOCR";
import PostSurgeryDocumentation from "@/components/dashboard/PostSurgeryDocumentation";
import SecurityDashboard from "@/components/dashboard/SecurityDashboard";

export default function Dashboard() {
  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-neutral-800">Doctor's Dashboard</h2>
            <p className="text-neutral-500">Manage records, prescriptions, and documentation</p>
          </div>
          
          <QuickActions />
          
          <PatientSearch />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <PatientRecord />
            </div>
          </div>
          
          <div className="mt-8">
            <PostSurgeryDocumentation />
          </div>
          
          <div className="mt-8">
            <SecurityDashboard />
          </div>
        </main>
      </div>
    </>
  );
}
