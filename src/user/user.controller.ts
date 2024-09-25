import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { CheckUserStatusDto } from './dto/check-user-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  logger: any;
  constructor(private readonly userService: UserService) {}

  @Post('create-User')
  @ApiResponse({
    status: 201,
    description: 'User successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation failed.',
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.createUser(createUserDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('user-details/:id')
  @ApiOperation({ summary: 'Update user details' })
  @ApiResponse({
    status: 200,
    description: 'User details successfully updated',
    schema: {
      example: { message: 'Update request sent to queue' },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to send message to queue',
  })
  async updateUser(
    @Param('id') id: string,
    @Body() UpdateUserDto: UpdateUserDto,
  ) {
    await this.userService.updateUser(id, UpdateUserDto);
  }

  @Post('check-user-status')
  async checkUserStatus(@Body() checkUserStatusDto: CheckUserStatusDto) {
    try {
      const result = await this.userService.checkUserStatus(checkUserStatusDto);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('get-user-details/:id')
  async getUserDetailsById(@Param('id') id: string) {
    const result = await this.userService.getUserDetailsById(id);
    return result;
  }

  @Post('block-user/:id')
  @ApiOperation({ summary: 'Block a user by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User successfully blocked',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to block user',
  })
  async blockUser(@Param('id') id: string) {
    try {
      const result = await this.userService.blockUser(id);
      return result;
    } catch (error) {
      this.logger.error('Error in blockUser endpoint:', error);
      throw error;
    }
  }
}
