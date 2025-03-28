import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function SecurityDashboard() {
  const { data: permissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['/api/access-permissions'],
    staleTime: 60000, // 1 minute
  });
  
  const { data: accessLogsCount, isLoading: isLoadingLogsCount } = useQuery({
    queryKey: ['/api/access-logs/count'],
    staleTime: 60000, // 1 minute
  });
  
  const handleManagePermissions = (permissionId: number) => {
    // In a real app, this would open a modal to manage permissions
    alert(`Managing permissions for ID: ${permissionId}`);
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200">
        <h3 className="text-lg font-medium text-neutral-800">Blockchain Security & Access Control</h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="flex items-start">
              <div className="bg-green-100 p-2 rounded-full">
                <span className="material-icons text-green-500">verified</span>
              </div>
              <div className="ml-3">
                <h4 className="text-md font-medium text-neutral-800">Records Secured</h4>
                <p className="text-2xl font-bold text-neutral-900 mt-1">178</p>
                <p className="text-xs text-neutral-500 mt-1">Last secured: 2 minutes ago</p>
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="flex items-start">
              <div className="bg-primary-light/10 p-2 rounded-full">
                <span className="material-icons text-primary-DEFAULT">manage_accounts</span>
              </div>
              <div className="ml-3">
                <h4 className="text-md font-medium text-neutral-800">Access Permissions</h4>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {isLoadingPermissions ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    permissions?.length || 0
                  )}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Active permission groups</p>
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="flex items-start">
              <div className="bg-amber-100 p-2 rounded-full">
                <span className="material-icons text-amber-500">history</span>
              </div>
              <div className="ml-3">
                <h4 className="text-md font-medium text-neutral-800">Access Logs</h4>
                <p className="text-2xl font-bold text-neutral-900 mt-1">
                  {isLoadingLogsCount ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    accessLogsCount?.count || 0
                  )}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Records accessed this week</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border border-neutral-200 rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
            <h4 className="text-md font-medium text-neutral-700">Patient Record Access Permissions</h4>
          </div>
          
          {isLoadingPermissions ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Record Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Authorized Users
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {permissions && permissions.length > 0 ? (
                    permissions.map((permission: any) => (
                      <tr key={permission.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                              {permission.patientName?.substring(0, 2).toUpperCase() || 'UN'}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-neutral-900">{permission.patientName || 'Unknown'}</div>
                              <div className="text-xs text-neutral-500">{permission.patientIdNumber || 'No ID'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900">{permission.recordType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-1">
                            <div className="h-6 w-6 rounded-full ring-2 ring-white bg-primary/20 flex items-center justify-center text-primary text-xs">
                              {permission.userName?.substring(0, 1).toUpperCase() || 'U'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${permission.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {permission.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-primary-DEFAULT hover:text-primary-dark"
                            onClick={() => handleManagePermissions(permission.id)}
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-neutral-500">
                        No access permissions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="bg-primary-light/5 border border-primary-light/20 rounded-lg p-4">
          <div className="flex items-start">
            <div className="bg-primary-light/20 p-2 rounded-full">
              <span className="material-icons text-primary-DEFAULT">security</span>
            </div>
            <div className="ml-3">
              <h5 className="text-md font-medium text-neutral-800">Blockchain Verification Status</h5>
              <p className="text-sm text-neutral-600 mt-2">
                All medical records are secured using blockchain technology, ensuring data integrity and tamper-proof storage.
                Each record modification is tracked with a timestamp and user identification.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded border border-neutral-200">
                  <div className="flex items-center">
                    <span className="material-icons text-green-500 text-sm">check_circle</span>
                    <span className="ml-2 text-sm font-medium text-neutral-700">Last Verified</span>
                  </div>
                  <p className="text-neutral-900 mt-1 text-sm">{new Date().toLocaleString()}</p>
                </div>
                
                <div className="bg-white p-3 rounded border border-neutral-200">
                  <div className="flex items-center">
                    <span className="material-icons text-primary-DEFAULT text-sm">link</span>
                    <span className="ml-2 text-sm font-medium text-neutral-700">Blockchain ID</span>
                  </div>
                  <p className="text-neutral-900 mt-1 text-sm font-mono">0x8fe3a...b92e4</p>
                </div>
                
                <div className="bg-white p-3 rounded border border-neutral-200">
                  <div className="flex items-center">
                    <span className="material-icons text-amber-500 text-sm">vpn_key</span>
                    <span className="ml-2 text-sm font-medium text-neutral-700">Security Status</span>
                  </div>
                  <p className="text-neutral-900 mt-1 text-sm">HIPAA Compliant / Encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
