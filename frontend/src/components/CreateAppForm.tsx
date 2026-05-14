import React, { useState } from 'react';
import { Plus, Loader2 } from "lucide-react";

interface CreateAppFormProps {
  onDeploy: (name: string, port: number, image: string) => Promise<void>;
}

const CreateAppForm: React.FC<CreateAppFormProps> = ({ onDeploy }) => {
  const [appName, setAppName] = useState("");
  const [appPort, setAppPort] = useState("");
  const [appImage, setAppImage] = useState("node:18-alpine");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName || !appPort || !appImage) {
      return alert("Please provide name, port, and image!");
    }
    
    setIsSubmitting(true);
    
    try {
      await onDeploy(appName, parseInt(appPort), appImage);
      
      setAppName("");
      setAppPort("");
      setAppImage("node:18-alpine");
    } catch (error) {
      console.error("Failed to deploy application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-200">
        <Plus size={20} className="text-blue-500" /> Start New App
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Application Name</label>
          <input 
            type="text" 
            placeholder="e.g. my-node-api" 
            value={appName} 
            onChange={(e) => setAppName(e.target.value)} 
            disabled={isSubmitting}
            className="w-full bg-gray-950 border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Docker Image</label>
          <input 
            type="text" 
            placeholder="e.g. node:20-alpine" 
            value={appImage} 
            onChange={(e) => setAppImage(e.target.value)} 
            disabled={isSubmitting}
            className="w-full bg-gray-950 border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Port</label>
          <input 
            type="number" 
            placeholder="e.g. 3000" 
            value={appPort} 
            onChange={(e) => setAppPort(e.target.value)} 
            disabled={isSubmitting}
            className="w-full bg-gray-950 border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" 
          />
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full mt-2 flex items-center justify-center gap-2 text-white font-medium py-2 px-4 rounded-md transition-colors ${
            isSubmitting 
              ? "bg-blue-600/50 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Starting Container...
            </>
          ) : (
            "Deploy"
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateAppForm;