import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UpdateController } from 'src/updates.controller';

@Module({
  controllers: [UserController, UpdateController],
  providers: [UserService],
})
export class UserModule {}
