import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import PostSurgeryDocumentation from "@/components/dashboard/PostSurgeryDocumentation";

export default function PostSurgery() {
  return (
    <>
      <Header />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-neutral-800">Post-Surgery Documentation</h2>
            <p className="text-neutral-500">Create and manage post-surgical reports with AI assistance</p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <PostSurgeryDocumentation />
          </div>
        </main>
      </div>
    </>
  );
}
