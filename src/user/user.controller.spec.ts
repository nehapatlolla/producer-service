import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UserController', () => {
  let userController: UserController;

  const mockUserService = {
    createUser: jest.fn(),
    updateUser: jest.fn(),
    checkUserStatus: jest.fn(),
    getUserDetailsById: jest.fn(),
    blockUser: jest.fn(),
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
  });

  it('should create a user successfully', async () => {
    const createUserDto: CreateUserDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      dob: '1990-01-01',
    };

    mockUserService.createUser.mockResolvedValue({
      message: 'User creation request sent',
    });

    const result = await userController.createUser(createUserDto);
    expect(result).toEqual({ message: 'User creation request sent' });
    expect(mockUserService.createUser).toHaveBeenCalledWith(createUserDto);
  });

  // it('should handle BadRequestException when creating a user', async () => {
  //   const createUserDto: CreateUserDto = {
  //     firstName: 'John',
  //     lastName: 'Doe',
  //     email: 'john.doe@example.com',
  //     dob: '1990-01-01',
  //   };

  //   mockUserService.createUser.mockRejectedValue(
  //     new BadRequestException('Error message'),
  //   );

  //   await expect(userController.createUser(createUserDto)).rejects.toThrow(
  //     BadRequestException,
  //   );
  // });

  // it('should update a user successfully', async () => {
  //   const id = 'some-user-id';
  //   const updateUserDto: UpdateUserDto = {
  //     firstName: 'Jane',
  //     lastName: 'Doe',
  //   };

  //   mockUserService.updateUser.mockResolvedValue({
  //     message: 'User update request sent',
  //   });

  //   await userController.updateUser(id, updateUserDto);
  //   expect(mockUserService.updateUser).toHaveBeenCalledWith(id, updateUserDto);
  // });

  // it('should check user status successfully', async () => {
  //   const checkUserStatusDto = {
  //     email: 'john.doe@example.com',
  //     dob: '1990-01-01',
  //   };
  //   mockUserService.checkUserStatus.mockResolvedValue({ id: 'some-user-id' });

  //   const result = await userController.checkUserStatus(checkUserStatusDto);
  //   expect(result).toEqual({ id: 'some-user-id' });
  //   expect(mockUserService.checkUserStatus).toHaveBeenCalledWith(
  //     checkUserStatusDto,
  //   );
  // });

  // it('should get user details by ID successfully', async () => {
  //   const userId = 'some-user-id';
  //   mockUserService.getUserDetailsById.mockResolvedValue({
  //     id: userId,
  //     name: 'John Doe',
  //   });

  //   const result = await userController.getgetUserDetailsById(userId);
  //   expect(result).toEqual({ id: userId, name: 'John Doe' });
  //   expect(mockUserService.getUserDetailsById).toHaveBeenCalledWith(userId);
  // });

  // it('should block a user successfully', async () => {
  //   const userId = 'some-user-id';
  //   mockUserService.blockUser.mockResolvedValue({
  //     message: 'User successfully blocked',
  //   });

  //   const result = await userController.blockUser(userId);
  //   expect(result).toEqual({ message: 'User successfully blocked' });
  //   expect(mockUserService.blockUser).toHaveBeenCalledWith(userId);
  // });

  // it('should handle errors when blocking a user', async () => {
  //   const userId = 'some-user-id';
  //   mockUserService.blockUser.mockRejectedValue(
  //     new BadRequestException('Error blocking user'),
  //   );

  //   await expect(userController.blockUser(userId)).rejects.toThrow(
  //     BadRequestException,
  //   );
  // });
});
