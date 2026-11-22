import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { History, ShieldCheck, ArrowRight, User, Clock } from 'lucide-react';

export default function AuditLogLedger() {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await api.getAudits();
      setAudits(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <History className="h-5 w-5 text-orange-400" /> WMS Inventory Adjustment & Audit Trail
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographically immutable audit records of all physical cycle count variances and stock adjustments.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Audit ID</th>
                <th className="py-2.5 px-3">Bin ID & SKU</th>
                <th className="py-2.5 px-3">Variance Delta</th>
                <th className="py-2.5 px-3">Auditing Operator</th>
                <th className="py-2.5 px-3">Reason for Adjustment</th>
                <th className="py-2.5 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {audits.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-orange-400">{a.id}</td>
                  <td className="py-3 px-3 font-mono">
                    <span className="font-semibold text-white">{a.binId}</span>
                    <span className="text-slate-500 block text-[10px]">{a.sku}</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold">
                    <span className={a.deltaQuantity < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                      {a.deltaQuantity > 0 ? `+${a.deltaQuantity}` : a.deltaQuantity} Units
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-medium">{a.operator}</td>
                  <td className="py-3 px-3 text-slate-400 italic max-w-xs">{a.reason}</td>
                  <td className="py-3 px-3 text-right text-slate-500 font-mono text-[11px]">
                    {new Date(a.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
