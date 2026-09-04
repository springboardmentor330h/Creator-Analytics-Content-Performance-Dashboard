import { Layers, Youtube, Instagram, Share2, Linkedin, Twitter, Facebook, ChevronDown } from "lucide-react";

export const PLATFORMS = [
  { id: "All", name: "All Platforms", icon: Layers, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { id: "YouTube", name: "YouTube", icon: Youtube, color: "text-rose-600 bg-rose-50 border-rose-200" },
  { id: "Instagram", name: "Instagram", icon: Instagram, color: "text-pink-600 bg-pink-50 border-pink-200" },
  { id: "TikTok", name: "TikTok", icon: Share2, color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
  { id: "LinkedIn", name: "LinkedIn", icon: Linkedin, color: "text-sky-600 bg-sky-50 border-sky-200" },
  { id: "X", name: "X (Twitter)", icon: Twitter, color: "text-slate-800 bg-slate-100 border-slate-300" },
  { id: "Facebook", name: "Facebook", icon: Facebook, color: "text-blue-600 bg-blue-50 border-blue-200" },
];

function PlatformSelector({ selectedPlatform, onSelectPlatform }) {
  const current = PLATFORMS.find((p) => p.id.toLowerCase() === selectedPlatform?.toLowerCase()) || PLATFORMS[0];
  const Icon = current.icon;

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
      <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Platform:</span>
      </div>

      {/* Quick Platform Pills (Desktop) */}
      <div className="hidden lg:flex items-center gap-1.5 flex-wrap">
        {PLATFORMS.map((platform) => {
          const PIcon = platform.icon;
          const isSelected = (selectedPlatform || "All").toLowerCase() === platform.id.toLowerCase();
          return (
            <button
              key={platform.id}
              onClick={() => onSelectPlatform(platform.id)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/70"
              }`}
            >
              <PIcon className="w-3.5 h-3.5" />
              <span>{platform.name}</span>
            </button>
          );
        })}
      </div>

      {/* Dropdown for Mobile / Tablets */}
      <div className="lg:hidden relative flex-1 min-w-[160px]">
        <select
          value={selectedPlatform || "All"}
          onChange={(e) => onSelectPlatform(e.target.value)}
          className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        >
          {PLATFORMS.map((platform) => (
            <option key={platform.id} value={platform.id}>
              {platform.name}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}

export default PlatformSelector;
