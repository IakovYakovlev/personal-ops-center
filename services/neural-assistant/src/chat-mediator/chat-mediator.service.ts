import { Injectable } from '@nestjs/common';
import { DockIntelligenceClientService } from 'src/dock-intelligence-client/dock-intelligence-client.service';
import { RetrievedChunk } from 'src/dock-intelligence-client/dtos/retrieved-chunk.dto';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { LlmService } from 'src/llm/llm.service';
import { BuildPromptInput } from 'src/prompt-builder/dtos/build-prompt-input.dto';
import { PromptBuilderService } from 'src/prompt-builder/prompt-builder.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatItem, ChatService } from 'src/chat/chat.service';
import { CreateChatDto } from 'src/chat/dtos/create-chat.dot';

@Injectable()
export class ChatMediatorService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly dockIntelligenceClientService: DockIntelligenceClientService,
    private readonly promptBuilderService: PromptBuilderService,
    private readonly llmService: LlmService,
    private readonly prisma: PrismaService,
    private readonly chatService: ChatService,
  ) {}

  async sendMessage(
    userId: string,
    message: string,
    chatListId: string,
    authorizationHeader?: string,
  ): Promise<ChatItem[]> {
    // Сохраняем сообщение пользователя в базу данных
    const dataFromUser: CreateChatDto = {
      chatListId,
      content: message,
    };

    await this.chatService.createForChatList(userId, dataFromUser);

    // получить embedding
    const embedding: number[] = await this.embeddingService.createEmbedding(message);

    // Получается, что я получаю не документ Id, а ChatListId. Нужно будет потом сделать запрос к базе данных, чтобы получить DocumentId по ChatListId. Но для начала я могу просто передавать DocumentId напрямую в метод sendMessage.
    const documentId: string = await this.getDocumentIdByChatListId(chatListId); // Здесь нужно будет заменить на реальный DocumentId, полученный из базы данных по ChatListId.

    // retrieval
    const relevantChunks: RetrievedChunk[] =
      await this.dockIntelligenceClientService.findRelevantChunks(
        embedding,
        documentId,
        authorizationHeader,
      );

    // собрать prompt
    const buildPromptInput: BuildPromptInput = {
      message,
      relevantChunks,
    };
    const prompt: string = this.promptBuilderService.buildPrompt(buildPromptInput);

    // вызвать LLM
    const llmResponse: string = await this.llmService.request(prompt);

    // сохранить ответ
    const dataFromAssistant: CreateChatDto = { chatListId, content: llmResponse };
    await this.chatService.createForChatList(userId, dataFromAssistant);

    // вернуть все сообщения для данного ChatListId
    return await this.chatService.findAllForChatList(userId, chatListId);
  }

  private async getDocumentIdByChatListId(chatListId: string): Promise<string> {
    const chatList = await this.prisma.chatList.findUnique({
      where: { id: chatListId },
      select: { documentId: true },
    });

    if (!chatList || !chatList.documentId) {
      throw new Error(`Document not found for ChatListId: ${chatListId}`);
    }

    return chatList.documentId;
  }
}
