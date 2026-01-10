import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { temporal } from 'zundo';
import { v4 as uuidv4 } from 'uuid';

export type PinType = 'text' | 'image';

export interface Pin {
  id: string;
  type: PinType;
  x: number;
  y: number;
  content: string; // text string or image base64/URL
  width: number;
  height: number;
  color: string; // background color for text notes
}

interface ViewState {
  x: number;
  y: number;
  scale: number;
}

interface BoardState {
  pins: Pin[];
  snapshots: Record<string, Pin[]>;
  view: ViewState;
  
  // actions
  addPin: (type: PinType, content: string, x?: number, y?: number) => void;
  updatePin: (id: string, patches: Partial<Pin>) => void;
  removePin: (id: string) => void;

  updateView: (x: number, y: number, scale: number) => void;
  
  // snapshot Logic
  saveSnapshot: (name: string) => void;
  loadSnapshot: (name: string) => void;
  deleteSnapshot: (name: string) => void;
}

const COLORS = ['#feff9c', '#fff740', '#7afcff', '#ff65a3', '#e0e0e0'];

export const useBoardStore = create<BoardState>()(
  temporal(
    persist(
      (set, get) => ({
        pins: [],
        snapshots: {},
        view: { x: 0, y: 0, scale: 1 },

        addPin: (type, content, x = 100, y = 100) => {
          const newPin: Pin = {
            id: uuidv4(),
            type,
            x,
            y,
            content,
            width: type === 'image' ? 300 : 200,
            height: type === 'image' ? 300 : 200,
            color: type === 'text' ? COLORS[Math.floor(Math.random() * COLORS.length)] : 'transparent',
          };
          set((state) => ({ pins: [...state.pins, newPin] }));
        },

        updatePin: (id, patches) => {
          set((state) => ({
            pins: state.pins.map((p) => (p.id === id ? { ...p, ...patches } : p)),
          }));
        },

        removePin: (id) => {
          set((state) => ({
            pins: state.pins.filter((p) => p.id !== id),
          }));
        },

        updateView: (x, y, scale) => {
          set({ view: { x, y, scale } });
        },

        saveSnapshot: (name) => {
          set((state) => ({
            snapshots: { ...state.snapshots, [name]: state.pins },
          }));
        },

        loadSnapshot: (name) => {
          const snapshot = get().snapshots[name];
          if (snapshot) {
            set({ pins: snapshot });
          }
        },

        deleteSnapshot: (name) => {
          set((state) => {
            const newSnapshots = { ...state.snapshots };
            delete newSnapshots[name];
            return { snapshots: newSnapshots };
          });
        },
      }),
      {
        name: 'digital-board-storage',
        partialize: (state) => ({ pins: state.pins, snapshots: state.snapshots, view: state.view }), // Don't persist undo history
      }
    )
  )
);