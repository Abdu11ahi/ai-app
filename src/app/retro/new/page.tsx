"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, Users, Save } from "lucide-react";

export default function NewRetroPage() {
  const router = useRouter();
  const [sprintName, setSprintName] = useState("");
  const [sprintNumber, setSprintNumber] = useState("");
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Implement actual retrospective creation with Supabase
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      router.push("/retrospectives");
    }, 1000);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Plus className="h-8 w-8 text-blue-600 mr-3" />
        <h1 className="text-3xl font-bold">Create New Retrospective</h1>
      </div>
      
      <p className="text-gray-600 mb-8">
        Set up a new retrospective session for your team
      </p>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="sprintName" className="block text-sm font-medium text-gray-700 mb-1">
                Sprint Name
              </label>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  id="sprintName"
                  type="text"
                  value={sprintName}
                  onChange={(e) => setSprintName(e.target.value)}
                  required
                  placeholder="e.g. Q2 Release"
                  className="flex-1 p-2 border rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="sprintNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Sprint Number
              </label>
              <div className="flex items-center">
                <span className="h-5 w-5 flex items-center justify-center text-gray-400 mr-2">#</span>
                <input
                  id="sprintNumber"
                  type="number"
                  value={sprintNumber}
                  onChange={(e) => setSprintNumber(e.target.value)}
                  required
                  placeholder="e.g. 14"
                  className="flex-1 p-2 border rounded-md"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                Team Name
              </label>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  id="teamName"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  placeholder="e.g. Frontend Team"
                  className="flex-1 p-2 border rounded-md"
                />
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors flex justify-center items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Create Retrospective
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 