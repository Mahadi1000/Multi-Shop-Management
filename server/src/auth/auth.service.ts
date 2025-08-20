import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { DatabaseService } from "../common/database/database.service";
import { users, shops } from "../common/database/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService
  ) {}

  async signup(signupDto: SignupDto) {
    const { username, password, shopNames } = signupDto;

    // Check if username already exists
    const existingUser = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictException("Username already exists");
    }

    // Validate shop names are unique
    const uniqueShopNames = [...new Set(shopNames)];
    if (uniqueShopNames.length !== shopNames.length) {
      throw new BadRequestException("Shop names must be unique");
    }

    if (uniqueShopNames.length < 3) {
      throw new BadRequestException(
        "At least 3 unique shop names are required"
      );
    }

    // Check if any shop names already exist globally
    const existingShops = await this.databaseService.db
      .select()
      .from(shops)
      .where(eq(shops.name, uniqueShopNames[0])); // We'll check all names

    for (const shopName of uniqueShopNames) {
      const existingShop = await this.databaseService.db
        .select()
        .from(shops)
        .where(eq(shops.name, shopName))
        .limit(1);

      if (existingShop.length > 0) {
        throw new ConflictException(`Shop name '${shopName}' already exists`);
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      // Create user
      const [newUser] = await this.databaseService.db
        .insert(users)
        .values({
          username,
          password: hashedPassword,
        })
        .returning();

      // Create shops
      const shopPromises = uniqueShopNames.map((shopName) =>
        this.databaseService.db
          .insert(shops)
          .values({
            name: shopName,
            ownerId: newUser.id,
          })
          .returning()
      );

      await Promise.all(shopPromises);

      return {
        message: "User created successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
        },
      };
    } catch (error) {
      throw new ConflictException("Failed to create user and shops");
    }
  }

  async login(loginDto: LoginDto) {
    const { username, password, rememberMe } = loginDto;

    // Find user
    const [user] = await this.databaseService.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Get user's shops
    const shopsData = await this.databaseService.db
      .select({
        id: shops.id,
        name: shops.name,
        ownerId: shops.ownerId,
        createdAt: shops.createdAt,
      })
      .from(shops)
      .where(eq(shops.ownerId, user.id));

    // Add ownerUsername to each shop
    const userShops = shopsData.map((shop) => ({
      ...shop,
      ownerUsername: user.username,
    }));

    // Generate JWT
    const payload = { sub: user.id, username: user.username };
    const expiresIn = rememberMe ? "7d" : "24h"; // Increased from 30m to 24h

    const token = this.jwtService.sign(payload, { expiresIn });

    return {
      status: 200,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt,
        shops: userShops,
      },
      token,
      expiresIn,
    };
  }

  async validateUser(userId: string) {
    const [user] = await this.databaseService.db
      .select({
        id: users.id,
        username: users.username,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return user || null;
  }
}
