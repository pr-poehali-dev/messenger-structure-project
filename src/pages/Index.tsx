import { useState, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import MessageInput from '@/components/MessageInput';
import StorageView from '@/components/StorageView';
import { Chat, Contact, Message } from '@/types/chat';

const Index = () => {
  const [activeView, setActiveView] = useState<'chats' | 'contacts' | 'profile' | 'settings'>('chats');
  const [showStorageView, setShowStorageView] = useState(false);
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
      {!showStorageView ? (
        <>
          <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            chats={chats}
            contacts={contacts}
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
            onShowStorage={() => setShowStorageView(true)}
          />

          <div className="flex-1 flex flex-col bg-background">
            {currentChat ? (
              <>
                <ChatWindow
                  currentChat={currentChat}
                  formatRecordingTime={formatRecordingTime}
                  handleVotePoll={handleVotePoll}
                />
                <MessageInput
                  messageInput={messageInput}
                  setMessageInput={setMessageInput}
                  handleSendMessage={handleSendMessage}
                  showEmojiPicker={showEmojiPicker}
                  setShowEmojiPicker={setShowEmojiPicker}
                  isRecordingAudio={isRecordingAudio}
                  isRecordingVideo={isRecordingVideo}
                  recordingTime={recordingTime}
                  stopRecording={stopRecording}
                  startAudioRecording={startAudioRecording}
                  startVideoRecording={startVideoRecording}
                  formatRecordingTime={formatRecordingTime}
                  showAttachMenu={showAttachMenu}
                  setShowAttachMenu={setShowAttachMenu}
                  showPollCreator={showPollCreator}
                  setShowPollCreator={setShowPollCreator}
                  pollQuestion={pollQuestion}
                  setPollQuestion={setPollQuestion}
                  pollOptions={pollOptions}
                  setPollOptions={setPollOptions}
                  handleCreatePoll={handleCreatePoll}
                  handleFileSelect={handleFileSelect}
                  emojiPickerRef={emojiPickerRef}
                  attachMenuRef={attachMenuRef}
                  fileInputRef={fileInputRef}
                />
              </>
            ) : (
              <ChatWindow
                currentChat={undefined}
                formatRecordingTime={formatRecordingTime}
                handleVotePoll={handleVotePoll}
              />
            )}
          </div>
        </>
      ) : (
        <div className="w-full max-w-2xl mx-auto bg-card">
          <StorageView 
            chats={chats} 
            onBack={() => setShowStorageView(false)} 
          />
        </div>
      )}
    </div>
  );
};

export default Index;