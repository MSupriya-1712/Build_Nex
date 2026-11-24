import { Response } from 'express';
import { EventEmitter } from 'events';

export interface RealtimeEvent {
  type: string;
  action: 'create' | 'update' | 'delete' | 'info';
  data?: any;
  message: string;
  timestamp: string;
}

class RealtimeBus extends EventEmitter {
  private clients: Set<Response> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 20000);
  }

  public addClient(res: Response) {
    this.clients.add(res);
    const welcome: RealtimeEvent = {
      type: 'CONNECTED',
      action: 'info',
      message: 'BuildNex Real-Time Sync Engine Connected',
      timestamp: new Date().toISOString(),
    };
    try {
      res.write(`data: ${JSON.stringify(welcome)}\n\n`);
    } catch {
      this.clients.delete(res);
    }
  }

  public removeClient(res: Response) {
    this.clients.delete(res);
  }

  public getClientCount(): number {
    return this.clients.size;
  }

  public broadcast(event: Omit<RealtimeEvent, 'timestamp'>) {
    const fullEvent: RealtimeEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };
    const payload = `data: ${JSON.stringify(fullEvent)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(payload);
      } catch {
        this.clients.delete(client);
      }
    }
  }

  private sendHeartbeat() {
    const ping = `: ping\n\n`;
    for (const client of this.clients) {
      try {
        client.write(ping);
      } catch {
        this.clients.delete(client);
      }
    }
  }
}

export const realtimeBus = new RealtimeBus();
