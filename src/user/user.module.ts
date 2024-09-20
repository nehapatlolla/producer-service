import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UpdateController } from 'src/updates.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [UserController, UpdateController],
  providers: [
    UserService,
    {
      provide: 'SQS_QUEUE_URL',
      useFactory: (configService: ConfigService) =>
        configService.get<string>('SQS_QUEUE_URL'),
      inject: [ConfigService],
    },
  ],
  exports: [UserService],
})
export class UserModule {}
