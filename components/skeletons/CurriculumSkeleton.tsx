
import React from 'react';

export const CurriculumSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-700 rounded w-full mb-1"></div>
      <div className="h-4 bg-gray-700 rounded w-5/6 mb-6"></div>
      
      {[...Array(4)].map((_, i) => (
        <div key={i} className="mb-6">
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-3"></div>
          <div className="ml-8 space-y-2">
            <div className="h-5 bg-gray-700 rounded w-full"></div>
            <div className="h-5 bg-gray-700 rounded w-full"></div>
            <div className="h-5 bg-gray-700 rounded w-11/12"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
