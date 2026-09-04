import { ExternalLink, Terminal, Shield, CheckCircle2 } from "lucide-react";

function ApiDocs() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Interactive Swagger API Documentation</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              OpenAPI 3.0
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Test and inspect backend endpoints for Reports, Analytics, Monetization, Content, and Webhooks in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/docs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open Full Swagger in New Tab
          </a>
          <a
            href="/openapi.json"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-xs"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-500" /> openapi.json
          </a>
        </div>
      </div>

      {/* Embedded Swagger UI Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden h-[750px] flex flex-col">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-slate-700 font-medium">http://localhost:3000/docs</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-600">
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> Bearer Token Attached
            </span>
          </div>
        </div>

        <iframe
          src="/docs"
          title="CreatorIQ Swagger UI"
          className="w-full flex-1 border-0"
        />
      </div>
    </div>
  );
}

export default ApiDocs;
