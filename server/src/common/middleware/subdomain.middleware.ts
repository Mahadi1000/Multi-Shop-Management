import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ShopsService } from '../../shops/shops.service';

@Injectable()
export class SubdomainMiddleware implements NestMiddleware {
  constructor(private readonly shopsService: ShopsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const host = req.get('host');
    
    if (!host) {
      return next();
    }

    // Extract subdomain from host
    // For example: coffee-shop.localhost:3000 -> coffee-shop
    const hostParts = host.split('.');
    
    // Check if there's a subdomain (more than just domain.tld)
    if (hostParts.length > 2 || (hostParts.length === 2 && hostParts[1] === 'localhost')) {
      const subdomain = hostParts[0];
      
      // Skip common subdomains that aren't shop names
      if (['www', 'api', 'admin'].includes(subdomain)) {
        return next();
      }

      try {
        // Check if subdomain corresponds to a valid shop
        const shopExists = await this.shopsService.checkShopExists(subdomain);
        
        if (shopExists) {
          // If it's a valid shop subdomain, return shop response
          return res.json({
            message: `This is ${subdomain} shop`,
            shopName: subdomain,
          });
        } else {
          // If subdomain exists but no shop found, return 404
          throw new NotFoundException(`Shop '${subdomain}' not found`);
        }
      } catch (error) {
        if (error instanceof NotFoundException) {
          return res.status(404).json({
            statusCode: 404,
            message: error.message,
            error: 'Not Found',
          });
        }
        // For other errors, continue to next middleware
        return next();
      }
    }

    // If no subdomain or not a shop subdomain, continue normally
    next();
  }
}
