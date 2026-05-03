import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Asset, Alert, ThreatLevel, IntelProduct, PIR, BlueForceUnit, Mission } from '@/types/sesis';

interface SesisState {
  // Assets
  assets: Asset[];
  selectedAssetId: string | null;

  // Alerts
  alerts: Alert[];
  threatLevel: ThreatLevel;

  // Intel
  intelProducts: IntelProduct[];
  pirs: PIR[];

  // C2
  missions: Mission[];
  blueForceUnits: BlueForceUnit[];

  // System
  aresStatus: 'CHECKING' | 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  liveMode: boolean;
  wsConnected: boolean;

  // Actions
  setAssets: (assets: Asset[]) => void;
  selectAsset: (id: string | null) => void;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  setThreatLevel: (level: ThreatLevel) => void;
  setIntelProducts: (products: IntelProduct[]) => void;
  setPIRs: (pirs: PIR[]) => void;
  setMissions: (missions: Mission[]) => void;
  addMission: (mission: Mission) => void;
  setBlueForceUnits: (units: BlueForceUnit[]) => void;
  updateBlueForceUnit: (unit: BlueForceUnit) => void;
  setAresStatus: (status: 'CHECKING' | 'ONLINE' | 'OFFLINE' | 'DEGRADED') => void;
  toggleLiveMode: () => void;
  setWsConnected: (connected: boolean) => void;
}

export const useSesisStore = create<SesisState>()(
  immer((set) => ({
    // Initial state
    assets: [],
    selectedAssetId: null,
    alerts: [],
    threatLevel: { level: 'BAJO', score: 0.2 },
    intelProducts: [],
    pirs: [],
    missions: [],
    blueForceUnits: [],
    aresStatus: 'CHECKING',
    liveMode: true,
    wsConnected: false,

    // Actions
    setAssets: (assets) =>
      set((state) => {
        state.assets = assets;
      }),

    selectAsset: (id) =>
      set((state) => {
        state.selectedAssetId = id;
      }),

    setAlerts: (alerts) =>
      set((state) => {
        state.alerts = alerts;
      }),

    addAlert: (alert) =>
      set((state) => {
        state.alerts.unshift(alert);
      }),

    setThreatLevel: (level) =>
      set((state) => {
        state.threatLevel = level;
      }),

    setIntelProducts: (products) =>
      set((state) => {
        state.intelProducts = products;
      }),

    setPIRs: (pirs) =>
      set((state) => {
        state.pirs = pirs;
      }),

    setMissions: (missions) =>
      set((state) => {
        state.missions = missions;
      }),

    addMission: (mission) =>
      set((state) => {
        state.missions.push(mission);
      }),

    setBlueForceUnits: (units) =>
      set((state) => {
        state.blueForceUnits = units;
      }),

    updateBlueForceUnit: (unit) =>
      set((state) => {
        const idx = state.blueForceUnits.findIndex((u) => u.id === unit.id);
        if (idx >= 0) {
          state.blueForceUnits[idx] = unit;
        } else {
          state.blueForceUnits.push(unit);
        }
      }),

    setAresStatus: (status) =>
      set((state) => {
        state.aresStatus = status;
      }),

    toggleLiveMode: () =>
      set((state) => {
        state.liveMode = !state.liveMode;
      }),

    setWsConnected: (connected) =>
      set((state) => {
        state.wsConnected = connected;
      }),
  }))
);
