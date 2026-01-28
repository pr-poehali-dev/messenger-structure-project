import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { Chat } from '@/types/chat';

interface StorageViewProps {
  chats: Chat[];
  onBack: () => void;
}

interface StorageData {
  total: number;
  used: number;
  categories: {
    messages: number;
    media: number;
    files: number;
    cache: number;
  };
}

const StorageView = ({ chats, onBack }: StorageViewProps) => {
  const [storageData, setStorageData] = useState<StorageData>({
    total: 100,
    used: 0,
    categories: {
      messages: 0,
      media: 0,
      files: 0,
      cache: 0,
    },
  });

  useEffect(() => {
    let messagesCount = 0;
    let mediaCount = 0;
    let filesCount = 0;

    chats.forEach(chat => {
      chat.messages.forEach(msg => {
        if (msg.type === 'text') messagesCount++;
        if (msg.type === 'audio' || msg.type === 'video') mediaCount++;
        if (msg.type === 'file') filesCount++;
      });
    });

    const messagesSize = messagesCount * 0.5;
    const mediaSize = mediaCount * 2.5;
    const filesSize = filesCount * 1.8;
    const cacheSize = 3.2;

    setStorageData({
      total: 100,
      used: messagesSize + mediaSize + filesSize + cacheSize,
      categories: {
        messages: messagesSize,
        media: mediaSize,
        files: filesSize,
        cache: cacheSize,
      },
    });
  }, [chats]);

  const usedPercentage = (storageData.used / storageData.total) * 100;
  const freeSpace = storageData.total - storageData.used;

  const handleClearCache = () => {
    setStorageData(prev => ({
      ...prev,
      used: prev.used - prev.categories.cache,
      categories: {
        ...prev.categories,
        cache: 0,
      },
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'messages': return 'MessageSquare';
      case 'media': return 'Image';
      case 'files': return 'FileText';
      case 'cache': return 'Database';
      default: return 'HardDrive';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'messages': return 'Сообщения';
      case 'media': return 'Медиа (аудио/видео)';
      case 'files': return 'Файлы';
      case 'cache': return 'Кэш';
      default: return category;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h2 className="text-xl font-semibold">Данные и память</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Использовано</p>
              <p className="text-2xl font-bold">
                {storageData.used.toFixed(1)} МБ
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Доступно</p>
              <p className="text-lg font-semibold text-muted-foreground">
                {freeSpace.toFixed(1)} МБ
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={usedPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground text-center">
              {usedPercentage.toFixed(1)}% от {storageData.total} МБ
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase">
            Категории данных
          </h3>

          {Object.entries(storageData.categories).map(([category, size]) => {
            const percentage = storageData.total > 0 ? (size / storageData.total) * 100 : 0;
            
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon name={getCategoryIcon(category)} size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{getCategoryName(category)}</p>
                      <p className="text-sm text-muted-foreground">
                        {size.toFixed(1)} МБ
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase">
            Управление данными
          </h3>

          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleClearCache}
            disabled={storageData.categories.cache === 0}
          >
            <Icon name="Trash2" size={18} className="mr-3" />
            Очистить кэш ({storageData.categories.cache.toFixed(1)} МБ)
          </Button>

          <Button variant="outline" className="w-full justify-start">
            <Icon name="Download" size={18} className="mr-3" />
            Экспортировать данные
          </Button>

          <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
            <Icon name="AlertCircle" size={18} className="mr-3" />
            Удалить все данные
          </Button>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase">
            Статистика
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Всего чатов</p>
              <p className="text-2xl font-bold">{chats.length}</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Сообщений</p>
              <p className="text-2xl font-bold">
                {chats.reduce((sum, chat) => sum + chat.messages.length, 0)}
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Медиафайлов</p>
              <p className="text-2xl font-bold">
                {chats.reduce((sum, chat) => 
                  sum + chat.messages.filter(m => m.type === 'audio' || m.type === 'video').length, 0
                )}
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Файлов</p>
              <p className="text-2xl font-bold">
                {chats.reduce((sum, chat) => 
                  sum + chat.messages.filter(m => m.type === 'file').length, 0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageView;
