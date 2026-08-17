/**
 * Node lifecycle state (com.ayrotek.reckon.gpumonitoring.entity.NodeStatus)
 */
export type NodeStatus = 'PENDING' | 'APPROVED' | 'REVOKED';

/**
 * A single GPU reported in a node's inventory.
 * Matches NodeResponse.GpuResponse.
 */
export interface NodeGpu {
  gpuId: string;
  name: string;
  tdpW: number | null;
  computeValue: number | null;
  computeUnit: string | null;
}

/**
 * A registered rig node. Matches gpu-monitoring-service's
 * com.ayrotek.reckon.gpumonitoring.dto.response.NodeResponse.
 */
export interface Node {
  id: string;
  hardwareId: string;
  model: string | null;
  fwVersion: string | null;
  status: NodeStatus;
  online: boolean;
  maxPowerW: number | null;
  minPowerW: number | null;
  createdAt: string;
  approvedAt: string | null;
  lastHeartbeatAt: string | null;
  gpus: NodeGpu[];
}

/**
 * Per-GPU telemetry sample. Matches TelemetryResponse.GpuTelemetryResponse.
 */
export interface GpuTelemetry {
  gpuId: string;
  loadPct: number | null;
  tempC: number | null;
  powerDrawW: number | null;
}

/**
 * A telemetry heartbeat record for a node. Matches TelemetryResponse.
 */
export interface Telemetry {
  id: number;
  nodeId: string;
  receivedAt: string;
  status: string;
  systemTempC: number | null;
  gpuTelemetry: GpuTelemetry[];
}

/**
 * Body for POST /api/v1/nodes/{nodeId}/power — matches PowerAdjustRequest.
 * This sets a total wattage setpoint; it is NOT a restart/reboot command.
 */
export interface PowerAdjustRequest {
  setpointPowerW: number;
}

/**
 * Derived, frontend-only aggregate over the node list — not returned by the backend.
 * Computed client-side from Node[] for dashboard/summary cards.
 */
export interface NodeStats {
  totalNodes: number;
  onlineNodes: number;
  offlineNodes: number;
  pendingNodes: number;
  approvedNodes: number;
  revokedNodes: number;
  totalGpus: number;
}
