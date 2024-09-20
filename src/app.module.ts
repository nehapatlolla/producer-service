import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { UpdateController } from './updates.controller';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // This makes the config globally available
    }),
    UserModule,
  ],
  controllers: [AppController, UpdateController],
  providers: [AppService],
})
export class AppModule {}
