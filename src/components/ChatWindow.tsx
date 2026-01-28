import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { Chat, Message } from '@/types/chat';

interface ChatWindowProps {
  currentChat: Chat | undefined;
  formatRecordingTime: (seconds: number) => void;
  handleVotePoll: (messageId: number, optionId: number) => void;
}

const ChatWindow = ({ currentChat, formatRecordingTime, handleVotePoll }: ChatWindowProps) => {
  if (!currentChat) {
    return (
      <div className="flex-1 flex flex-col bg-background">
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
      </div>
    );
  }

  return (
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
        {currentChat.messages.map((message: Message) => (
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
    </>
  );
};

export default ChatWindow;
