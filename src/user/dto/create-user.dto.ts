import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  dob: string;

  // @ApiProperty({
  //   description: 'Status of the user',
  //   example: 'created',
  //   enum: ['created', 'updated', 'blocked'],
  // })
  // @IsString()
  // readonly status?: string; // Status is optional and defaults to 'created'

  // @CreateDateColumn()
  // createdAt: Date;
}
