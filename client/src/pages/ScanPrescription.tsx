import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import PrescriptionOCR from "@/components/dashboard/PrescriptionOCR";

export default function ScanPrescription() {
  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-neutral-800">Prescription Scanner</h2>
            <p className="text-neutral-500">Upload and process handwritten prescriptions with OCR</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <PrescriptionOCR />
          </div>
        </main>
      </div>
    </>
  );
}
