import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { CreateUserDto } from './dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';

import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { UpdateUserDto } from './dto/update-user.dto';
import axios from 'axios';

@Injectable()
export class UserService {
  private readonly consumerServiceUrl = 'http://localhost:3002';
  private readonly sqsClient: SQSClient;
  private readonly dynamoDBClient: DynamoDBClient;
  private readonly queueUrl: string;
  private readonly tableName: string;
  private readonly IndexName: string;
  private readonly logger = new Logger(UserService.name);

  constructor() {
    this.sqsClient = new SQSClient({
      region: process.env.AWS_REGION,
    });
    this.queueUrl = process.env.SQS_QUEUE_URL;
    this.tableName = process.env.TABLE_NAME;
    this.IndexName = process.env.INDEX_NAME;
    this.dynamoDBClient = new DynamoDBClient({
      region: process.env.AWS_REGION,
    });
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

  async getUserDetailsById(userId: string) {
    if (!userId) {
      throw new BadRequestException('Id must be provided');
    }
    try {
      const commandInput: GetItemCommandInput = {
        TableName: this.tableName,
        Key: { id: { S: userId } },
      };
      const command = new GetItemCommand(commandInput);
      const response = await this.dynamoDBClient.send(command);

      this.logger.debug('DynamoDB Response:', JSON.stringify(response));

      if (!response.Item) {
        throw new NotFoundException(`User with ID ${userId} not found.`);
      }

      const item = response.Item;
      const user = {
        id: item.id?.S,
        firstName: item.firstName?.S,
        lastName: item.lastName?.S,
        email: item.email?.S,
        dob: item.dob?.S,
        status: item.status?.S,
      };
      // Log extracted user data
      this.logger.debug('Extracted User:', JSON.stringify(user));

      if (
        !user.id ||
        !user.firstName ||
        !user.lastName ||
        !user.email ||
        !user.dob ||
        !user.status
      ) {
        throw new BadRequestException('User data is incomplete.');
      }
      return user;
    } catch (error) {
      this.logger.log('Error while retrieving the user through id', error);
      throw new BadRequestException('Failed to retrieve the user');
    }
  }
  async checkUserStatus(checkUserStatusDto: { email: string; dob: string }) {
    try {
      const response = await axios.post(
        // I am making a HTTP request to the consumer service
        `${this.consumerServiceUrl}/check-status`,
        checkUserStatusDto,
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error checking user status:', error);
      throw new BadRequestException('Failed to check user status');
    }
  }
}
