import { Client } from 'colyseus.js';
const COLYSEUS_URL = import.meta.env.VITE_COLYSEUS_URL || 'ws://localhost:3001';
export const colyseusClient = new Client(COLYSEUS_URL);
