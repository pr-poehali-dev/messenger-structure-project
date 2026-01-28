import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface Contact {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen?: string;
}

interface Message {
  id: number;
  text: string;
  time: string;
  sent: boolean;
  read: boolean;
}

interface Chat {
  id: number;
  contact: Contact;
  lastMessage: string;
  time: string;
  unread: number;
  messages: Message[];
}

const Index = () => {
  const [activeView, setActiveView] = useState<'chats' | 'contacts' | 'profile' | 'settings'>('chats');
  const [selectedChat, setSelectedChat] = useState<number | null>(1);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const contacts: Contact[] = [
    { id: 1, name: 'Анна Соколова', avatar: '', status: 'online' },
    { id: 2, name: 'Дмитрий Петров', avatar: '', status: 'offline', lastSeen: '2 часа назад' },
    { id: 3, name: 'Елена Иванова', avatar: '', status: 'online' },
    { id: 4, name: 'Михаил Зайцев', avatar: '', status: 'offline', lastSeen: 'вчера' },
  ];

  const [chats, setChats] = useState<Chat[]>([
    {
      id: 1,
      contact: contacts[0],
      lastMessage: 'Отлично, встречаемся завтра!',
      time: '14:32',
      unread: 2,
      messages: [
        { id: 1, text: 'Привет! Как дела?', time: '14:28', sent: false, read: true },
        { id: 2, text: 'Привет! Всё хорошо, спасибо', time: '14:30', sent: true, read: true },
        { id: 3, text: 'Можем встретиться завтра?', time: '14:31', sent: false, read: true },
        { id: 4, text: 'Отлично, встречаемся завтра!', time: '14:32', sent: true, read: false },
      ],
    },
    {
      id: 2,
      contact: contacts[1],
      lastMessage: 'Документы отправил на почту',
      time: '13:15',
      unread: 0,
      messages: [
        { id: 1, text: 'Не забудь отправить документы', time: '12:00', sent: true, read: true },
        { id: 2, text: 'Документы отправил на почту', time: '13:15', sent: false, read: true },
      ],
    },
    {
      id: 3,
      contact: contacts[2],
      lastMessage: 'Спасибо за помощь! 🙏',
      time: 'Вчера',
      unread: 0,
      messages: [
        { id: 1, text: 'Подскажи, как решить эту задачу?', time: 'Вчера', sent: false, read: true },
        { id: 2, text: 'Конечно, вот решение...', time: 'Вчера', sent: true, read: true },
        { id: 3, text: 'Спасибо за помощь! 🙏', time: 'Вчера', sent: false, read: true },
      ],
    },
  ]);

  const currentChat = chats.find(chat => chat.id === selectedChat);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput(prev => prev + emojiData.emoji);
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedChat) {
      const now = new Date();
      const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const newMessage: Message = {
        id: Date.now(),
        text: messageInput.trim(),
        time: timeString,
        sent: true,
        read: false,
      };

      setChats(prevChats => 
        prevChats.map(chat => {
          if (chat.id === selectedChat) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: newMessage.text,
              time: timeString,
            };
          }
          return chat;
        })
      );

      setMessageInput('');
      setShowEmojiPicker(false);
    }
  };

  return (
    <div className="h-screen flex bg-muted/30">
      <div className="w-20 bg-card border-r flex flex-col items-center py-6 space-y-6">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
          <Icon name="MessageCircle" size={24} className="text-primary-foreground" />
        </div>
        
        <Separator className="w-8" />
        
        <nav className="flex flex-col space-y-4">
          <Button
            variant={activeView === 'chats' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setActiveView('chats')}
            className="rounded-xl"
          >
            <Icon name="MessageSquare" size={22} />
          </Button>
          
          <Button
            variant={activeView === 'contacts' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setActiveView('contacts')}
            className="rounded-xl"
          >
            <Icon name="Users" size={22} />
          </Button>
          
          <Button
            variant={activeView === 'profile' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setActiveView('profile')}
            className="rounded-xl"
          >
            <Icon name="User" size={22} />
          </Button>
          
          <Button
            variant={activeView === 'settings' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setActiveView('settings')}
            className="rounded-xl"
          >
            <Icon name="Settings" size={22} />
          </Button>
        </nav>
      </div>

      <div className="w-80 bg-card border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-2xl font-semibold mb-4">
            {activeView === 'chats' && 'Чаты'}
            {activeView === 'contacts' && 'Контакты'}
            {activeView === 'profile' && 'Профиль'}
            {activeView === 'settings' && 'Настройки'}
          </h1>
          
          {(activeView === 'chats' || activeView === 'contacts') && (
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeView === 'chats' && chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-4 border-b cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedChat === chat.id ? 'bg-muted/50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={chat.contact.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {chat.contact.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {chat.contact.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium truncate">{chat.contact.name}</h3>
                    <span className="text-xs text-muted-foreground">{chat.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
                
                {chat.unread > 0 && (
                  <Badge className="bg-primary text-primary-foreground rounded-full h-5 min-w-[20px] flex items-center justify-center text-xs">
                    {chat.unread}
                  </Badge>
                )}
              </div>
            </div>
          ))}

          {activeView === 'contacts' && contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 border-b cursor-pointer transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {contact.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium">{contact.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {contact.status === 'online' ? 'В сети' : contact.lastSeen}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {activeView === 'profile' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-2xl">
                    ВЫ
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">Вы</h2>
                <p className="text-sm text-muted-foreground">@username</p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">Телефон</label>
                  <p className="font-medium">+7 900 123-45-67</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">user@example.com</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">О себе</label>
                  <p className="font-medium">Доступен для общения</p>
                </div>
              </div>
            </div>
          )}

          {activeView === 'settings' && (
            <div className="p-4 space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Icon name="Bell" size={20} className="mr-3" />
                Уведомления
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Icon name="Lock" size={20} className="mr-3" />
                Приватность
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Icon name="Palette" size={20} className="mr-3" />
                Оформление
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Icon name="HardDrive" size={20} className="mr-3" />
                Данные и память
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Icon name="HelpCircle" size={20} className="mr-3" />
                Помощь
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-background">
        {currentChat ? (
          <>
            <div className="h-16 border-b bg-card px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={currentChat.contact.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {currentChat.contact.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {currentChat.contact.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold">{currentChat.contact.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {currentChat.contact.status === 'online' ? 'В сети' : currentChat.contact.lastSeen}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-lg">
                  <Icon name="Phone" size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-lg">
                  <Icon name="Video" size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-lg">
                  <Icon name="MoreVertical" size={20} />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sent ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-md px-4 py-2 rounded-2xl ${
                      message.sent
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className={`text-xs ${message.sent ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {message.time}
                      </span>
                      {message.sent && (
                        <Icon
                          name={message.read ? 'CheckCheck' : 'Check'}
                          size={14}
                          className={message.read ? 'text-primary-foreground' : 'text-primary-foreground/70'}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t bg-card p-4">
              <div className="flex items-end gap-3">
                <Button variant="ghost" size="icon" className="rounded-lg">
                  <Icon name="Plus" size={22} />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    placeholder="Написать сообщение..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <div className="relative" ref={emojiPickerRef}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <Icon name="Smile" size={20} />
                      </Button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-12 right-0 z-50">
                          <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Icon name="Paperclip" size={20} />
                    </Button>
                  </div>
                </div>
                
                <Button 
                  size="icon" 
                  className="rounded-lg"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  <Icon name="Send" size={20} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Icon name="MessageCircle" size={40} className="text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Выберите чат</h3>
                <p className="text-sm">Начните общение с вашими контактами</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;