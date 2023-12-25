import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateArticleDto, EditArticleDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}

  getArticles(userId: number) {
    return this.prisma.article.findMany({
      where: {
        userId,
      },
    });
  }

  getArticleById(userId: number, articleId: number) {
    return this.prisma.article.findFirst({
      where: {
        id: articleId,
        userId,
      },
    });
  }

  async createArticle(userId: number, dto: CreateArticleDto) {
    const slug = dto.title.split(' ').join('-');

    const article = await this.prisma.article.create({
      data: {
        userId,
        ...dto,
        slug,
      },
    });

    return article;
  }

  async editArticleById(
    userId: number,
    articleId: number,
    dto: EditArticleDto,
  ) {
    let slug: string;

    const article = await this.prisma.article.findUnique({
      where: {
        id: articleId,
      },
    });

    if (!article || article.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }

    if (dto.title) slug = dto.title.split(' ').join('-');

    return this.prisma.article.update({
      where: {
        id: articleId,
      },
      data: {
        ...dto,
        ...(slug && { slug }),
      },
    });
  }

  async deleteArticleById(userId: number, articleId: number) {
    const article = await this.prisma.article.findUnique({
      where: {
        id: articleId,
      },
    });
    if (!article || article.userId !== userId) {
      throw new ForbiddenException('Access to resource denied');
    }

    await this.prisma.article.delete({
      where: {
        id: articleId,
      },
    });
  }
}
