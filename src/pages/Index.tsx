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

interface PollOption {
  id: number;
  text: string;
  votes: number;
}

interface Message {
  id: number;
  text: string;
  time: string;
  sent: boolean;
  read: boolean;
  type?: 'text' | 'audio' | 'video' | 'file' | 'poll';
  duration?: number;
  audioUrl?: string;
  videoUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileUrl?: string;
  pollQuestion?: string;
  pollOptions?: PollOption[];
  userVote?: number;
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
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput(prev => prev + emojiData.emoji);
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        sendMediaMessage('audio', audioUrl, recordingTime);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error);
    }
  };

  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(audioChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        sendMediaMessage('video', videoUrl, recordingTime);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingVideo(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Ошибка доступа к камере:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
    setIsRecordingAudio(false);
    setIsRecordingVideo(false);
  };

  const sendMediaMessage = (type: 'audio' | 'video', url: string, duration: number) => {
    if (selectedChat) {
      const now = new Date();
      const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const newMessage: Message = {
        id: Date.now(),
        text: type === 'audio' ? '🎤 Голосовое сообщение' : '🎥 Видео-кружок',
        time: timeString,
        sent: true,
        read: false,
        type,
        duration,
        audioUrl: type === 'audio' ? url : undefined,
        videoUrl: type === 'video' ? url : undefined,
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
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedChat) {
      const now = new Date();
      const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const fileUrl = URL.createObjectURL(file);
      const fileSize = file.size < 1024 * 1024 
        ? `${(file.size / 1024).toFixed(1)} КБ` 
        : `${(file.size / (1024 * 1024)).toFixed(1)} МБ`;

      const newMessage: Message = {
        id: Date.now(),
        text: file.name,
        time: timeString,
        sent: true,
        read: false,
        type: 'file',
        fileName: file.name,
        fileSize,
        fileUrl,
      };

      setChats(prevChats => 
        prevChats.map(chat => {
          if (chat.id === selectedChat) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: `📎 ${file.name}`,
              time: timeString,
            };
          }
          return chat;
        })
      );
      setShowAttachMenu(false);
    }
  };

  const handleCreatePoll = () => {
    if (pollQuestion.trim() && pollOptions.filter(o => o.trim()).length >= 2 && selectedChat) {
      const now = new Date();
      const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const validOptions = pollOptions
        .filter(o => o.trim())
        .map((text, index) => ({ id: index, text, votes: 0 }));

      const newMessage: Message = {
        id: Date.now(),
        text: pollQuestion,
        time: timeString,
        sent: true,
        read: false,
        type: 'poll',
        pollQuestion: pollQuestion,
        pollOptions: validOptions,
      };

      setChats(prevChats => 
        prevChats.map(chat => {
          if (chat.id === selectedChat) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: `📊 ${pollQuestion}`,
              time: timeString,
            };
          }
          return chat;
        })
      );

      setPollQuestion('');
      setPollOptions(['', '']);
      setShowPollCreator(false);
    }
  };

  const handleVotePoll = (messageId: number, optionId: number) => {
    setChats(prevChats => 
      prevChats.map(chat => ({
        ...chat,
        messages: chat.messages.map(msg => {
          if (msg.id === messageId && msg.type === 'poll' && msg.pollOptions) {
            return {
              ...msg,
              userVote: optionId,
              pollOptions: msg.pollOptions.map(opt => 
                opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
              ),
            };
          }
          return msg;
        }),
      }))
    );
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
        type: 'text',
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
                    className={`${message.type === 'video' ? 'max-w-xs' : 'max-w-md'} px-4 py-2 rounded-2xl ${
                      message.sent
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border'
                    }`}
                  >
                    {message.type === 'audio' && message.audioUrl && (
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 rounded-full"
                          onClick={() => {
                            const audio = new Audio(message.audioUrl);
                            audio.play();
                          }}
                        >
                          <Icon name="Play" size={20} />
                        </Button>
                        <div className="flex-1">
                          <div className="h-1 bg-current opacity-20 rounded-full" />
                        </div>
                        <span className="text-xs opacity-70">
                          {formatRecordingTime(message.duration || 0)}
                        </span>
                      </div>
                    )}
                    
                    {message.type === 'video' && message.videoUrl && (
                      <div>
                        <video 
                          src={message.videoUrl} 
                          controls 
                          className="w-full rounded-lg mb-2"
                          style={{ maxWidth: '200px', maxHeight: '200px' }}
                        />
                        <span className="text-xs opacity-70">
                          {formatRecordingTime(message.duration || 0)}
                        </span>
                      </div>
                    )}
                    
                    {message.type === 'file' && message.fileName && (
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-current opacity-10 rounded-lg flex items-center justify-center">
                          <Icon name="FileText" size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{message.fileName}</p>
                          <p className="text-xs opacity-70">{message.fileSize}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="flex-shrink-0"
                          onClick={() => {
                            if (message.fileUrl) {
                              const link = document.createElement('a');
                              link.href = message.fileUrl;
                              link.download = message.fileName || 'file';
                              link.click();
                            }
                          }}
                        >
                          <Icon name="Download" size={20} />
                        </Button>
                      </div>
                    )}
                    
                    {message.type === 'poll' && message.pollOptions && (
                      <div className="space-y-3 min-w-[250px]">
                        <p className="font-medium">{message.pollQuestion}</p>
                        <div className="space-y-2">
                          {message.pollOptions.map((option) => {
                            const totalVotes = message.pollOptions?.reduce((sum, opt) => sum + opt.votes, 0) || 0;
                            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                            const isVoted = message.userVote === option.id;
                            
                            return (
                              <button
                                key={option.id}
                                onClick={() => !message.userVote && handleVotePoll(message.id, option.id)}
                                disabled={!!message.userVote}
                                className={`w-full text-left p-2 rounded-lg transition-colors relative overflow-hidden ${
                                  message.userVote 
                                    ? 'cursor-default' 
                                    : 'hover:bg-current hover:bg-opacity-10 cursor-pointer'
                                }`}
                              >
                                {message.userVote && (
                                  <div 
                                    className="absolute inset-0 bg-current opacity-10 transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  />
                                )}
                                <div className="relative flex items-center justify-between">
                                  <span className="text-sm flex items-center gap-2">
                                    {isVoted && <Icon name="Check" size={16} />}
                                    {option.text}
                                  </span>
                                  {message.userVote && (
                                    <span className="text-xs opacity-70">{percentage.toFixed(0)}%</span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        {message.userVote && (
                          <p className="text-xs opacity-70">
                            Всего голосов: {message.pollOptions.reduce((sum, opt) => sum + opt.votes, 0)}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {message.type === 'text' && (
                      <p className="text-sm">{message.text}</p>
                    )}
                    
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
              {(isRecordingAudio || isRecordingVideo) ? (
                <div className="flex items-center gap-4 justify-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">{formatRecordingTime(recordingTime)}</span>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="rounded-full"
                    onClick={stopRecording}
                  >
                    <Icon name="Square" size={20} />
                  </Button>
                </div>
              ) : showPollCreator ? (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Создать опрос</h3>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setShowPollCreator(false);
                        setPollQuestion('');
                        setPollOptions(['', '']);
                      }}
                    >
                      <Icon name="X" size={20} />
                    </Button>
                  </div>
                  
                  <Input
                    placeholder="Вопрос опроса"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                  />
                  
                  <div className="space-y-2">
                    {pollOptions.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Вариант ${index + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...pollOptions];
                            newOptions[index] = e.target.value;
                            setPollOptions(newOptions);
                          }}
                        />
                        {pollOptions.length > 2 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== index))}
                          >
                            <Icon name="X" size={18} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPollOptions([...pollOptions, ''])}
                      disabled={pollOptions.length >= 10}
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить вариант
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={handleCreatePoll}
                      disabled={!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2}
                    >
                      Отправить опрос
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-end gap-3">
                  <div className="relative" ref={attachMenuRef}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-lg"
                      onClick={() => setShowAttachMenu(!showAttachMenu)}
                    >
                      <Icon name="Plus" size={22} />
                    </Button>
                    
                    {showAttachMenu && (
                      <div className="absolute bottom-14 left-0 bg-card border rounded-lg shadow-lg p-2 space-y-1 min-w-[180px] z-50">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start"
                          onClick={() => {
                            fileInputRef.current?.click();
                            setShowAttachMenu(false);
                          }}
                        >
                          <Icon name="FileText" size={18} className="mr-2" />
                          Файл
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start"
                          onClick={() => {
                            setShowPollCreator(true);
                            setShowAttachMenu(false);
                          }}
                        >
                          <Icon name="BarChart3" size={18} className="mr-2" />
                          Опрос
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  
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
                    </div>
                  </div>
                  
                  {messageInput.trim() ? (
                    <Button 
                      size="icon" 
                      className="rounded-lg"
                      onClick={handleSendMessage}
                    >
                      <Icon name="Send" size={20} />
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        size="icon" 
                        className="rounded-lg"
                        onClick={startAudioRecording}
                      >
                        <Icon name="Mic" size={20} />
                      </Button>
                      <Button 
                        size="icon" 
                        className="rounded-lg bg-gradient-to-br from-primary to-blue-600"
                        onClick={startVideoRecording}
                      >
                        <Icon name="Video" size={20} />
                      </Button>
                    </div>
                  )}
                </div>
              )}
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