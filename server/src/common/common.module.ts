import { Module } from '@nestjs/common';
import { ShopsModule } from '../shops/shops.module';
import { SubdomainMiddleware } from './middleware/subdomain.middleware';

@Module({
  imports: [ShopsModule],
  providers: [SubdomainMiddleware],
  exports: [SubdomainMiddleware],
})
export class CommonModule {}
