import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../common/database/database.service';
import { shops, users } from '../common/database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ShopsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getShopByName(shopName: string) {
    const [shop] = await this.databaseService.db
      .select({
        id: shops.id,
        name: shops.name,
        ownerId: shops.ownerId,
        createdAt: shops.createdAt,
        ownerUsername: users.username,
      })
      .from(shops)
      .leftJoin(users, eq(shops.ownerId, users.id))
      .where(eq(shops.name, shopName))
      .limit(1);

    if (!shop) {
      throw new NotFoundException(`Shop with name '${shopName}' not found`);
    }

    return {
      id: shop.id,
      name: shop.name,
      ownerId: shop.ownerId,
      ownerUsername: shop.ownerUsername,
      createdAt: shop.createdAt,
    };
  }

  async getShopById(shopId: string) {
    const [shop] = await this.databaseService.db
      .select({
        id: shops.id,
        name: shops.name,
        ownerId: shops.ownerId,
        createdAt: shops.createdAt,
        ownerUsername: users.username,
      })
      .from(shops)
      .leftJoin(users, eq(shops.ownerId, users.id))
      .where(eq(shops.id, shopId))
      .limit(1);

    if (!shop) {
      throw new NotFoundException(`Shop with id '${shopId}' not found`);
    }

    return {
      id: shop.id,
      name: shop.name,
      ownerId: shop.ownerId,
      ownerUsername: shop.ownerUsername,
      createdAt: shop.createdAt,
    };
  }

  async checkShopExists(shopName: string): Promise<boolean> {
    const [shop] = await this.databaseService.db
      .select({ id: shops.id })
      .from(shops)
      .where(eq(shops.name, shopName))
      .limit(1);

    return !!shop;
  }
}
