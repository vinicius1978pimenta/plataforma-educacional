import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as Ably from 'ably';
import { Message, User } from '../dashboard/professor/chat/chat.component';

@Injectable({
  providedIn: 'root'
})
export class AblyService {
  private ably: Ably.Realtime;
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private connectedUsersSubject = new BehaviorSubject<User[]>([]);
  
  public messages$ = this.messagesSubject.asObservable();
  public connectedUsers$ = this.connectedUsersSubject.asObservable();
  
  constructor() {
    this.ably = new Ably.Realtime({
      key: 'pa4EuA.285oEg:iU0GvDQR94g74VlRBGfcf0dQYCkcFcLR9UWD3A0_Usc',
      clientId: this.generateClientId()
    });
    
    this.setupConnection();
  }
  
  private generateClientId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }
  
  private setupConnection(): void {
    this.ably.connection.on('connected', () => {
      console.log('Conectado ao Ably!');
    });
    
    this.ably.connection.on('failed', (error) => {
      console.error('Falha na conexão com Ably:', error);
    });
  }
  
  subscribeToChannel(channelName: string): void {
    const channel = this.ably.channels.get(channelName);
    
    channel.subscribe('message', (message) => {
      const newMessage: Message = {
        id: message.id || Date.now().toString(),
        content: message.data.content,
        senderId: message.data.senderId,
        senderName: message.data.senderName,
        senderType: message.data.senderType,
        timestamp: new Date(message.timestamp),
        channelId: channelName
      };
      
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, newMessage]);
    });
    
    // Subscrever a presença de usuários
    channel.presence.subscribe('enter', (member) => {
      console.log('Usuário entrou:', member.data);
      this.updateConnectedUsers();
    });
    
    channel.presence.subscribe('leave', (member) => {
      console.log('Usuário saiu:', member.data);
      this.updateConnectedUsers();
    });
  }
  
  sendMessage(channelName: string, message: Omit<Message, 'id' | 'timestamp' | 'channelId'>): void {
    const channel = this.ably.channels.get(channelName);
    channel.publish('message', {
      content: message.content,
      senderId: message.senderId,
      senderName: message.senderName,
      senderType: message.senderType
    });
  }
  
  enterChannel(channelName: string, user: User): void {
    const channel = this.ably.channels.get(channelName);
    channel.presence.enter(user);
  }
  
  leaveChannel(channelName: string): void {
    const channel = this.ably.channels.get(channelName);
    channel.presence.leave();
  }
  
  private updateConnectedUsers(): void {
    // Implementar lógica para atualizar lista de usuários conectados
    // Por simplicidade, manter vazio por enquanto
    this.connectedUsersSubject.next([]);
  }
  
  clearMessages(): void {
    this.messagesSubject.next([]);
  }
}