import { IsOptional, IsString } from 'class-validator';

export class EditArticleDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  body: string;
}
