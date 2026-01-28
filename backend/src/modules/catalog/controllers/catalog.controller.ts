import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CatalogService } from '../services/catalog.service';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  async getCategories() {
    // TODO: Implement categories endpoint
    return { categories: [] };
  }

  @Get('products')
  async searchProducts(
    @Query('query') query?: string,
    @Query('category') category?: string,
    @Query('priceMin') priceMin?: string,
    @Query('priceMax') priceMax?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.catalogService.searchProducts(
      query,
      category,
      priceMin ? parseFloat(priceMin) : undefined,
      priceMax ? parseFloat(priceMax) : undefined,
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 20,
    );
  }

  @Get('products/:id')
  async getProductById(@Param('id') id: string) {
    return this.catalogService.getProductById(id);
  }

  @Post('products')
  @UseGuards(JwtGuard)
  async createProduct(
    @CurrentUser() user: any,
    @Body()
    body: {
      categoryId: string;
      title: string;
      description: string;
      basePrice: number;
    },
  ) {
    // TODO: Verify user is seller
    return this.catalogService.createProduct(
      user.sub,
      body.categoryId,
      body.title,
      body.description,
      body.basePrice,
    );
  }
}
