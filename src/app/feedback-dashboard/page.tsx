"use client";

import { MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";

export default function FeedbackDashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <MessageSquare className="h-8 w-8 text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold">Feedback Dashboard</h1>
      </div>
      
      <p className="text-gray-600 mb-8">
        View and analyze feedback from all your retrospectives
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Total Feedback</h2>
          <p className="text-3xl font-bold text-blue-600">157</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Positive Reactions</h2>
          <div className="flex items-center">
            <ThumbsUp className="h-6 w-6 text-green-500 mr-2" />
            <p className="text-3xl font-bold text-green-600">89</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Negative Reactions</h2>
          <div className="flex items-center">
            <ThumbsDown className="h-6 w-6 text-red-500 mr-2" />
            <p className="text-3xl font-bold text-red-600">24</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Recent Feedback</h2>
        </div>
        
        <div className="p-6">
          <p className="text-gray-500 text-center py-8">
            Feedback items will be displayed here
          </p>
        </div>
      </div>
    </div>
  );
} 