// src/user/dto/user-details.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class UserDetailsDto {
  @ApiProperty({
    description: 'The unique identifier for the user',
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The date of birth of the user',
    example: '1990-01-01',
  })
  dob: string;

  @ApiProperty({
    description: 'The status of the user',
    example: 'created',
  })
  status: string;
}
