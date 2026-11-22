// WarehouseIQ API Client

const API_BASE = '/api/v1';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`API call ${endpoint} fallback:`, e.message);
    return getFallbackData(endpoint);
  }
}

export const api = {
  getBins: () => request('/bins'),
  getAudits: () => request('/audits'),
  scanBarcode: (code) => request(`/barcode/scan/${code}`),
  auditAdjustment: (binId, payload) => request(`/bins/${binId}/audit-adjustment`, {
    method: 'POST',
    body: JSON.stringify(payload)
  })
};

function getFallbackData(endpoint) {
  if (endpoint.includes('/bins')) {
    return [
      {
        id: "BIN-A01-01",
        zone: "Zone A: High-Security Electronics",
        aisle: "Aisle 01",
        shelf: "Shelf 01",
        sku: "TEC-PH-10001",
        productName: "Apple iPhone 15 Pro Max 256GB",
        systemQty: 45,
        physicalCount: 45,
        barcode: "0190199100018",
        unitValue: 1199.99,
        status: "VERIFIED_BALANCED",
        lastAudited: "2026-11-22T14:30:00Z"
      },
      {
        id: "BIN-A01-02",
        zone: "Zone A: High-Security Electronics",
        aisle: "Aisle 01",
        shelf: "Shelf 02",
        sku: "TEC-LT-40004",
        productName: "Dell XPS 15 9530 Core i9",
        systemQty: 28,
        physicalCount: 26,
        barcode: "0190199400049",
        unitValue: 2299.00,
        status: "DISCREPANCY_DEFICIT",
        lastAudited: "2026-11-22T12:15:00Z"
      },
      {
        id: "BIN-B03-01",
        zone: "Zone B: Heavy Freight & Pallets",
        aisle: "Aisle 03",
        shelf: "Pallet Bay 01",
        sku: "FUR-CH-20002",
        productName: "Herman Miller Aeron Ergonomic Chair",
        systemQty: 18,
        physicalCount: 18,
        barcode: "0190199200025",
        unitValue: 1495.00,
        status: "VERIFIED_BALANCED",
        lastAudited: "2026-11-21T18:00:00Z"
      }
    ];
  }
  if (endpoint.includes('/audits')) {
    return [
      {
        id: "AUD-901",
        binId: "BIN-A01-02",
        sku: "TEC-LT-40004",
        operator: "James Miller (WMS-Lead)",
        deltaQuantity: -2,
        reason: "Damaged packaging moved to RMA quarantine bay without barcoding",
        timestamp: "2026-11-22T12:15:00Z"
      }
    ];
  }
  return [];
}
