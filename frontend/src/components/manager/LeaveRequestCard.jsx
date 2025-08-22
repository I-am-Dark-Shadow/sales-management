import React from 'react';

// Mock data
const mockRequests = [
    { id: 1, name: 'S. Ahmed', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=128', days: 2, reason: 'Medical' },
    { id: 2, name: 'R. Khatun', avatar: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=128', days: 1, reason: 'Personal' },
];

const LeaveRequestCard = () => {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="font-medium tracking-tight">Pending Leave Requests</div>
        <div className="text-xs text-gray-medium">{mockRequests.length} requests</div>
      </div>
      <div className="mt-4 space-y-3">
        {mockRequests.map((req) => (
          <div key={req.id} className="rounded-lg border border-black/10 p-3 flex items-center justify-between hover:bg-black/5 transition">
            <div className="flex items-center gap-3">
              <img src={req.avatar} className="w-9 h-9 rounded-md object-cover" alt={req.name} />
              <div>
                <div className="text-sm font-medium tracking-tight">{req.name}</div>
                <div className="text-xs text-gray-medium">{req.days} day{req.days > 1 ? 's' : ''} • {req.reason}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-md bg-pran-green text-white px-2.5 py-1 text-xs hover:opacity-90 transition">Approve</button>
              <button className="rounded-md bg-pran-red text-white px-2.5 py-1 text-xs hover:opacity-90 transition">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveRequestCard;