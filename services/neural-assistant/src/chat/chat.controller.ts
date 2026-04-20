import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiProperty } from '@nestjs/swagger';
import { ChatService, type ChatItem } from './chat.service';
import { JwtGuard } from '../auth/jwt.guard';
import { type RequestWithUser } from '../common/interfaces/request-with-user.interface';

class CreateChatDto {
  @ApiProperty({
    description: 'Chat list ID that owns the messages thread',
    example: 'cmabcd1234567890',
  })
  chatListId!: string;

  @ApiProperty({
    description: 'Message text to append to the chat',
    example: 'Сделай краткое summary документа',
  })
  content!: string;
}

@Controller('chat')
@ApiBearerAuth('JWT')
@UseGuards(JwtGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async findAllForChatList(
    @Req() request: RequestWithUser,
    @Query('chatListId') chatListId?: string,
  ): Promise<ChatItem[]> {
    const userId: string = request.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in JWT token');
    }

    if (!chatListId?.trim()) {
      throw new BadRequestException('chatListId is required');
    }

    return await this.chatService.findAllForChatList(userId, chatListId);
  }

  @Post()
  @ApiBody({ type: CreateChatDto })
  async create(@Req() request: RequestWithUser, @Body() body: CreateChatDto): Promise<ChatItem> {
    const userId: string = request.user?.sub;
    if (!userId) {
      throw new BadRequestException('User ID not found in JWT token');
    }

    if (!body.chatListId?.trim()) {
      throw new BadRequestException('chatListId is required');
    }

    if (!body.content?.trim()) {
      throw new BadRequestException('content is required');
    }

    return await this.chatService.createForChatList(userId, {
      chatListId: body.chatListId,
      content: body.content,
    });
  }
}
