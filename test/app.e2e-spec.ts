import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateArticleDto, EditArticleDto } from 'src/article/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'muneer123@gmail.com',
      password: '123',
    };

    describe('Signup', () => {
      it('Should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('Should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('Should throw if body provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });

      it('Should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('Should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('Should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('Should throw if body provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      it('Should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAT', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('Should get current user ', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      const dto: EditUserDto = {
        firstName: 'muneer',
        email: 'muneer@test.com',
        lastName: 'Khan',
      };

      it('Should edit user ', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email)
          .expectBodyContains(dto.lastName);
      });
    });
  });

  describe('Article', () => {
    describe('Get empty articles', () => {
      it('Should get articles', () => {
        return pactum
          .spec()
          .get('/article')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create article', () => {
      const dto: CreateArticleDto = {
        title: 'First article',
        body: 'my test article body',
      };

      it('Should create article', () => {
        return pactum
          .spec()
          .post('/article')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('articleId', 'id');
      });
    });

    describe('Get articles', () => {
      it('Should get articles', () => {
        return pactum
          .spec()
          .get('/article')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get article by id', () => {
      it('Should get article by id', () => {
        return pactum
          .spec()
          .get('/article/{id}')
          .withPathParams('id', '$S{articleId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{articleId}');
      });
    });

    describe('Edit article by id', () => {
      const dto: EditArticleDto = {
        title: 'test title',
        body: 'test description',
      };

      it('Should edit article by id', () => {
        return pactum
          .spec()
          .patch('/article/{id}')
          .withPathParams('id', '$S{articleId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.body);
      });
    });

    describe('Delete article by id', () => {
      it('Should delete article by id', () => {
        return pactum
          .spec()
          .delete('/article/{id}')
          .withPathParams('id', '$S{articleId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAT}',
          })
          .expectStatus(204);
      });
    });

    it('Should get articles', () => {
      return pactum
        .spec()
        .get('/article')
        .withHeaders({
          Authorization: 'Bearer $S{userAT}',
        })
        .expectStatus(200)
        .expectJsonLength(0);
    });
  });
});
