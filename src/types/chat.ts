export interface Contact {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen?: string;
}

export interface PollOption {
  id: number;
  text: string;
  votes: number;
}

export interface Message {
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

export interface Chat {
  id: number;
  contact: Contact;
  lastMessage: string;
  time: string;
  unread: number;
  messages: Message[];
}
