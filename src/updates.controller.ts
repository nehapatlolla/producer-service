import { Controller, Post, Body, Logger } from '@nestjs/common';

@Controller('updates')
export class UpdateController {
  private readonly logger = new Logger(UpdateController.name);

  @Post('result')
  async receiveUpdateResult(
    @Body()
    updateResult: {
      status: string;
      message: string;
    },
  ) {
    this.logger.log(
      `Received update result: ${updateResult.status}, ${updateResult.message}`,
    );
    return {
      message: `Received update result:  ${updateResult.status}, ${updateResult.message}`,
    };
  }
}
