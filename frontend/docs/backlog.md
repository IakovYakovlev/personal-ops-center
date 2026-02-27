# Backlog

Список задач, идей и улучшений для Personal Ops Center.

---

### [Feature] Quick Create CTA кнопка с функционалом

**Статус:** 🧊 Backlog  
**Приоритет:** Low

#### 📝 Суть (Контекст)

В `nav-main.tsx` есть placeholder кнопка "Quick Create" из UI kit шаблона, которая пока не имеет функционала.

Идеи для реализации:

- **Быстрая загрузка документа** — открыть диалог загрузки без перехода на страницу документов
- **Feedback/Contact форма** — диалог для отправки сообщения/фидбека (но есть риск спама на почту)
- **Quick actions menu** — меню с быстрыми действиями (новый документ, настройки, и т.д.)

Пока функционал не определён, кнопка оставлена как placeholder.

#### 📍 Локация (Где менять)

- **Frontend:** `components/nav-main.tsx` (строка 27-35)
- **Может понадобиться:**
  - Новый компонент диалога (например `quick-create-dialog.tsx`)
  - API endpoint для отправки feedback (если выберем эту опцию)

#### 🛠 Что нужно сделать (Checklist)

- [ ] Определить основной use case для кнопки (документ / feedback / actions menu)
- [ ] Создать UI диалога с соответствующим функционалом
- [ ] Подключить обработчик к кнопке "Quick Create"
- [ ] Если feedback форма — добавить rate limiting на бэкенде
- [ ] Протестировать UX: быстрый доступ действительно удобнее?

#### 🔗 Связи и Ресурсы

- Связано: `components/nav-main.tsx`, `app-sidebar.tsx`
- Альтернатива: Можно вообще удалить кнопку, если quick actions не нужны
- Референс: посмотреть как реализованы quick actions в linear.app / notion

```bash
<SidebarMenu>
  <SidebarMenuItem className="flex items-center gap-2">
    <SidebarMenuButton
      tooltip="Quick Create"
      className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
    >
      <IconCirclePlusFilled />
      <span>Quick Create</span>
    </SidebarMenuButton>
    <button
      size="icon"
      className="size-8 group-data-[collapsible=icon]:opacity-0"
      variant="outline"
    >
      <IconMail />
      <span className="sr-only">Inbox</span>
    </button>
  </SidebarMenuItem>
</SidebarMenu>
```

---
