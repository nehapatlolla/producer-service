import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { CheckUserStatusDto } from './dto/check-user-status.dto';

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
}
