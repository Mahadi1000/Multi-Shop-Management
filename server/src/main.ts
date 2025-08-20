import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import * as csurf from "csurf";
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middlewares
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    })
  );

  app.use(cookieParser());

  // CSRF Protection (disable for development/testing - enable in production)
  if (process.env.NODE_ENV === "production") {
    app.use(
      csurf({
        cookie: {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          domain: ".localhost",
        },
      })
    );
  }

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // CORS configuration
  app.enableCors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://localhost:3001",
      /^https?:\/\/[\w-]+\.localhost(:\d+)?$/, // Allow subdomains
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Shop Management API")
    .setDescription("Backend API for shop management with authentication")
    .setVersion("1.0")
    .addCookieAuth("jwt")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();
