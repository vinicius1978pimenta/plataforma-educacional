import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AblyService } from '../../../services/ably.service';
import { Message, User } from '../../professor/chat/chat.component';

@Component({
  selector: 'app-chat-responsavel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat-responsavel.component.html',
  styleUrls: ['./chat-responsavel.component.scss']
})
export class ChatResponsavelComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  currentUser: User | null = null;
  selectedChannel: string = '';
  messages: Message[] = [];
  newMessage: string = '';

  private shouldScrollToBottom = false;
  private messagesSub?: Subscription;

  constructor(private ablyService: AblyService) {}

  ngOnInit(): void {
    this.messagesSub = this.ablyService.messages$.subscribe(messages => {
      const newMessages = messages.filter(m => m.channelId === this.selectedChannel);

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
  }

  ngOnDestroy(): void {
    if (this.selectedChannel) {
      this.ablyService.leaveChannel(this.selectedChannel);
    }
    this.messagesSub?.unsubscribe();
  }

  selectUser(type: 'professor' | 'aluno' | 'responsavel'): void {
    const name = prompt(`Digite seu nome como ${this.getUserTypeLabel(type)}:`);
    if (name && name.trim()) {
      this.currentUser = {
        id: this.generateUserId(),
        name: name.trim(),
        type: type
      };
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
      channels.push({ id: 'professor-aluno', name: '💬 Conversa com Professor' });
    } else if (this.currentUser.type === 'responsavel') {
      channels.push({ id: 'professor-responsavel', name: '💬 Conversa com Professor' });
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
    if (!this.newMessage.trim() || !this.currentUser || !this.selectedChannel) return;

    this.ablyService.sendMessage(this.selectedChannel, {
      content: this.newMessage.trim(),
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      senderType: this.currentUser.type
    });

    this.newMessage = '';
  }

  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  logout(): void {
    if (this.selectedChannel) this.ablyService.leaveChannel(this.selectedChannel);
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
