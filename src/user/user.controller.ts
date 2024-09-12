import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { CheckUserStatusDto } from './dto/check-user-status.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() UpdateUserDto: UpdateUserDto,
  ) {
    await this.userService.updateUser(id, UpdateUserDto);
  }

  //@Get(':id')
  // @ApiOperation({ summary: 'Get user details by ID' })
  // @ApiParam({
  //   name: 'id',
  //   description: 'The unique identifier of the user',
  //   example: '1',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'User details successfully retrieved',
  //   type: UserDetailsDto,
  // })
  // async getUserDetailsById(@Param('id') id: string): Promise<UserDetailsDto> {
  //   const userDetails = await this.userService.getUserDetailsById(id);

  //   return userDetails;
  // }
  @Post('check-status')
  async checkUserStatus(@Body() checkUserStatusDto: CheckUserStatusDto) {
    try {
      const result = await this.userService.checkUserStatus(checkUserStatusDto);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  async getgetUserDetailsById(@Param('id') id: string) {
    const result = await this.userService.getUserDetailsById(id);
    return result;
  }
}
