import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
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
