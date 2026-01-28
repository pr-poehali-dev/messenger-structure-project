import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface MessageInputProps {
  messageInput: string;
  setMessageInput: (value: string) => void;
  handleSendMessage: () => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  isRecordingAudio: boolean;
  isRecordingVideo: boolean;
  recordingTime: number;
  stopRecording: () => void;
  startAudioRecording: () => void;
  startVideoRecording: () => void;
  formatRecordingTime: (seconds: number) => string;
  showAttachMenu: boolean;
  setShowAttachMenu: (show: boolean) => void;
  showPollCreator: boolean;
  setShowPollCreator: (show: boolean) => void;
  pollQuestion: string;
  setPollQuestion: (value: string) => void;
  pollOptions: string[];
  setPollOptions: (options: string[]) => void;
  handleCreatePoll: () => void;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  emojiPickerRef: React.RefObject<HTMLDivElement>;
  attachMenuRef: React.RefObject<HTMLDivElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const MessageInput = ({
  messageInput,
  setMessageInput,
  handleSendMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  isRecordingAudio,
  isRecordingVideo,
  recordingTime,
  stopRecording,
  startAudioRecording,
  startVideoRecording,
  formatRecordingTime,
  showAttachMenu,
  setShowAttachMenu,
  showPollCreator,
  setShowPollCreator,
  pollQuestion,
  setPollQuestion,
  pollOptions,
  setPollOptions,
  handleCreatePoll,
  handleFileSelect,
  emojiPickerRef,
  attachMenuRef,
  fileInputRef,
}: MessageInputProps) => {
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput(messageInput + emojiData.emoji);
  };

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
  }, [emojiPickerRef, attachMenuRef, setShowEmojiPicker, setShowAttachMenu]);

  if (isRecordingAudio || isRecordingVideo) {
    return (
      <div className="border-t bg-card p-4">
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
      </div>
    );
  }

  if (showPollCreator) {
    return (
      <div className="border-t bg-card p-4">
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
      </div>
    );
  }

  return (
    <div className="border-t bg-card p-4">
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
    </div>
  );
};

export default MessageInput;
