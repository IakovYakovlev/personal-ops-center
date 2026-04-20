'use client';

import { IconPlus, IconSend2 } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useNeuralAssistantDocuments } from '@/lib/api/hooks/neural-assistant/use-neural-assistant-documents';

const chats = [
  { id: 54, name: '13/04/2025' },
  { id: 55, name: '13/04/2025' },
];

const messages = [
  {
    id: 1,
    role: 'assistant',
    content:
      'Если нужно, чтобы текст выглядел более естественно для глаза клиента:\n• Разнообразие: сайт рыба текст поможет дизайнеру, верстальщику, вебмастеру генерировать несколько абзацев.\n• Гибкость: вы можете выбрать количество предложений, слов или абзацев для заполнения макета.\n• Удобство: это позволяет оценить визуальное восприятие типографики, не отвлекаясь на смысл самого контента.',
  },
  {
    id: 2,
    role: 'user',
    content:
      'Далеко-далеко за словесными горами в стране гласных и согласных живут рыбные тексты. Вдали от всех живут они в буквенных домах.',
  },
  {
    id: 3,
    role: 'assistant',
    content:
      'Задача организации, в особенности же реализация намеченных плановых заданий играет важную роль в формировании систем массового участия. Идейные соображения высшего порядка представляют собой интересный эксперимент проверки модели развития.',
  },
  {
    id: 4,
    role: 'assistant',
    content:
      'Если нужно, чтобы текст выглядел более естественно для глаза клиента:\n• Разнообразие: сайт рыба текст поможет дизайнеру, верстальщику, вебмастеру генерировать несколько абзацев.\n• Гибкость: вы можете выбрать количество предложений, слов или абзацев для заполнения макета.\n• Удобство: это позволяет оценить визуальное восприятие типографики, не отвлекаясь на смысл самого контента.',
  },
  {
    id: 5,
    role: 'user',
    content:
      'Далеко-далеко за словесными горами в стране гласных и согласных живут рыбные тексты. Вдали от всех живут они в буквенных домах.',
  },
  {
    id: 6,
    role: 'assistant',
    content:
      'Задача организации, в особенности же реализация намеченных плановых заданий играет важную роль в формировании систем массового участия. Идейные соображения высшего порядка представляют собой интересный эксперимент проверки модели развития.',
  },
];

export default function NeuralAssistantPage() {
  const documentsQuery = useNeuralAssistantDocuments();

  return (
    <div className="mx-2 flex flex-col gap-4 xl:h-[calc(100dvh-var(--header-height)-4rem)] xl:overflow-hidden">
      <div>
        <h1 className="text-3xl font-bold">Neural Assistant</h1>
      </div>

      <div className="grid min-h-0 gap-4 xl:flex-1 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="flex min-h-0 flex-col gap-4 xl:pr-1">
          {/* Chats list */}
          <Card className="flex min-h-0 flex-1 flex-col gap-0 px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[20px] font-semibold leading-none">Chats list</h2>
              <Button size="icon-sm" variant="ghost" className="size-7 cursor-pointer rounded-md">
                <IconPlus className="size-5" />
              </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg p-3">
              <div className="mb-2 grid grid-cols-[56px_1fr] gap-x-3 border-b border-border/60 pb-2 text-xs text-muted-foreground text-[12px]">
                <span>Id</span>
                <span>Name</span>
              </div>
              <div className="space-y-2 text-sm">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className="grid grid-cols-[56px_1fr] gap-x-3 leading-none hover:bg-[#27272A] cursor-pointer rounded"
                  >
                    <span>{chat.id}</span>
                    <span className="rounded-sm px-1.5 py-0.5">{chat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Documents list */}
          <Card className="flex min-h-0 flex-1 flex-col gap-0 px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[20px] font-semibold leading-none">Documents list</h2>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto rounded-lg p-3">
              <div className="mb-2 grid grid-cols-[56px_1fr] gap-x-3 border-b border-border/60 pb-2 text-xs text-muted-foreground text-[12px]">
                <span>Id</span>
                <span>Name</span>
              </div>
              <div className="space-y-2 text-sm">
                {documentsQuery.isLoading && (
                  <div className="rounded-sm px-1.5 py-0.5 text-muted-foreground">Loading...</div>
                )}

                {documentsQuery.isError && (
                  <div className="rounded-sm px-1.5 py-0.5 text-destructive">
                    Failed to load documents
                  </div>
                )}

                {!documentsQuery.isLoading &&
                  !documentsQuery.isError &&
                  documentsQuery.data?.map((document, index) => (
                    <div
                      key={document.id}
                      className="grid grid-cols-[56px_1fr] gap-x-3 leading-none hover:bg-[#27272A] cursor-pointer rounded"
                    >
                      <span>{index + 1}</span>
                      <span className="rounded-sm px-1.5 py-0.5">
                        {new Date(document.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  ))}

                {!documentsQuery.isLoading &&
                  !documentsQuery.isError &&
                  documentsQuery.data?.length === 0 && (
                    <div className="rounded-sm px-1.5 py-0.5 text-muted-foreground">
                      No documents yet
                    </div>
                  )}
              </div>
            </div>
          </Card>
        </div>

        <Card className="min-h-0 gap-0 overflow-hidden px-0 py-0 xl:h-full">
          <div className="flex h-full min-h-0 flex-col">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 md:px-7 md:py-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                >
                  <div
                    className={
                      message.role === 'user'
                        ? 'max-w-[78%] rounded-2xl rounded-tr-sm bg-muted px-4 py-3 text-sm leading-relaxed'
                        : 'max-w-[82%] rounded-2xl rounded-tl-sm border border-border/70 bg-card px-4 py-3 text-sm leading-relaxed'
                    }
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                  </div>
                </div>
              ))}
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
