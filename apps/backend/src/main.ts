import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Role } from '@school-admin/database';

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

	// Enhanced Swagger Configuration
	const config = new DocumentBuilder()
		.setTitle('School Admin Dashboard API')
		.setDescription(
			`
			The School Admin Dashboard API documentation.
			This API provides endpoints for managing schools, users, students, attendance, and more.
			
			## Authentication
			Most endpoints require authentication using JWT Bearer token.
			To authenticate:
			1. Use the /auth/login endpoint to get a token
			2. Include the token in the Authorization header as: Bearer <token>
		`
		)
		.setVersion('1.0')
		.addTag('auth', 'Authentication endpoints')
		.addTag('users', 'User management endpoints')
		.addTag('students', 'Student management endpoints')
		.addTag('attendance', 'Attendance management endpoints')
		.addTag('classes', 'Class management endpoints')
		.addTag('announcements', 'Announcement management endpoints')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
				name: 'JWT',
				description: 'Enter JWT token',
				in: 'header',
			},
			'JWT-auth' // This name here is important for matching up with @ApiBearerAuth() in your controllers
		)
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/docs', app, document, {
		swaggerOptions: {
			persistAuthorization: true, // This will persist the authorization token across page refreshes
			tagsSorter: 'alpha',
			operationsSorter: 'alpha',
		},
	});

	// Start the server with port fallback
	const basePort = parseInt(process.env.PORT || '3000', 10);
	let port = basePort;

	while (port < basePort + 10) {
		// Try up to 10 ports
		try {
			await app.listen(port);
			console.log(`Application is running on: http://localhost:${port}`);
			break;
		} catch (error) {
			if (error.code === 'EADDRINUSE') {
				console.log(`Port ${port} is in use, trying ${port + 1}`);
				port++;
			} else {
				throw error;
			}
		}
	}
}
bootstrap();
