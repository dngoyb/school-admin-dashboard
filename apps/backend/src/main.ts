import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Enable validation
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, // Strip properties that don't have decorators
			transform: true, // Transform payloads to DTO instances
			forbidNonWhitelisted: true, // Throw errors if non-whitelisted properties are present
		})
	);

	// Enable CORS
	app.enableCors();

	// Setup Swagger
	const config = new DocumentBuilder()
		.setTitle('School Admin Dashboard API')
		.setDescription('The School Admin Dashboard API documentation')
		.setVersion('1.0')
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/docs', app, document);

	// Start the server
	const port = process.env.PORT || 3000;
	await app.listen(port);
	console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
