import { OpenAIConfigCheck } from "@/components/debug/OpenAIConfigCheck";

export const metadata = {
  title: "Configuration - AI App",
  description: "Verify and manage application configuration",
};

export default function ConfigPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Verify and manage various application settings and integrations
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <OpenAIConfigCheck />
        </div>
        
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
            <h3 className="font-medium text-amber-800 mb-2">OpenAI API Key Setup</h3>
            <p className="text-amber-700 mb-4 text-sm">
              To use the feedback theme clustering feature, you need to configure an OpenAI API key in your environment.
            </p>
            
            <div className="bg-amber-100 p-3 rounded text-xs font-mono">
              <p className="mb-1"># In your .env.local file:</p>
              <p>OPENAI_API_KEY=sk-your_openai_api_key_here</p>
            </div>
            
            <div className="mt-4 space-y-2 text-xs text-amber-600">
              <p>
                <strong>Important:</strong> After adding your API key, restart the development server for changes to take effect.
              </p>
              <p>
                You can get an API key from the <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI dashboard</a>.
              </p>
              <p>
                Make sure there are no spaces before or after the API key, and no line breaks in the key.
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
            <h3 className="font-medium mb-2">Using the Theme Clustering Feature</h3>
            <p className="text-sm mb-3">
              Once your OpenAI API key is configured:
            </p>
            <ol className="list-decimal pl-5 text-sm space-y-1">
              <li>Navigate to any retrospective page</li>
              <li>Find the "Identified Themes" section</li>
              <li>Click the "Analyze Themes" button</li>
              <li>The system will cluster similar feedback items into themes</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 