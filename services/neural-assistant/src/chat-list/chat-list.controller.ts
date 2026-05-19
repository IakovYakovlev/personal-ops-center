import {
  BadRequestException,
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ChatListService, type ChatListItem } from './chat-list.service';
import { JwtGuard } from '../auth/jwt.guard';
import { type RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { UpdateChatListDto } from './dtos/update-chat-list.dto';

@Controller('chat-list')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard)
export class ChatListController {
  constructor(private readonly chatListService: ChatListService) {}

  @Get()
  async findAllForUser(@Req() request: RequestWithUser): Promise<ChatListItem[]> {
    const userId: string = request.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in JWT token');
    }

    return await this.chatListService.findAllForUser(userId);
  }

  @Patch(':id')
  async update(
    @Req() request: RequestWithUser,
    @Param('id') chatListId: string,
    @Body() dto: UpdateChatListDto,
  ): Promise<ChatListItem> {
    const userId: string = request.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in JWT token');
    }

    return await this.chatListService.update(userId, chatListId, dto);
  }
}
