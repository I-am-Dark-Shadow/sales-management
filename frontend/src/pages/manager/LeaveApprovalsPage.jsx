import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import EmptyState from '../../components/shared/EmptyState'; // Import
import SkeletonLoader from '../../components/shared/SkeletonLoader'; // Import
import { CalendarCheck2 } from 'lucide-react';


const LeaveRequestSkeleton = () => (
  <div className="rounded-lg border border-black/10 p-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <SkeletonLoader className="w-9 h-9 rounded-md" />
      <div>
        <SkeletonLoader className="h-4 w-24 mb-1" />
        <SkeletonLoader className="h-3 w-32" />
      </div>
    </div>
    <div className="flex items-center gap-2">
      <SkeletonLoader className="h-6 w-16 rounded-md" />
      <SkeletonLoader className="h-6 w-16 rounded-md" />
    </div>
  </div>
);

const LeaveApprovalsPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING');

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get('/api/leaves/team-requests');
      setLeaves(data);
    } catch (error) {
      toast.error('Failed to fetch leave requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    const toastId = toast.loading('Updating status...');
    try {
      await axiosInstance.patch(`/api/leaves/${id}/status`, { status });
      toast.success('Status updated successfully!', { id: toastId });
      fetchLeaves(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update status.', { id: toastId });
    }
  };

  const filteredLeaves = leaves.filter(leave => leave.status === activeTab);

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <h2 className="text-lg font-semibold tracking-tight">Leave Approvals</h2>
      <div className="border-b border-black/10 mt-4">
        <nav className="-mb-px flex space-x-6">
          <button onClick={() => setActiveTab('PENDING')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'PENDING' ? 'border-pran-red text-pran-red' : 'border-transparent text-gray-medium hover:text-gray-dark'}`}>Pending</button>
          <button onClick={() => setActiveTab('APPROVED')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'APPROVED' ? 'border-pran-red text-pran-red' : 'border-transparent text-gray-medium hover:text-gray-dark'}`}>Approved</button>
          <button onClick={() => setActiveTab('REJECTED')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'REJECTED' ? 'border-pran-red text-pran-red' : 'border-transparent text-gray-medium hover:text-gray-dark'}`}>Rejected</button>
        </nav>
      </div>
      <div className="mt-4 space-y-3">
        {isLoading ? (
          <>
            <LeaveRequestSkeleton />
            <LeaveRequestSkeleton />
          </>
        ) : filteredLeaves.length === 0 ? (
          <EmptyState
            icon={CalendarCheck2}
            title={`No ${activeTab.toLowerCase()} requests`}
            message="This section is currently empty."
          />
        ) : (
          filteredLeaves.map((req) => (
            <div key={req._id} className="rounded-lg border border-black/10 p-3 flex items-center justify-between hover:bg-black/5 transition">
              <div className="flex items-center gap-3">
                <img src={`https://ui-avatars.com/api/?name=${req.executiveId.name}&background=random`} className="w-9 h-9 rounded-md object-cover" alt={req.executiveId.name} />
                <div>
                  <div className="text-sm font-medium tracking-tight">{req.executiveId.name}</div>
                  <div className="text-xs text-gray-medium">{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-medium mt-1">{req.reason}</div>
                </div>
              </div>
              {activeTab === 'PENDING' && (
                <div className="flex items-center gap-2">
                  <button onClick={() => handleUpdateStatus(req._id, 'APPROVED')} className="rounded-md bg-pran-green text-white px-2.5 py-1 text-xs hover:opacity-90 transition">Approve</button>
                  <button onClick={() => handleUpdateStatus(req._id, 'REJECTED')} className="rounded-md bg-pran-red text-white px-2.5 py-1 text-xs hover:opacity-90 transition">Reject</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LeaveApprovalsPage;