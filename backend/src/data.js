// WarehouseIQ Seed Data: Physical Bins, Barcodes & Audit Logs

export const initialBins = [
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
  },
  {
    id: "BIN-B03-02",
    zone: "Zone B: Heavy Freight & Pallets",
    aisle: "Aisle 03",
    shelf: "Pallet Bay 02",
    sku: "FUR-DK-60006",
    productName: "Solid Oak Executive Standing Desk",
    systemQty: 22,
    physicalCount: 23,
    barcode: "0190199600063",
    unitValue: 850.00,
    status: "DISCREPANCY_SURPLUS",
    lastAudited: "2026-11-22T10:45:00Z"
  },
  {
    id: "BIN-C02-01",
    zone: "Zone C: Fast-Mover Consumer Goods",
    aisle: "Aisle 02",
    shelf: "Shelf 03",
    sku: "GRO-OR-50005",
    productName: "Organic Colombian Coffee Beans 1kg",
    systemQty: 450,
    physicalCount: 450,
    barcode: "0190199500056",
    unitValue: 24.50,
    status: "VERIFIED_BALANCED",
    lastAudited: "2026-11-22T15:20:00Z"
  }
];

export const initialAuditLogs = [
  {
    id: "AUD-901",
    binId: "BIN-A01-02",
    sku: "TEC-LT-40004",
    operator: "James Miller (WMS-Lead)",
    deltaQuantity: -2,
    reason: "Damaged packaging moved to RMA quarantine bay without barcoding",
    timestamp: "2026-11-22T12:15:00Z"
  },
  {
    id: "AUD-902",
    binId: "BIN-B03-02",
    sku: "FUR-DK-60006",
    operator: "Robert Kowalski (Forklift-04)",
    deltaQuantity: +1,
    reason: "Inbound supplier overdelivery added to pallet without ASN update",
    timestamp: "2026-11-22T10:45:00Z"
  }
];
