import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  EnvironmentVariables,
  envValidationSchema,
} from './config/env.validation';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        uri: config.get('MONGO_URI', { infer: true }),
        retryAttempts: 5,
        retryDelay: 3000,
        serverSelectionTimeoutMS: 5000,
      }),
    }),
    AuthModule,
    UsersModule,
    WorkspacesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
