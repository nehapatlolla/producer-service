import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

@Injectable()
export class SqsService {
  private readonly logger = new Logger(SqsService.name);
  private readonly sqsClient: SQSClient;
  constructor(@Inject('SQS_QUEUE_URL') private queueUrl: string) {
    this.sqsClient = new SQSClient({
      region: process.env.AWS_REGION,
    });
  }

  async sendMessage(messageBody: any): Promise<boolean> {
    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(messageBody),
    });

    this.logger.log(`Sending message to SQS Queue: ${this.queueUrl}`);

    try {
      await this.sqsClient.send(command);
      this.logger.log('Message sent to SQS queue');
      return messageBody;
    } catch (error) {
      this.logger.error('Error sending message to SQS queue:', error);
      throw new BadRequestException('Failed to send message to SQS');
    }
  }
}
