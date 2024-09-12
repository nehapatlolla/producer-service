import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { CheckUserStatusDto } from './dto/check-user-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDetailsDto } from './dto/user-details.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create-User')
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.createUser(createUserDto);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException('Failed to create user');
    }
  }
  @Get('status')
  async checkUserStatus(@Query() query: CheckUserStatusDto) {
    try {
      // Validate input
      if (!query.email || !query.dob) {
        throw new BadRequestException(
          'Both email and date of birth must be provided.',
        );
      }

      // Call the service method
      const result = await this.userService.checkUserStatus(query);

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException('Failed to retrieve user status');
    }
  }
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() UpdateUserDto: UpdateUserDto,
  ) {
    await this.userService.updateUser(id, UpdateUserDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the user',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'User details successfully retrieved',
    type: UserDetailsDto,
  })
  async getUserDetailsById(@Param('id') id: string): Promise<UserDetailsDto> {
    //try {
    // Call the service method to get user details
    const userDetails = await this.userService.getUserDetailsById(id);

    // Return the user details if found
    return userDetails;
    //}
    // catch (error) {
    //   // Handle specific error scenarios
    //   if (error instanceof NotFoundException) {
    //     throw new NotFoundException(error.message);
    //   }
    //   // Handle other errors
    //   throw new BadRequestException(error.message);
    // }
  }
}
