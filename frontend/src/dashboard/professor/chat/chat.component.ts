import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AblyService } from '../../../services/ably.service';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { Navbar2Component } from '../../../navbar2/navbar2.component';

export interface User {
  id: string;
  name: string;
  type: 'professor' | 'aluno' | 'responsavel';
  avatar?: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderType: 'professor' | 'aluno' | 'responsavel';
  timestamp: Date;
  channelId: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  participants: User[];
  lastMessage?: Message;
}

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, RouterModule, Navbar2Component],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('nameInput') private nameInput!: ElementRef;

  currentUser: User | null = null;
  selectedChannel: string = '';
  messages: Message[] = [];
  newMessage: string = '';

  // Propriedades do Modal
  showNameModal: boolean = false;
  tempUserName: string = '';
  selectedUserType: 'professor' | 'aluno' | 'responsavel' = 'professor';

  private shouldScrollToBottom = false;
  private messagesSub?: Subscription;

  constructor(private ablyService: AblyService) {}

  ngOnInit(): void {
    this.messagesSub = this.ablyService.messages$.subscribe(messages => {
      const newMessages = messages.filter(m => m.channelId === this.selectedChannel);

      // Adiciona apenas mensagens que ainda não estão no array
      newMessages.forEach(msg => {
        if (!this.messages.find(m => m.id === msg.id)) {
          this.messages.push(msg);
        }
      });

      this.shouldScrollToBottom = true;
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }

    // Foca no input do modal quando ele é aberto
    if (this.showNameModal && this.nameInput) {
      setTimeout(() => {
        this.nameInput.nativeElement.focus();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    if (this.currentUser && this.selectedChannel) {
      this.ablyService.leaveChannel(this.selectedChannel);
    }
    this.messagesSub?.unsubscribe();
  }

  // Método para abrir o modal
  openNameModal(type: 'professor' | 'aluno' | 'responsavel'): void {
    this.selectedUserType = type;
    this.tempUserName = '';
    this.showNameModal = true;
  }

  // Método para fechar o modal
  closeModal(): void {
    this.showNameModal = false;
    this.tempUserName = '';
  }

  // Método para confirmar o nome do usuário
  confirmUserName(): void {
    if (this.tempUserName && this.tempUserName.trim()) {
      this.currentUser = {
        id: this.generateUserId(),
        name: this.tempUserName.trim(),
        type: this.selectedUserType
      };
      this.closeModal();
    }
  }

  getUserTypeLabel(type: string): string {
    const labels = {
      professor: 'Professor',
      aluno: 'Aluno',
      responsavel: 'Responsável'
    };
    return labels[type as keyof typeof labels] || type;
  }

  getUserAvatar(type: string): string {
    const avatars = {
      professor: '👨‍🏫',
      aluno: '👨‍🎓',
      responsavel: '👨‍👩‍👧‍👦'
    };
    return avatars[type as keyof typeof avatars] || '👤';
  }

  getAvailableChannels() {
  if (!this.currentUser) return [];

  const channels = [];

  if (this.currentUser.type === 'professor') {
    channels.push(
      { id: 'professor-aluno', name: '💬 Conversa com Alunos' },
      { id: 'professor-responsavel', name: '💬 Conversa com Responsáveis' }
    );
  } else if (this.currentUser.type === 'aluno') {
    channels.push(
      { id: 'professor-aluno', name: '💬 Conversa com Professor' }
    );
  } else if (this.currentUser.type === 'responsavel') {
    channels.push(
      { id: 'professor-responsavel', name: '💬 Conversa com Professor' }
    );
  }

  return channels;
}
  onChannelChange(): void {
    if (this.selectedChannel) {
      this.ablyService.clearMessages();
      this.ablyService.subscribeToChannel(this.selectedChannel);

      if (this.currentUser) {
        this.ablyService.enterChannel(this.selectedChannel, this.currentUser);
      }
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.currentUser || !this.selectedChannel) {
      return;
    }

    this.ablyService.sendMessage(this.selectedChannel, {
      content: this.newMessage.trim(),
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      senderType: this.currentUser.type
    });

    this.newMessage = '';
  }

  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  logout(): void {
    if (this.selectedChannel) {
      this.ablyService.leaveChannel(this.selectedChannel);
    }
    this.currentUser = null;
    this.selectedChannel = '';
    this.messages = [];
    this.ablyService.clearMessages();
  }

  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }
}