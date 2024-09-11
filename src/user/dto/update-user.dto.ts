import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsString } from 'class-validator';
import { UpdateDateColumn } from 'typeorm';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ description: 'ID of the user to update', example: '1234' })
  @IsString()
  readonly id: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
