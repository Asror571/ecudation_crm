import { ServiceUnavailableException } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionStates } from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  const connection = { readyState: ConnectionStates.connected };
  let appController: AppController;

  beforeEach(async () => {
    connection.readyState = ConnectionStates.connected;

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();

    appController = app.get(AppController);
  });

  it('returns API info', () => {
    expect(appController.getInfo()).toEqual({
      name: 'Education CRM API',
      version: '0.0.1',
      status: 'running',
    });
  });

  it('reports ok when MongoDB is connected', () => {
    const health = appController.getHealth();

    expect(health.status).toBe('ok');
    expect(health.services).toEqual({ api: 'running', mongodb: 'connected' });
    expect(Number.isNaN(Date.parse(health.timestamp))).toBe(false);
  });

  it('throws 503 with degraded status when MongoDB is disconnected', () => {
    connection.readyState = ConnectionStates.disconnected;

    expect(() => appController.getHealth()).toThrow(
      ServiceUnavailableException,
    );

    try {
      appController.getHealth();
    } catch (error) {
      if (!(error instanceof ServiceUnavailableException)) throw error;
      expect(error.getResponse()).toMatchObject({
        status: 'degraded',
        services: { api: 'running', mongodb: 'disconnected' },
      });
    }
  });
});
