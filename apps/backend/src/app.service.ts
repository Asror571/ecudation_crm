import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

export interface AppInfo {
  name: string;
  version: string;
  status: 'running';
}

export type MongoStatus =
  'connected' | 'connecting' | 'disconnecting' | 'disconnected';

export interface HealthResponse {
  status: 'ok' | 'degraded';
  services: {
    api: 'running';
    mongodb: MongoStatus;
  };
  timestamp: string;
}

const MONGO_STATUS: Record<ConnectionStates, MongoStatus> = {
  [ConnectionStates.connected]: 'connected',
  [ConnectionStates.connecting]: 'connecting',
  [ConnectionStates.disconnecting]: 'disconnecting',
  [ConnectionStates.disconnected]: 'disconnected',
  [ConnectionStates.uninitialized]: 'disconnected',
};

@Injectable()
export class AppService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getInfo(): AppInfo {
    return {
      name: 'Education CRM API',
      version: '0.0.1',
      status: 'running',
    };
  }

  getHealth(): HealthResponse {
    const mongodb = MONGO_STATUS[this.connection.readyState];

    return {
      status: mongodb === 'connected' ? 'ok' : 'degraded',
      services: { api: 'running', mongodb },
      timestamp: new Date().toISOString(),
    };
  }
}
