import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initialBins, initialAuditLogs } from './data.js';

const app = express();
const PORT = process.env.PORT || 5004;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

let bins = [...initialBins];
let auditLogs = [...initialAuditLogs];

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'UP', service: 'WarehouseIQ WMS API', version: '1.0.0' });
});

app.get('/api/v1/bins', (req, res) => {
  res.json(bins);
});

app.get('/api/v1/audits', (req, res) => {
  res.json(auditLogs);
});

// Barcode Lookup Simulator
app.get('/api/v1/barcode/scan/:code', (req, res) => {
  const { code } = req.params;
  const bin = bins.find(b => b.barcode === code || b.sku.toLowerCase() === code.toLowerCase());
  if (!bin) return res.status(404).json({ error: 'Barcode not found in warehouse directory' });
  res.json(bin);
});

// Standout Feature: Cycle Count Discrepancy Adjustment & Audit Logger
app.post('/api/v1/bins/:id/audit-adjustment', (req, res) => {
  const { id } = req.params;
  const { physicalCount, reason, operator } = req.body;
  const bin = bins.find(b => b.id === id);
  if (!bin) return res.status(404).json({ error: 'Bin not found' });

  const prevQty = bin.systemQty;
  const newCount = Number(physicalCount);
  const delta = newCount - prevQty;

  bin.physicalCount = newCount;
  bin.systemQty = newCount;
  bin.status = delta === 0 ? 'VERIFIED_BALANCED' : delta > 0 ? 'DISCREPANCY_SURPLUS' : 'DISCREPANCY_DEFICIT';
  bin.lastAudited = new Date().toISOString();

  const newAudit = {
    id: `AUD-${Math.floor(100 + Math.random() * 900)}`,
    binId: bin.id,
    sku: bin.sku,
    operator: operator || 'WMS Operator',
    deltaQuantity: delta,
    reason: reason || 'Routine cycle count reconciliation',
    timestamp: new Date().toISOString()
  };

  auditLogs.unshift(newAudit);

  res.json({
    message: `Bin ${id} reconciled: system quantity updated from ${prevQty} to ${newCount} (Delta: ${delta > 0 ? '+' : ''}${delta}).`,
    bin,
    auditLog: newAudit
  });
});

app.listen(PORT, () => {
  console.log(`WarehouseIQ WMS API listening on port ${PORT}`);
});
