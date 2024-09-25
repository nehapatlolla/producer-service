import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';

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
  dob: '2009-09-09',
};

describe('UserController', () => {
  let userController: UserController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userService: UserService;
  const mockUserService = {
    createUser: jest.fn(),
    updateUser: jest.fn(),
    checkUserStatus: jest.fn(),
    getUserDetailsById: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();
    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user and return the result', async () => {
      mockUserService.createUser.mockResolvedValue('user created');
      const result = await userController.createUser(mockUserDTO);
      expect(result).toEqual('user created');
      expect(mockUserService.createUser).toHaveBeenCalledWith(mockUserDTO);
    });

    it('should return a message if the user already exists', async () => {
      mockUserService.createUser.mockResolvedValue('User Exists');
      const result = await userController.createUser(mockUserDTO);
      expect(result).toEqual('User Exists');
      expect(mockUserService.createUser).toHaveBeenCalledWith(mockUserDTO);
    });
  });

  describe('updateUser', () => {
    it('should update user details and return the result', async () => {
      mockUserService.updateUser.mockResolvedValue('user updated');

      const result = await userController.updateUser(
        mockUserDTO.id,
        mockUpdateUserDTO,
      );

      expect(result).toEqual('user updated');
      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        mockUserDTO.id,
        mockUpdateUserDTO,
      );
    });

    it('should return null if the user does not exist during update', async () => {
      mockUserService.updateUser.mockResolvedValue(null);
      const result = await userController.updateUser(
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
      const result = await userController.checkUserStatus({
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
      const result = await userController.checkUserStatus({
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
      const result = await userController.getUserDetailsById(mockUserDTO.id);
      expect(result).toEqual(mockUserDTO);
      expect(mockUserService.getUserDetailsById).toHaveBeenCalledWith(
        mockUserDTO.id,
      );
    });

    it('should return null if user is not found', async () => {
      mockUserService.getUserDetailsById.mockResolvedValue(null);
      const result = await userController.getUserDetailsById(mockUserDTO.id);
      expect(result).toBeNull();
      expect(mockUserService.getUserDetailsById).toHaveBeenCalledWith(
        mockUserDTO.id,
      );
    });
  });
});
