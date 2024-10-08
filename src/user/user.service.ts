import {
  Injectable,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { CreateUserDto } from './dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from './dto/update-user.dto';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class UserService {
  sendMessageUpdate() {
    throw new Error('Method not implemented.');
  }
  private readonly consumerServiceUrl: string;
  private readonly sqsClient: SQSClient;
  // private readonly queueUrl: string;
  private readonly logger = new Logger(UserService.name);
  producerServiceUrl: string;
  static checkUserStatus: jest.Mock<any, any, any>;

  constructor(@Inject('SQS_QUEUE_URL') private queueUrl: string) {
    this.sqsClient = new SQSClient({
      region: process.env.AWS_REGION,
    });
    this.queueUrl = process.env.SQS_QUEUE_URL;
    this.consumerServiceUrl = process.env.CONSUMR_SERVICE_URL;
    this.producerServiceUrl = process.env.PRODUCER_SERVICE_URL;
  }

  async createUser(createUserDto: CreateUserDto) {
    const { email, dob } = createUserDto;

    this.logger.log(`Creating user with email: ${email} and dob: ${dob}`);

    if (!email || !dob) {
      throw new BadRequestException(
        'Email and date of birth must be provided.',
      );
    }

    try {
      const existingUserStatus = await this.checkUserStatus({ email, dob });
      this.logger.log(`Existing User Status: ${existingUserStatus}`);

      if (existingUserStatus == 'Failed to check user status') {
        const id = uuidv4();

        const messageBody = {
          operation: 'create',
          user: {
            id,
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            email: createUserDto.email,
            dob: createUserDto.dob,
            status: 'created',
            createdAt: new Date().toISOString(),
          },
        };

        const command = new SendMessageCommand({
          QueueUrl: this.queueUrl,
          MessageBody: JSON.stringify(messageBody),
        });

        this.logger.log(`Sending message to SQS Queue: ${this.queueUrl}`);
        await this.sqsClient.send(command);
        this.logger.log('User creation request sent to SQS queue');

        return { message: 'User creation request sent' };
      } else {
        this.logger.warn(`User with email ${email} already exists.`);
        return { message: `User with email ${email} already exists.` };
      }
    } catch (error) {
      this.logger.error(
        'Error sending user creation request to SQS queue:',
        error,
      );
      throw new BadRequestException('Failed to send user creation request');
    }
  }

  async updateUser(id: string, UpdateUserDto: UpdateUserDto) {
    const status = 'Updated';
    const userStatus = await this.checkUserStatus({
      email: UpdateUserDto.email,
      dob: UpdateUserDto.dob,
    });

    if (userStatus && userStatus.status === 'blocked') {
      throw new BadRequestException('User is blocked and cannot be updated.');
    }
    const messageBody = {
      operation: 'update',
      user: {
        id,
        status,
        ...UpdateUserDto,
        // updatedAt: new Date().toISOString(),
      },
      resultUrl: `${this.producerServiceUrl}/updates/result`,
    };
    try {
      const command = new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(messageBody),
      });
      await this.sqsClient.send(command);
      this.logger.log('Update Message sent to SQS');
      return { messgae: 'User update request sent' };
    } catch (error) {
      this.logger.error('Error sending message to SQS queue:', error);
      return `Error sending message to SQS queue`;
    }
  }

  async blockUser(id: string): Promise<AxiosResponse<any>> {
    try {
      const response = await axios.post(
        `${this.consumerServiceUrl}/check-status/block/${id}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error sending block request:', error);
      throw new BadRequestException('Failed to block user');
    }
  }

  async getUserDetailsById(userId: string) {
    try {
      const response = await axios.get(
        `${this.consumerServiceUrl}/check-status/details/${userId}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error getting  user details:', error);
      return `Failed to get user details`;
    }
  }

  async checkUserStatus(checkUserStatusDto: { email: string; dob: string }) {
    try {
      const response = await axios.post(
        // I am making a HTTP request to the consumer service
        `${this.consumerServiceUrl}/check-status/status`,
        checkUserStatusDto,
      );
      if (response.data && response.data.id) {
        return response.data; // User exists
      }
    } catch (error) {
      this.logger.error('Error checking user status:', error);
      return `Failed to check user status`;
    }
  }
}
