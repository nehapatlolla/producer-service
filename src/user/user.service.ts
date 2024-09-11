import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { CreateUserDto } from './dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { CheckUserStatusDto } from './dto/check-user-status.dto';
import {
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';

@Injectable()
export class UserService {
  private readonly sqsClient: SQSClient;
  private readonly dynamoDBClient: DynamoDBClient;
  private readonly queueUrl: string;
  private readonly tableName: string;
  private readonly IndexName: string;
  private readonly logger = new Logger(UserService.name);

  constructor() {
    this.sqsClient = new SQSClient({
      region: process.env.AWS_REGION,
      // endpoint: process.env.SQS_ENDPOINT,
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

  async checkUserStatus(CheckUserStatusDto: CheckUserStatusDto) {
    const { email, dob } = CheckUserStatusDto;
    if (!email || !dob) {
      throw new BadRequestException(
        'Both email and date of birth must be provided.',
      );
    }
    try {
      const commandInput: QueryCommandInput = {
        TableName: this.tableName,
        IndexName: this.IndexName,
        KeyConditionExpression: 'email = :email AND dob = :dob',

        ExpressionAttributeValues: {
          ':email': { S: email },
          ':dob': { S: dob },
        },
      };
      this.logger.debug('Query Command Input:', commandInput);
      const command = new QueryCommand(commandInput);
      const response = await this.dynamoDBClient.send(command);
      this.logger.debug('Query Command Response:', response);
      if (response.Items && response.Items.length > 0) {
        const user = response.Items[0];
        const id = user.id.S;
        const status = user.status.S;
        return { id, status };
      } else {
        throw new NotFoundException(
          `User with email ${email} and DOB ${dob} not found`,
        );
      }
    } catch (error) {
      this.logger.error('Error checking user status:', error);
      throw new BadRequestException('Failed to retrieve user status');
    }
  }
}
