import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import SecurityDashboard from "@/components/dashboard/SecurityDashboard";
import { useState } from "react";

export default function SecurityCenter() {
  const [activeTab, setActiveTab] = useState('access-control');
  
  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-neutral-800">Security Center</h2>
            <p className="text-neutral-500">Manage blockchain verification and access permissions</p>
          </div>
          
          <div className="mb-6">
            <div className="border-b border-neutral-200">
              <div className="flex -mb-px">
                <button 
                  className={`mr-6 py-2 border-b-2 ${activeTab === 'access-control' ? 'border-primary-DEFAULT text-primary-DEFAULT' : 'border-transparent text-neutral-500 hover:text-neutral-700'} font-medium`}
                  onClick={() => setActiveTab('access-control')}
                >
                  Access Control
                </button>
                <button 
                  className={`mr-6 py-2 border-b-2 ${activeTab === 'blockchain' ? 'border-primary-DEFAULT text-primary-DEFAULT' : 'border-transparent text-neutral-500 hover:text-neutral-700'} font-medium`}
                  onClick={() => setActiveTab('blockchain')}
                >
                  Blockchain Verification
                </button>
                <button 
                  className={`mr-6 py-2 border-b-2 ${activeTab === 'audit' ? 'border-primary-DEFAULT text-primary-DEFAULT' : 'border-transparent text-neutral-500 hover:text-neutral-700'} font-medium`}
                  onClick={() => setActiveTab('audit')}
                >
                  Audit Logs
                </button>
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto">
            <SecurityDashboard />
          </div>
        </main>
      </div>
    </>
  );
}
