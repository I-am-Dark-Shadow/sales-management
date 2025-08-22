import React from 'react';

const StatCard = ({ title, value, change, icon, iconBgColor, changeColor }) => {
  const Icon = icon;
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4 hover:shadow-sm transition">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-medium">{title}</div>
        <div className={`w-8 h-8 rounded-lg grid place-items-center ${iconBgColor}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {change && <div className={`mt-1 text-xs ${changeColor}`}>{change}</div>}
    </div>
  );
};

export default StatCard;