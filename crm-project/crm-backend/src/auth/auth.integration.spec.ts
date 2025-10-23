import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthService } from './auth.service';
import { User } from '../models/user.model';
import * as bcrypt from 'bcrypt';

/**
 * Integration tests for Auth service
 * These tests use a real database connection and do NOT mock dependencies
 */
describe('AuthService Integration Tests', () => {
  let service: AuthService;
  let module: TestingModule;

  beforeAll(async () => {
    // Set JWT_SECRET for testing
    process.env.JWT_SECRET = 'test-integration-secret';

    // Load database credentials from environment
    const dbUsername = process.env.DB_USERNAME || 'saneelb';
    const dbPassword = process.env.DB_PASSWORD || '';

    module = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot({
          dialect: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: dbUsername,
          password: dbPassword,
          database: process.env.DB_NAME || 'crm_db',
          models: [User],
          autoLoadModels: true,
          synchronize: true,
          logging: false, // Disable logging for tests
        }),
        SequelizeModule.forFeature([User]),
      ],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: (payload: any) => `jwt-${payload.sub}-${payload.email}`,
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Clean up any existing test data
    await User.destroy({ where: { email: 'integration@example.com' } });
  });

  afterAll(async () => {
    // Clean up test data
    await User.destroy({ where: { email: 'integration@example.com' } });
    await module.close();
  });

  afterEach(async () => {
    // Clean up test data after each test
    await User.destroy({ where: { email: 'integration@example.com' } });
  });

  it('integration: full register and login flow', async () => {
    // Step 1: Register a new user
    const registerResult = await service.register(
      'integration@example.com',
      'password123',
      'Integration',
      'Test',
    );

    // Verify registration result
    expect(registerResult).toBeDefined();
    expect(registerResult.token).toBeDefined();
    expect(registerResult.user).toBeDefined();
    expect(registerResult.user.email).toBe('integration@example.com');
    expect(registerResult.user.firstName).toBe('Integration');
    expect(registerResult.user.lastName).toBe('Test');
    expect(registerResult.user.id).toBeDefined();

    // Step 2: Verify user exists in database
    const userInDb = await User.findOne({
      where: { email: 'integration@example.com' },
    });

    expect(userInDb).toBeDefined();
    expect(userInDb.email).toBe('integration@example.com');
    expect(userInDb.firstName).toBe('Integration');
    expect(userInDb.passwordHash).toBeDefined();
    expect(userInDb.passwordHash).not.toBe('password123'); // Should be hashed

    // Verify password is properly hashed
    const isPasswordValid = await bcrypt.compare(
      'password123',
      userInDb.passwordHash,
    );
    expect(isPasswordValid).toBe(true);

    // Step 3: Login with the same credentials
    const loginResult = await service.login(
      'integration@example.com',
      'password123',
    );

    // Verify login result
    expect(loginResult).toBeDefined();
    expect(loginResult.token).toBeDefined();
    expect(loginResult.user).toBeDefined();
    expect(loginResult.user.email).toBe('integration@example.com');
    expect(loginResult.user.id).toBe(userInDb.id);

    // Step 4: Verify JWT token structure
    expect(loginResult.token).toContain(userInDb.id);
    expect(loginResult.token).toContain('integration@example.com');
  });

  it('integration: register with duplicate email should fail', async () => {
    // Register first user
    await service.register(
      'integration@example.com',
      'password123',
      'Integration',
      'Test',
    );

    // Try to register with same email
    await expect(
      service.register(
        'integration@example.com',
        'password456',
        'Another',
        'User',
      ),
    ).rejects.toThrow('Email already exists');
  });

  it('integration: login with wrong password should fail', async () => {
    // Register user
    await service.register(
      'integration@example.com',
      'password123',
      'Integration',
      'Test',
    );

    // Try to login with wrong password
    await expect(
      service.login('integration@example.com', 'wrong-password'),
    ).rejects.toThrow('Invalid credentials');
  });

  it('integration: validateUser should return user from database', async () => {
    // Register user
    const registerResult = await service.register(
      'integration@example.com',
      'password123',
      'Integration',
      'Test',
    );

    // Validate user by ID
    const validatedUser = await service.validateUser(registerResult.user.id);

    expect(validatedUser).toBeDefined();
    expect(validatedUser.id).toBe(registerResult.user.id);
    expect(validatedUser.email).toBe('integration@example.com');
  });
});
