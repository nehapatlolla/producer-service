// Import necessary modules
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
    // Log the received update result
    this.logger.log(
      `Received update result: ${updateResult.status}, ${updateResult.message}`,
    );
    // Optionally, you can process the result here, e.g., update the database, notify the user, etc.
    return {
      message: `Received update result:  ${updateResult.status}, ${updateResult.message}`,
    };
  }
}
