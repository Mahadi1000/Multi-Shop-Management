import { Controller, Get, UseGuards, Request } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UsersService } from "./users.service";

@ApiTags("Users")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiCookieAuth("jwt")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @ApiOperation({ summary: "Get current user information and shops" })
  @ApiResponse({
    status: 200,
    description: "User information retrieved successfully",
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "User not found" })
  async getCurrentUser(@Request() req) {
    console.log("🔍 getCurrentUser called for user:", req.user?.id);
    console.log("🔍 Full user object from JWT:", req.user);
    return this.usersService.getUserWithShops(req.user.id);
  }
}
