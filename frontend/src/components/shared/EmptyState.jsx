import React from 'react';
import { Info } from 'lucide-react';

const EmptyState = ({ icon, title, message }) => {
    const Icon = icon || Info;
  return (
    <div className="text-center py-10 px-6">
        <div className="mx-auto w-12 h-12 bg-gray-light text-gray-medium rounded-full grid place-items-center">
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-dark">{title}</h3>
        <p className="mt-1 text-sm text-gray-medium">{message}</p>
    </div>
  );
};

export default EmptyState;