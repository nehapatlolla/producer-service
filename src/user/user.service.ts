import {
  Injectable,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { SQSClient } from '@aws-sdk/client-sqs';
import { CreateUserDto } from './dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from './dto/update-user.dto';
import axios, { AxiosResponse } from 'axios';
import { SqsService } from './sqs.service';

@Injectable()
export class UserService {
  private readonly consumerServiceUrl: string;
  private readonly sqsClient: SQSClient;

  private readonly logger = new Logger(UserService.name);
  producerServiceUrl: string;
  static checkUserStatus: jest.Mock<any, any, any>;

  constructor(
    @Inject('SQS_QUEUE_URL') private queueUrl: string,
    private readonly sqsService: SqsService,
  ) {
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

      if (existingUserStatus == false) {
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

        const result = await this.sqsService.sendMessage(messageBody);
        this.logger.log('User creation request sent to SQS queue');
        return result;
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
      },
      resultUrl: `${this.producerServiceUrl}/updates/result`,
    };
    try {
      await this.sqsService.sendMessage(messageBody);
      this.logger.log('User update request sent to SQS queue');
      return true;
    } catch (error) {
      this.logger.error('Error sending message to SQS queue:', error);
      return false;
    }
  }

  async blockUser(id: string): Promise<AxiosResponse<any>> {
    try {
      const response = await axios.post(
        `${this.consumerServiceUrl}/consumer-service/block-user/${id}`,
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
        `${this.consumerServiceUrl}/consumer-service/get-user-details/${userId}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error('Error getting  user details:', error);
      return false;
    }
  }

  async checkUserStatus(checkUserStatusDto: { email: string; dob: string }) {
    try {
      const response = await axios.post(
        // I am making a HTTP request to the consumer service
        `${this.consumerServiceUrl}/consumer-service/status`,
        checkUserStatusDto,
      );
      if (response.data && response.data.id) {
        return response.data;
      }
    } catch (error) {
      this.logger.error('Error checking user status:', error);
      return false;
    }
  }
}
