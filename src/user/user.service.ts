import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { CreateUserDto } from './dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from './dto/update-user.dto';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class UserService {
  private readonly consumerServiceUrl: string;
  private readonly sqsClient: SQSClient;

  private readonly queueUrl: string;

  private readonly logger = new Logger(UserService.name);

  constructor() {
    this.sqsClient = new SQSClient({
      region: process.env.AWS_REGION,
    });
    this.queueUrl = process.env.SQS_QUEUE_URL;

    this.consumerServiceUrl = process.env.CONSUMR_SERVICE_URL;
  }

  async createUser(createUserDto: CreateUserDto) {
    const id = uuidv4();
    const messageBody = {
      operation: 'create',
      user: {
        id,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        dob: createUserDto.dob,
        status: createUserDto.status || 'created',
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

  async updateUser(id: string, UpdateUserDto: UpdateUserDto) {
    const messageBody = {
      operation: 'update',
      user: {
        id,
        ...UpdateUserDto,
      },
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
      throw new BadRequestException('Failed to send message to queue');
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
      this.logger.error('Error checking user status:', error);
      throw new BadRequestException('Failed to check user status');
    }
  }

  async checkUserStatus(checkUserStatusDto: { email: string; dob: string }) {
    try {
      const response = await axios.post(
        // I am making a HTTP request to the consumer service
        `${this.consumerServiceUrl}/check-status/status`,
        checkUserStatusDto,
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error checking user status:', error);
      throw new BadRequestException('Failed to check user status');
    }
  }
}
