import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionStates } from 'mongoose';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';

describe('AppController (e2e)', () => {
  const connection = { readyState: ConnectionStates.connected };
  let app: INestApplication<App>;

  beforeEach(async () => {
    connection.readyState = ConnectionStates.connected;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api', () => {
    return request(app.getHttpServer()).get('/api').expect(200).expect({
      name: 'Education CRM API',
      version: '0.0.1',
      status: 'running',
    });
  });

  it('GET /api/health (connected)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      services: { api: 'running', mongodb: 'connected' },
    });
  });

  it('GET /api/health (disconnected)', async () => {
    connection.readyState = ConnectionStates.disconnected;

    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(503);

    expect(response.body).toMatchObject({
      status: 'degraded',
      services: { api: 'running', mongodb: 'disconnected' },
    });
  });
});
