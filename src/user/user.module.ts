import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UpdateController } from 'src/updates.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SqsService } from './sqs.service';
import { SQSClient } from '@aws-sdk/client-sqs';

@Module({
  imports: [ConfigModule],
  controllers: [UserController, UpdateController],
  providers: [
    UserService,
    SqsService,
    {
      provide: 'SQS_QUEUE_URL',
      useFactory: (configService: ConfigService) =>
        configService.get<string>('SQS_QUEUE_URL'),
      inject: [ConfigService],
    },
    {
      provide: SQSClient,
      useValue: new SQSClient({ region: process.env.AWS_REGION }),
    },
  ],
  exports: [UserService],
})
export class UserModule {}
