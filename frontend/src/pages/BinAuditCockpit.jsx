import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Zap, 
  ScanBarcode, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Box, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export default function BinAuditCockpit({ onAuditLogged }) {
  const [bins, setBins] = useState([]);
  const [selectedBinId, setSelectedBinId] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [physicalCountInput, setPhysicalCountInput] = useState('');
  const [auditReason, setAuditReason] = useState('Routine cycle count reconciliation');
  const [operatorName, setOperatorName] = useState('Floor Lead - J. Miller');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await api.getBins();
      setBins(data || []);
      if (data?.length > 0) {
        setSelectedBinId(data[0].id);
        setPhysicalCountInput(data[0].systemQty);
      }
    }
    load();
  }, []);

  const selectedBin = bins.find(b => b.id === selectedBinId);

  const handleScanBarcode = () => {
    if (!barcodeInput) return;
    const match = bins.find(b => b.barcode === barcodeInput.trim() || b.sku.toLowerCase() === barcodeInput.trim().toLowerCase());
    if (match) {
      setSelectedBinId(match.id);
      setPhysicalCountInput(match.systemQty);
      setMessage(`Barcode Scanned: Matched ${match.productName} in ${match.id}`);
    } else {
      setMessage(`Barcode "${barcodeInput}" not recognized in active warehouse registry.`);
    }
  };

  const handleReconcile = async () => {
    if (!selectedBinId) return;
    setSubmitting(true);
    try {
      const payload = {
        physicalCount: Number(physicalCountInput),
        reason: auditReason,
        operator: operatorName
      };
      const res = await api.auditAdjustment(selectedBinId, payload);
      if (res.bin) {
        setBins(bins.map(b => b.id === res.bin.id ? res.bin : b));
        setMessage(res.message);
      }
      if (onAuditLogged) onAuditLogged();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const totalValue = bins.reduce((sum, b) => sum + (b.systemQty * b.unitValue), 0);
  const discrepancyCount = bins.filter(b => b.status.includes('DISCREPANCY')).length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-orange-950/20 to-slate-900 border border-orange-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-orange-500/5 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1">
              <Zap className="h-3 w-3" /> Standout Flagship Feature
            </span>
            <span className="text-xs text-slate-400">WarehouseIQ Physical-to-Digital WMS</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Zone, Aisle & Bin Mapping with Barcode Discrepancy Auditing
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Reconciles physical shelf inventory against digital system ledger using barcode scanning, cycle count variance auditing, and automated adjustment logging.
          </p>
        </div>
      </div>

      {/* Barcode Scanner Bar */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-400 shrink-0">
          <ScanBarcode className="h-4 w-4" /> Barcode Reader:
        </div>
        <div className="flex-1 relative w-full">
          <input
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            placeholder="Scan Code128 / EAN barcode (e.g. 0190199100018 or TEC-PH-10001)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-orange-500/60 font-mono"
          />
        </div>
        <button
          onClick={handleScanBarcode}
          className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5" /> Scan & Locate Bin
        </button>
      </div>

      {/* Notification */}
      {message && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Total Tracked Bins</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{bins.length} Active Bins</div>
          <div className="text-[10px] text-slate-400 mt-1">Across Zones A, B, & C</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Physical Discrepancy Alerts</div>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1 flex items-center gap-1.5">
            {discrepancyCount}
            {discrepancyCount > 0 && <AlertTriangle className="h-4 w-4 text-rose-400 animate-pulse" />}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Pending Cycle Count Audit</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Warehouse Valuation</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Reconciled On-Hand Asset Value</div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-xs text-slate-400">Cycle Count Compliance</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {Math.round(((bins.length - discrepancyCount) / bins.length) * 100)}%
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">Audit Ledger Verified</div>
        </div>
      </div>

      {/* Bin Grid & Reconciliation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bin Cards List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Box className="h-4 w-4 text-orange-400" /> Physical Warehouse Bins Directory
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bins.map(b => {
              const isSelected = selectedBinId === b.id;
              const isDiscrepant = b.status.includes('DISCREPANCY');

              return (
                <div
                  key={b.id}
                  onClick={() => {
                    setSelectedBinId(b.id);
                    setPhysicalCountInput(b.systemQty);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-3 ${
                    isSelected
                      ? 'bg-orange-950/20 border-orange-500/60 shadow-lg'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        {b.id}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">{b.zone}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isDiscrepant
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{b.productName}</h3>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">SKU: {b.sku}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 font-mono">
                    <span className="text-slate-400">Qty: <strong className="text-white">{b.systemQty}</strong></span>
                    <span className="text-slate-500 text-[11px]">{b.barcode}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Bin Cycle Count Reconciliation Action */}
        <div>
          {selectedBin ? (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 sticky top-24">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> Cycle Count Audit & Adjustment
                </span>
                <h3 className="text-base font-bold text-white mt-1">{selectedBin.productName}</h3>
                <div className="text-xs text-slate-400 font-mono">{selectedBin.id} • {selectedBin.sku}</div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold">Physical Count (Scanned on Shelf)</label>
                  <input
                    type="number"
                    value={physicalCountInput}
                    onChange={(e) => setPhysicalCountInput(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-orange-500/60"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Current digital system count: <strong>{selectedBin.systemQty}</strong>
                  </span>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold">Auditing Operator</label>
                  <input
                    type="text"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-orange-500/60"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold">Reason for Discrepancy Adjustment</label>
                  <input
                    type="text"
                    value={auditReason}
                    onChange={(e) => setAuditReason(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-orange-500/60"
                  />
                </div>

                <button
                  onClick={handleReconcile}
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {submitting ? 'Reconciling...' : 'Reconcile Bin & Log Audit'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
              Select a warehouse bin to inspect.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
