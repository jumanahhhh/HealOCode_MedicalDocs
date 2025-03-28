import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    return location === path;
  };
  
  return (
    <aside className="w-16 md:w-64 bg-white shadow-lg flex-shrink-0">
      <nav className="mt-5 px-2 space-y-1">
        <div className={`sidebar-link ${isActive('/') ? 'active bg-primary-50 border-l-4 border-primary' : ''}`}>
          <Link href="/">
            <div className="flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer">
              <span className={`material-icons ${isActive('/') ? 'text-primary' : 'text-neutral-400'} mr-3`}>dashboard</span>
              <span className={`hidden md:block ${isActive('/') ? 'text-neutral-700' : 'text-neutral-600'}`}>Dashboard</span>
            </div>
          </Link>
        </div>
        
        <div className={`sidebar-link ${isActive('/patients') ? 'active bg-primary-50 border-l-4 border-primary' : ''}`}>
          <Link href="/patients">
            <div className="flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer">
              <span className={`material-icons ${isActive('/patients') ? 'text-primary' : 'text-neutral-400'} mr-3`}>description</span>
              <span className={`hidden md:block ${isActive('/patients') ? 'text-neutral-700' : 'text-neutral-600'}`}>Patient Records</span>
            </div>
          </Link>
        </div>
        
        <div className={`sidebar-link ${isActive('/prescriptions') ? 'active bg-primary-50 border-l-4 border-primary' : ''}`}>
          <Link href="/prescriptions">
            <div className="flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer">
              <span className={`material-icons ${isActive('/prescriptions') ? 'text-primary' : 'text-neutral-400'} mr-3`}>camera_alt</span>
              <span className={`hidden md:block ${isActive('/prescriptions') ? 'text-neutral-700' : 'text-neutral-600'}`}>Scan Prescriptions</span>
            </div>
          </Link>
        </div>
        
        <div className={`sidebar-link ${isActive('/post-surgery') ? 'active bg-primary-50 border-l-4 border-primary' : ''}`}>
          <Link href="/post-surgery">
            <div className="flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer">
              <span className={`material-icons ${isActive('/post-surgery') ? 'text-primary' : 'text-neutral-400'} mr-3`}>healing</span>
              <span className={`hidden md:block ${isActive('/post-surgery') ? 'text-neutral-700' : 'text-neutral-600'}`}>Post-Surgery Docs</span>
            </div>
          </Link>
        </div>
        
        <div className={`sidebar-link ${isActive('/security') ? 'active bg-primary-50 border-l-4 border-primary' : ''}`}>
          <Link href="/security">
            <div className="flex items-center px-2 py-3 text-sm font-medium rounded-md cursor-pointer">
              <span className={`material-icons ${isActive('/security') ? 'text-primary' : 'text-neutral-400'} mr-3`}>security</span>
              <span className={`hidden md:block ${isActive('/security') ? 'text-neutral-700' : 'text-neutral-600'}`}>Security Center</span>
            </div>
          </Link>
        </div>
      </nav>
      
      <div className="mt-8 px-3 hidden md:block">
        <div className="bg-neutral-100 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="material-icons text-green-500">verified</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-700">Blockchain Secured</p>
              <p className="text-xs text-neutral-500">Last sync: 2 mins ago</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
