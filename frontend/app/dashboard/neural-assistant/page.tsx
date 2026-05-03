'use client';

import { IconPlus, IconSend2 } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ListPanel } from './components/ListPanel';
import { Input } from '@/components/ui/input';
import { useNeuralAssistantDocuments } from '@/lib/api/hooks/neural-assistant/use-neural-assistant-documents';
import { useNeuralAssistantChats } from '@/lib/api/hooks/neural-assistant/use-neural-assistant-chats';
import { useState, useMemo } from 'react';
import { useNeuralAssistantChatMessages } from '@/lib/api/hooks/neural-assistant/use-neural-assistant-chat-messages';

export default function NeuralAssistantPage() {
  const documentsQuery = useNeuralAssistantDocuments();
  const chatsQuery = useNeuralAssistantChats();
  const [stateSelectedDocumentId, setStateSelectedDocumentId] = useState<string | number | null>(
    null,
  );
  const [selectedChatId, setSelectedChatId] = useState<string | number | null>(null);
  const chatMessagesQuery = useNeuralAssistantChatMessages(selectedChatId);

  // Получаем выбранный чат (мемоизировано)
  const memoSelectedChat = useMemo(
    () => chatsQuery.data?.find((chat) => chat.id === selectedChatId) || null,
    [chatsQuery.data, selectedChatId],
  );

  // Если у выбранного чата есть documentId, используем его, иначе — локальное состояние (мемо)
  const memoSelectedDocumentId = useMemo(
    () =>
      memoSelectedChat && memoSelectedChat.documentId
        ? memoSelectedChat.documentId
        : stateSelectedDocumentId,
    [memoSelectedChat, stateSelectedDocumentId],
  );

  // setSelectedDocumentId только если не заблокировано (мемо)
  const memoHandleSelectDocument = useMemo(
    () =>
      selectedChatId == null
        ? () => {}
        : memoSelectedChat?.documentId != null
          ? () => {} // нельзя выбрать другой документ
          : setStateSelectedDocumentId,
    [selectedChatId, memoSelectedChat, setStateSelectedDocumentId],
  );

  return (
    <div className="mx-5 flex flex-col gap-4 xl:h-[calc(100dvh-var(--header-height)-4rem)] xl:overflow-hidden">
      <div>
        <h1 className="text-3xl font-bold">Neural Assistant</h1>
      </div>

      <div className="grid min-h-0 gap-5 xl:flex-1 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="flex min-h-0 flex-col gap-5">
          <ListPanel
            title="Chats list"
            items={chatsQuery.data ?? []}
            selectedId={selectedChatId}
            onSelect={setSelectedChatId}
            getId={(item) => item.id}
            renderItem={(chat, index) => [
              <span key="id" className="rounded-sm py-0.5">
                {index + 1}
              </span>,
              <span key="date" className="rounded-sm px-1.5 py-0.5">
                {new Date(chat.createdAt).toLocaleDateString('ru-RU')}
              </span>,
            ]}
            loading={chatsQuery.isLoading}
            error={chatsQuery.isError}
            emptyText="No chats yet"
            headerAction={
              <Button size="icon-sm" variant="ghost" className="size-7 cursor-pointer rounded-md">
                <IconPlus className="size-5" />
              </Button>
            }
          />

          <div className={selectedChatId == null ? 'pointer-events-none opacity-50' : ''}>
            <ListPanel
              title="Documents list"
              items={documentsQuery.data ?? []}
              selectedId={memoSelectedDocumentId}
              onSelect={memoHandleSelectDocument}
              getId={(item) => item.id}
              renderItem={(document, index) => [
                <span key="id" className="rounded-sm py-0.5">
                  {index + 1}
                </span>,
                <span key="name" className="rounded-sm px-1.5 py-0.5">
                  {new Date(document.createdAt).toLocaleDateString('ru-RU')}
                </span>,
              ]}
              loading={documentsQuery.isLoading}
              error={documentsQuery.isError}
              emptyText="No documents yet"
            />
          </div>
        </div>

        <Card className="min-h-0 gap-0 overflow-hidden px-0 py-0 xl:h-full">
          <div className="flex h-full min-h-0 flex-col">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 md:px-7 md:py-6">
              {chatMessagesQuery.isLoading && <div>Загрузка сообщений...</div>}
              {chatMessagesQuery.isError && <div>Ошибка загрузки сообщений</div>}
              {chatMessagesQuery.data?.length === 0 && <div>Нет сообщений</div>}
              {chatMessagesQuery.data?.map((message, idx) => {
                // Чередуем роли: чётные индексы — user, нечётные — assistant
                const isUser = idx % 2 === 0;
                return (
                  <div
                    key={message.id}
                    className={isUser ? 'flex justify-end' : 'flex justify-start'}
                  >
                    <div
                      className={
                        isUser
                          ? 'max-w-[78%] rounded-2xl rounded-tr-sm bg-muted px-4 py-3 text-sm leading-relaxed'
                          : 'max-w-[82%] rounded-2xl rounded-tl-sm border border-border/70 bg-card px-4 py-3 text-sm leading-relaxed'
                      }
                    >
                      <p className="whitespace-pre-line">{message.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border/70 p-3 md:p-4">
              <div className="relative flex items-center gap-2 rounded-xl border border-border/70 bg-background px-2 py-2">
                <Input
                  placeholder="lorem ipsum dolor sit amet, consectetur adipiscing elit..."
                  className="h-9 border-0 bg-transparent pr-2 shadow-none focus-visible:ring-0"
                />
                <Button size="icon-sm" className="size-8 shrink-0 rounded-full">
                  <IconSend2 className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
