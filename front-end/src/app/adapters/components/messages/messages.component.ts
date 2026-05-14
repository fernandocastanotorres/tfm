import { Component, OnInit } from '@angular/core';
import { MessagesService, MessageThread } from '../../../application/services/messages.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: []
})
export class MessagesComponent implements OnInit {
  threads: MessageThread[] = [];
  selectedThread: MessageThread | null = null;
  reply = '';

  constructor(private readonly messagesService: MessagesService) {}

  ngOnInit(): void {
    this.threads = this.messagesService.getThreads();
    this.selectedThread = this.threads[0] ?? null;
  }

  selectThread(thread: MessageThread): void {
    this.selectedThread = thread;
  }

  sendReply(): void {
    this.reply = '';
  }
}
