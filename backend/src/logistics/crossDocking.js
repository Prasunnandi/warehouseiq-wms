/**
 * Automated Cross-Docking Matching & Dispatch Engine
 * Matches incoming inbound pallet shipments directly to pending outbound orders,
 * bypassing intermediate bin putaway to minimize warehouse dwell time, labor touches, and demurrage.
 */

export const ORDER_PRIORITY = {
  CRITICAL_SLA: 1, // Expedited / Next-day cutoff
  HIGH: 2,         // 2-day delivery
  STANDARD: 3,     // Standard ground
  BACKORDER: 4     // Delayed backorders
};

export class CrossDockingEngine {
  /**
   * @param {Object} [options]
   * @param {number} [options.maxStagingDwellHours=4] - Max hours allowed in cross-dock staging lane
   * @param {number} [options.stagingLanesCount=12]   - Available cross-dock transfer staging lanes
   */
  constructor(options = {}) {
    this.maxStagingDwellHours = options.maxStagingDwellHours || 4;
    this.stagingLanesCount = options.stagingLanesCount || 12;
  }

  /**
   * Matches an array of inbound shipments against pending outbound orders
   * @param {Array<Object>} inboundShipments - [{ shipmentId, sku, quantity, receivedAt, dockId }]
   * @param {Array<Object>} outboundOrders - [{ orderId, sku, requiredQuantity, priority, destination, dispatchCutoff }]
   * @returns {Object} Cross-dock matches, allocations, putaway surplus, and operational savings
   */
  matchShipments(inboundShipments = [], outboundOrders = []) {
    // Clone orders to track remaining unmet demand
    const pendingOrders = outboundOrders.map(o => ({
      ...o,
      allocatedQuantity: 0,
      remainingQuantity: o.requiredQuantity,
      priorityWeight: ORDER_PRIORITY[o.priority] || ORDER_PRIORITY.STANDARD
    }));

    // Sort pending orders by urgency: priority ascending, then earliest dispatch cutoff
    pendingOrders.sort((a, b) => {
      if (a.priorityWeight !== b.priorityWeight) {
        return a.priorityWeight - b.priorityWeight;
      }
      return new Date(a.dispatchCutoff || 0) - new Date(b.dispatchCutoff || 0);
    });

    const crossDockMatches = [];
    const normalPutawayItems = [];
    let laneCounter = 1;

    let totalInboundUnits = 0;
    let totalCrossDockedUnits = 0;

    for (const inbound of inboundShipments) {
      let availableUnits = inbound.quantity;
      totalInboundUnits += inbound.quantity;

      // Find all matching orders for this SKU
      for (const order of pendingOrders) {
        if (availableUnits <= 0) break;
        if (order.sku !== inbound.sku || order.remainingQuantity <= 0) continue;

        const allocated = Math.min(availableUnits, order.remainingQuantity);
        availableUnits -= allocated;
        order.allocatedQuantity += allocated;
        order.remainingQuantity -= allocated;
        totalCrossDockedUnits += allocated;

        const assignedLane = `CD-LANE-${String(((laneCounter - 1) % this.stagingLanesCount) + 1).padStart(2, '0')}`;
        laneCounter++;

        crossDockMatches.push({
          matchId: `XDK-${inbound.shipmentId}-${order.orderId}-${Date.now().toString(36)}`,
          sku: inbound.sku,
          inboundShipmentId: inbound.shipmentId,
          inboundDock: inbound.dockId || 'DOCK-IN-01',
          outboundOrderId: order.orderId,
          outboundDestination: order.destination || 'OUT-HUB',
          quantityTransferred: allocated,
          orderPriority: order.priority || 'STANDARD',
          stagingLane: assignedLane,
          dispatchCutoff: order.dispatchCutoff,
          status: 'STAGED_FOR_DISPATCH'
        });
      }

      // Any remaining units from inbound pallet routed to warehouse putaway
      if (availableUnits > 0) {
        normalPutawayItems.push({
          shipmentId: inbound.shipmentId,
          sku: inbound.sku,
          surplusQuantity: availableUnits,
          recommendedStorageAction: 'ROUTED_TO_HIGH_BAY_PUTAWAY',
          assignedZone: `ZONE-${inbound.sku.substring(0, 3).toUpperCase()}`
        });
      }
    }

    const unfulfilledOrders = pendingOrders
      .filter(o => o.remainingQuantity > 0)
      .map(o => ({
        orderId: o.orderId,
        sku: o.sku,
        unmetQuantity: o.remainingQuantity,
        priority: o.priority
      }));

    const crossDockFulfillmentRate = totalInboundUnits > 0
      ? Number(((totalCrossDockedUnits / totalInboundUnits) * 100).toFixed(2))
      : 0;

    // Estimate operational savings:
    // Standard putaway: 4 handling touches (receive -> transport -> rack -> pick)
    // Cross-dock: 1 handling touch (receive -> cross-dock stage)
    const handlingTouchesSaved = totalCrossDockedUnits * 3;
    const estimatedHoursSaved = Number((totalCrossDockedUnits * 0.12).toFixed(1)); // ~7.2 mins saved per item

    return {
      summary: {
        totalInboundUnits,
        totalCrossDockedUnits,
        totalPutawaySurplusUnits: totalInboundUnits - totalCrossDockedUnits,
        crossDockFulfillmentRatePct: crossDockFulfillmentRate,
        handlingTouchesSaved,
        estimatedHoursSaved,
        activeCrossDockMatchesCount: crossDockMatches.length,
        unfulfilledOrdersCount: unfulfilledOrders.length
      },
      crossDockMatches,
      normalPutawayItems,
      unfulfilledOrders
    };
  }
}

// Dual ESM & CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ORDER_PRIORITY,
    CrossDockingEngine
  };
}

export default CrossDockingEngine;
