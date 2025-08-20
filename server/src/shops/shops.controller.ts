import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ShopsService } from './shops.service';

@ApiTags('Shops')
@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get('by-name/:shopName')
  @ApiOperation({ summary: 'Get shop details by name' })
  @ApiParam({ name: 'shopName', description: 'Shop name', example: 'coffee-shop' })
  @ApiResponse({ status: 200, description: 'Shop details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async getShopByName(@Param('shopName') shopName: string) {
    return this.shopsService.getShopByName(shopName);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shop details by ID' })
  @ApiParam({ name: 'id', description: 'Shop ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Shop details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async getShopById(@Param('id') id: string) {
    return this.shopsService.getShopById(id);
  }
}
