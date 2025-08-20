import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, MinLength, Matches, ArrayMinSize } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'john_doe' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message: 'Password must contain at least 1 number and 1 special character',
  })
  password: string;

  @ApiProperty({ example: ['coffee-shop', 'book-store', 'tech-gadgets'] })
  @IsArray()
  @ArrayMinSize(3, { message: 'At least 3 unique shop names are required' })
  @IsString({ each: true })
  shopNames: string[];
}
