import { ApiProperty } from '@nestjs/swagger';

export class UpdateChatListDto {
  @ApiProperty({ example: 'doc_123', required: false, description: 'ID документа для фиксации' })
  documentId?: string;
}
