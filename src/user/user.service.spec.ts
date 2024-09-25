import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { SQSClient } from '@aws-sdk/client-sqs';
import { CreateUserDto } from './dto/create-user.dto';
import axios, { AxiosResponse } from 'axios';
import { BadRequestException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { SqsService } from './sqs.service';

jest.mock('@aws-sdk/client-sqs');
jest.mock('axios');

const mockUserDTO = {
  id: 'id238ujndm284ye78wdu82',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  dob: '1990-01-01',
  status: 'active',
};

describe('UserService', () => {
  let userService: UserService;
  let mockSqsClient: SQSClient;
  let mockConsumerServiceUrl: string;
  let mockSqsService: Partial<SqsService>;

  beforeEach(async () => {
    mockSqsClient = {
      send: jest.fn().mockResolvedValue({}),
    } as unknown as SQSClient;
    mockSqsService = {
      sendMessage: jest.fn().mockResolvedValue(true),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'SQS_QUEUE_URL',
          useValue: process.env.SQS_QUEUE_URL,
        },
        {
          provide: SQSClient,
          useValue: mockSqsClient,
        },
        {
          provide: 'CONSUMER_SERVICE_URL',
          useValue: process.env.CONSUMR_SERVICE_URL,
        },
        { provide: SqsService, useValue: mockSqsService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('should throw a BadRequestException if SQS fails', async () => {
      mockSqsService.sendMessage = jest
        .fn()
        .mockRejectedValue(new Error('SQS Error'));

      const createUserDto: CreateUserDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        dob: '1992-01-01',
      };

      await expect(userService.createUser(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should send a message to SQS to create a user', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        dob: '1990-01-01',
      };

      const result = await userService.createUser(createUserDto);

      expect(result).toBe(true);
      expect(mockSqsService.sendMessage).toHaveBeenCalled();
      expect(mockSqsService.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'create',
          user: expect.objectContaining({
            createdAt: expect.any(String),
            dob: createUserDto.dob,
            email: createUserDto.email,
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            status: 'created',
          }),
        }),
      );
    });
  });

  describe('updateUser', () => {
    it('should throw an error if the user is blocked', async () => {
      const userId = 'id238ujndm284ye78wdu82';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        dob: '2009-09-09',
      };

      jest
        .spyOn(userService, 'checkUserStatus')
        .mockResolvedValue({ status: 'blocked' });

      await expect(
        userService.updateUser(userId, updateUserDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        userService.updateUser(userId, updateUserDto),
      ).rejects.toThrow('User is blocked and cannot be updated.');
    });

    it('should send an update message to SQS', async () => {
      const userId = 'id238ujndm284ye78wdu82';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        dob: '2009-09-09',
      };

      const result = await userService.updateUser(
        mockUserDTO.id,
        updateUserDto,
      );

      expect(result).toBe(true);
      expect(mockSqsService.sendMessage).toHaveBeenCalled();
      expect(mockSqsService.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          operation: 'update',
          user: expect.objectContaining({
            id: userId,
            firstName: updateUserDto.firstName,
            lastName: updateUserDto.lastName,
            email: updateUserDto.email,
            dob: updateUserDto.dob,
            status: 'Updated',
          }),
          resultUrl: expect.any(String),
        }),
      );
    });
  });
  describe('blockUser', () => {
    it('should successfully block a user and return the response data', async () => {
      const userId = 'userId123';
      const mockResponse = { data: { message: 'User blocked successfully' } };

      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await userService.blockUser(userId);

      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalledWith(
        `${mockConsumerServiceUrl}/consumer-service/block-user/${userId}`,
      );
    });

    it('should throw an error when blocking a user fails', async () => {
      const userId = 'userId123';
      const mockError = new Error('Network error');

      (axios.post as jest.Mock).mockRejectedValue(mockError);
      // axios.post = jest.fn().mockRejectedValue(mockError);

      await expect(userService.blockUser(userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
  describe('getUserDetailsById', () => {
    it('should return user details by ID', async () => {
      const userId = 'id238ujndm284ye78wdu82';
      const mockResponse = {
        data: { id: userId, firstName: 'John', lastName: 'Doe' },
      };

      (axios.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await userService.getUserDetailsById(userId);

      expect(result).toEqual(mockResponse.data);
      expect(axios.get).toHaveBeenCalledWith(
        `${mockConsumerServiceUrl}/consumer-service/get-user-details/${userId}`,
      );
    });

    it('should return an error message if getting user details fails', async () => {
      const userId = 'id238ujndm284ye78wdu82';
      const mockError = new Error('Network error');

      (axios.get as jest.Mock).mockRejectedValue(mockError);

      const result = await userService.getUserDetailsById(userId);

      expect(result).toEqual(false);
    });
  });

  describe('checkUserStatus', () => {
    it('should return user status if user exists', async () => {
      const checkUserStatusDto = {
        email: 'john.doe@example.com',
        dob: '1990-01-01',
      };
      const mockResponse: AxiosResponse = {
        data: { id: 'userId123', status: 'active' },
      } as AxiosResponse;

      (axios.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await userService.checkUserStatus(checkUserStatusDto);

      expect(result).toEqual(mockResponse.data);
      expect(axios.post).toHaveBeenCalledWith(
        `${mockConsumerServiceUrl}/consumer-service/status`,
        checkUserStatusDto,
      );
    });

    it('should return an error message if checking user status fails', async () => {
      const checkUserStatusDto = {
        email: 'john.doe@example.com',
        dob: '1990-01-01',
      };
      const mockError = new Error('Network error');

      (axios.post as jest.Mock).mockRejectedValue(mockError);

      const result = await userService.checkUserStatus(checkUserStatusDto);

      expect(result).toEqual(false);
    });
  });
});
