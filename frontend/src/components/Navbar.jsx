import React from 'react';
import { Search, RefreshCw, ScanBarcode, Box } from 'lucide-react';

export default function Navbar({ onRefresh, isRefreshing }) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Scan barcode, SKU code, or Bin ID (e.g. BIN-A01-01)..."
            className="pl-9 pr-4 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/50 w-72 transition-colors font-mono"
          />
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-700/40">
          <ScanBarcode className="h-4 w-4 text-orange-400" />
          <span>Barcode Scanner: <strong className="text-emerald-400">Ready (Code128 / EAN13)</strong></span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          title="Refresh WMS Bin Cache"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
        </button>

        <div className="h-4 w-px bg-slate-800" />

        <div className="flex items-center gap-2.5 pl-1">
          <div className="h-8 w-8 rounded-full bg-orange-600/30 border border-orange-500/40 flex items-center justify-center font-bold text-xs text-orange-300">
            WMS
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-semibold text-slate-200">Floor Supervisor</div>
            <div className="text-[10px] text-slate-400">Warehouse Central</div>
          </div>
        </div>
      </div>
    </header>
  );
}
