import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;
  private readonly logger = new Logger(UserService.name);

  constructor() {
    this.sqsClient = new SQSClient({
      region: 'us-east-1',
      endpoint: process.env.SQS_ENDPOINT,
    });
    this.queueUrl = process.env.SQS_QUEUE_URL;
  }

  async createUser(createUserDto: CreateUserDto) {
    const messageBody = {
      operation: 'create',
      user: {
        id: createUserDto.id,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        dob: createUserDto.dob,
        // status: createUserDto.status || 'created',
      },
    };

    try {
      const command = new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(messageBody),
      });

      await this.sqsClient.send(command);
      this.logger.log('Message sent to SQS queue');
      return { message: 'User creation request sent' };
    } catch (error) {
      this.logger.error('Error sending message to SQS queue:', error);
      throw new BadRequestException('Failed to send message to queue');
    }
  }
}
