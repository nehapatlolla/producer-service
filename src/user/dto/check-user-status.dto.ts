import { IsEmail, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckUserStatusDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The date of birth of the user',
    example: '1990-01-01',
  })
  @IsDateString()
  dob: string;
}
