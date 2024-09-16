import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { UpdateController } from './updates.controller';

@Module({
  imports: [UserModule],
  controllers: [AppController, UpdateController],
  providers: [AppService],
})
export class AppModule {}
