import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';
import { users, shops } from '../common/database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getUserWithShops(userId: string) {
    const [user] = await this.databaseService.db
      .select({
        id: users.id,
        username: users.username,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userShops = await this.databaseService.db
      .select({
        id: shops.id,
        name: shops.name,
        createdAt: shops.createdAt,
      })
      .from(shops)
      .where(eq(shops.ownerId, userId));

    return {
      ...user,
      shops: userShops,
    };
  }
}
