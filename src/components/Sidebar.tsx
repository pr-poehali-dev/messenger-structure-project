import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { Chat, Contact } from '@/types/chat';

interface SidebarProps {
  activeView: 'chats' | 'contacts' | 'profile' | 'settings';
  setActiveView: (view: 'chats' | 'contacts' | 'profile' | 'settings') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  chats: Chat[];
  contacts: Contact[];
  selectedChat: number | null;
  setSelectedChat: (id: number | null) => void;
  onShowStorage?: () => void;
}

const Sidebar = ({
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  chats,
  contacts,
  selectedChat,
  setSelectedChat,
  onShowStorage,
}: SidebarProps) => {
  return (
    <>
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
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={onShowStorage}
              >
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
    </>
  );
};

export default Sidebar;