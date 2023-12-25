import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { ArticleService } from './article.service';
import { GetUser } from '../auth/decorator';
import { CreateArticleDto, EditArticleDto } from './dto';

@UseGuards(JwtGuard)
@Controller('article')
export class ArticleController {
  constructor(private articleService: ArticleService) {}

  @Get()
  getArticles(@GetUser('id') userId: number) {
    return this.articleService.getArticles(userId);
  }

  @Get(':id')
  getArticleById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) ArticleId: number,
  ) {
    return this.articleService.getArticleById(userId, ArticleId);
  }

  @Post()
  createArticle(@GetUser('id') userId: number, @Body() dto: CreateArticleDto) {
    return this.articleService.createArticle(userId, dto);
  }

  @Patch(':id')
  editArticleById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) ArticleId: number,
    @Body() dto: EditArticleDto,
  ) {
    return this.articleService.editArticleById(userId, ArticleId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteArticleById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) ArticleId: number,
  ) {
    return this.articleService.deleteArticleById(userId, ArticleId);
  }
}
