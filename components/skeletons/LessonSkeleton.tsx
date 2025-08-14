
import React from 'react';

export const LessonSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 animate-pulse">
      <div className="h-8 bg-gray-700 rounded w-1/2 mb-6"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
      </div>
      <div className="h-6 bg-gray-700 rounded w-1/3 my-8"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-11/12"></div>
      </div>
      <div className="my-6 p-12 bg-gray-900 rounded-md">
         <div className="space-y-2">
            <div className="h-3 bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-700 rounded w-5/6"></div>
            <div className="h-3 bg-gray-700 rounded w-full"></div>
        </div>
      </div>
       <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  );
};
