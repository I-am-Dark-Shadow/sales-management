import React from 'react';

// A simple, reusable skeleton loader component
const SkeletonLoader = ({ className }) => {
  return (
    <div className={`bg-gray-200 rounded-md animate-pulse ${className}`}></div>
  );
};

export const TableSkeletonLoader = ({ rows = 3 }) => {
    return (
        <tbody>
            {[...Array(rows)].map((_, i) => (
                <tr key={i} className="border-t border-black/5">
                    <td className="px-5 py-4">
                        <SkeletonLoader className="h-4 w-3/4" />
                        <SkeletonLoader className="h-3 w-1/2 mt-2" />
                    </td>
                    <td className="px-5 py-4">
                        <SkeletonLoader className="h-6 w-16" />
                    </td>
                    <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                            <SkeletonLoader className="h-5 w-5 rounded-full" />
                            <SkeletonLoader className="h-5 w-5 rounded-full" />
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    );
};

export default SkeletonLoader;