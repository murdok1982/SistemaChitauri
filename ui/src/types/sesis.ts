export interface Asset {
  id: string;
  kind: 'satellite' | 'drone' | 'field_operator' | 'rf_sensor' | 'cyber_sensor';
  current_status: string;
  last_heartbeat: string;
  location: [number, number]; // [lat, lon]
  classification_level: 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';
  metadata: Record<string, unknown>;
}

export interface Alert {
  id: string;
  event_id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  is_anomaly: boolean;
  human_validated?: boolean;
  timestamp: string;
  rule_id: string;
}

export interface TelemetryPoint {
  ts: string;
  asset_id: string;
  parameter: string;
  value: number;
  unit?: string;
}

export interface IntelProduct {
  id: string;
  product_type: 'INTSUM' | 'SITREP' | 'THREATSUM' | 'COA_BRIEF' | 'STRAT_BRIEF';
  content: string;
  classification_level: string;
  source_data: Record<string, unknown>;
  created_at: string;
  created_by: string;
}

export interface PIR {
  id: string;
  title: string;
  description: string;
  priority: 1 | 2 | 3 | 4 | 5;
  collection_methods: string[];
  due_date?: string;
  classification_level: string;
  is_active: boolean;
}

export interface ThreatLevel {
  level: 'BAJO' | 'MODERADO' | 'ELEVADO' | 'ALTO' | 'CRITICO';
  score: number;
}

export interface AresChatMessage {
  role: 'user' | 'ares';
  content: string;
  timestamp: string;
}

export interface BlueForceUnit {
  id: string;
  unit_id: string;
  position: [number, number]; // [lat, lon]
  altitude?: number;
  heading?: number;
  speed?: number;
  status: string;
  timestamp: string;
}

export interface Mission {
  id: string;
  name: string;
  mission_type: 'OFENSIVA' | 'DEFENSIVA' | 'PEACEKEEPING';
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'ABORTED';
  classification_level: string;
  start_time?: string;
  end_time?: string;
  orbat_unit_id?: string;
}

export interface ORBATUnit {
  id: string;
  name: string;
  unit_type: 'tierra' | 'mar' | 'aire' | 'espacio' | 'ciber';
  parent_id?: string;
  status: string;
  classification_level: string;
  location?: [number, number];
}

export interface CyberIncident {
  id: string;
  incident_type: 'MALWARE' | 'DDOS' | 'INTRUSION' | 'PHISHING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  target_system: string;
  kill_chain_stage?: string;
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'CLOSED';
  source_ip?: string;
  created_at: string;
}

export interface LogisticsSupply {
  id: string;
  item_type: string;
  quantity: number;
  unit: string;
  location_id?: string;
  min_threshold?: number;
  is_low_stock: boolean;
  last_updated: string;
}

export type ClassificationLevel = 'OPEN' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP_SECRET';

export interface WebSocketMessage {
  type: 'alert' | 'telemetry' | 'position_update' | 'threat_change' | 'system_status';
  payload: Record<string, unknown>;
  timestamp: string;
}
