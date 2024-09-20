import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

const mockUserDTO = {
  id: 'id238ujndm284ye78wdu82',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  dob: '1990-01-01',
  status: 'active',
};
const mockUpdateUserDTO: UpdateUserDto = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
};
describe('UserService', () => {
  let userService;
  const mockUserService = {
    getUserDetailsById: jest.fn(),
    checkUserStatus: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: 'SQS_QUEUE_URL',
          useValue: 'mockQueueUrl',
        },
        {
          provide: 'sqsClient',
          useValue: {
            getUserDetailsById: jest.fn(),
            checkUserStatus: jest.fn(),
            createUser: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user and return the created user', async () => {
      userService.checkUserStatus.mockResolvedValue(
        'Failed to check user status',
      ); // User does not exist
      userService.createUser.mockResolvedValue('user created');

      const result = await userService.createUser(mockUserDTO);

      expect(result).toEqual('user created');
      expect(userService.createUser).toHaveBeenCalledWith(mockUserDTO);
    });
  });
  it('should warn that the user already exist', async () => {
    userService.checkUserStatus.mockResolvedValue('User Exists');
    userService.createUser.mockResolvedValue('User Exists');

    const result = await userService.createUser(mockUserDTO);

    expect(result).toEqual('User Exists');
    expect(userService.createUser).not.toHaveBeenCalled();
  });
  describe('updateUser', () => {
    it('should update user details and return the updated user', async () => {
      mockUserService.updateUser.mockResolvedValue('user updated');

      const result = await userService.updateUser(
        mockUserDTO.id,
        mockUpdateUserDTO,
      );

      expect(result).toEqual('user updated');
      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        mockUserDTO.id,
        mockUpdateUserDTO,
      );
    });

    it('should return an error if the user does not exist during update', async () => {
      mockUserService.updateUser.mockResolvedValue(null);

      const result = await userService.updateUser(
        mockUserDTO.id,
        mockUpdateUserDTO,
      );

      expect(result).toBeNull();
      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        mockUserDTO.id,
        mockUpdateUserDTO,
      );
    });
  });
  describe('checkUserStatus', () => {
    it('should return "User Exists" if user is found', async () => {
      mockUserService.checkUserStatus.mockResolvedValue('User Exists');

      const result = await userService.checkUserStatus({
        email: mockUserDTO.email,
        dob: mockUserDTO.dob,
      });

      expect(result).toEqual('User Exists');
      expect(mockUserService.checkUserStatus).toHaveBeenCalledWith({
        email: mockUserDTO.email,
        dob: mockUserDTO.dob,
      });
    });

    it('should return null if user is not found', async () => {
      mockUserService.checkUserStatus.mockResolvedValue(null);

      const result = await userService.checkUserStatus({
        email: mockUserDTO.email,
        dob: mockUserDTO.dob,
      });

      expect(result).toBeNull();
      expect(mockUserService.checkUserStatus).toHaveBeenCalledWith({
        email: mockUserDTO.email,
        dob: mockUserDTO.dob,
      });
    });
  });

  describe('getUserDetailsById', () => {
    it('should return user details if user is found', async () => {
      mockUserService.getUserDetailsById.mockResolvedValue(mockUserDTO);

      const result = await userService.getUserDetailsById(mockUserDTO.id);

      expect(result).toEqual(mockUserDTO);
      expect(mockUserService.getUserDetailsById).toHaveBeenCalledWith(
        mockUserDTO.id,
      );
    });

    it('should return null if user is not found', async () => {
      mockUserService.getUserDetailsById.mockResolvedValue(null);

      const result = await userService.getUserDetailsById(mockUserDTO.id);

      expect(result).toBeNull();
      expect(mockUserService.getUserDetailsById).toHaveBeenCalledWith(
        mockUserDTO.id,
      );
    });
  });
});
