import React, { useState } from 'react';
import { Plus } from "lucide-react";

interface CreateAppFormProps {
  onDeploy: (name: string, port: number, image: string) => Promise<void>;
}

const CreateAppForm: React.FC<CreateAppFormProps> = ({ onDeploy }) => {
  const [appName, setAppName] = useState("");
  const [appPort, setAppPort] = useState("");
  const [appImage, setAppImage] = useState("node:18-alpine");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName || !appPort || !appImage) {
      return alert("Please provide name, port, and image!");
    }
    
    await onDeploy(appName, parseInt(appPort), appImage);
    
    setAppName("");
    setAppPort("");
    setAppImage("node:18-alpine");
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-200">
        <Plus size={20} className="text-blue-500" /> Start New App
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Application Name</label>
          <input type="text" placeholder="e.g. my-node-api" value={appName} onChange={(e) => setAppName(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Docker Image</label>
          <input type="text" placeholder="e.g. node:20-alpine" value={appImage} onChange={(e) => setAppImage(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Port</label>
          <input type="number" placeholder="e.g. 3000" value={appPort} onChange={(e) => setAppPort(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">Deploy</button>
      </form>
    </div>
  );
};

export default CreateAppForm;