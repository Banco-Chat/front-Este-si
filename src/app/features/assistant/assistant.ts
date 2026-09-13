import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, afterRenderEffect, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { handleApiError } from '@helpers/error.helper';
import { Chat } from '@services/chat';
import { Chatbubble } from '@shared/components/chatbubble/chatbubble';
import { InlineSpinner } from '@shared/components/inline-spinner/inline-spinner';
import { Skeleton } from '@shared/components/skeleton/skeleton';
import { chatSessions as chatSessionsStore } from '@stores/chat.store';
import { catchError, of, take, tap } from 'rxjs';
import { A2uiBlock } from './a2ui/a2ui-block';

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Chatbubble, A2uiBlock, Skeleton, InlineSpinner],
  styleUrl: './assistant.css',
  templateUrl: './assistant.html',
})
export class Assistant implements OnInit {
  private fb = inject(FormBuilder);
  private chatService = inject(Chat);
  private route = inject(ActivatedRoute);

  chatForm = this.fb.group({
    prompt: ['', Validators.required]
  });

  chatHistory = signal<Array<any>>([]);
  isStreaming = signal<boolean>(false);
  startingSession = signal<boolean>(true);
  activeSession = signal<any | null>(null);

  private sessionId: number | null = null;
  private queryInitialized = false;
  private lastQuerySessionId: number | null = null;

  private scrollContainer = viewChild<ElementRef<HTMLElement>>('scrollContainer');

  constructor() {
    afterRenderEffect(() => {
      this.chatHistory();
      this.isStreaming();

      const el = this.scrollContainer()?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      const sessionParam = params.get('session');
      const querySessionId = sessionParam ? Number(sessionParam) : null;

      if (this.queryInitialized && querySessionId === this.lastQuerySessionId) return;

      this.queryInitialized = true;
      this.lastQuerySessionId = querySessionId;
      this.sessionId = null;
      this.chatHistory.set([]);
      this.startingSession.set(true);
      this.activeSession.set(null);

      if (querySessionId) {
        this.loadExistingSession(querySessionId);
      } else {
        this.createNewSession();
      }
    });
  }

  sendMessage() {
    if (this.chatForm.invalid || this.isStreaming() || this.startingSession()) return;

    const userText = (this.chatForm.value.prompt || '').trim();
    if (!userText) return;

    this.chatForm.reset();
    this.submitMessage(userText);
  }

  onA2uiAction(message: string) {
    if (this.isStreaming() || this.startingSession()) return;
    this.submitMessage(message);
  }

  private createNewSession() {
    this.chatService.createSession().pipe(
      take(1),
      tap((response) => {
        if (response.success && response.data) {
          this.sessionId = response.data.id;
          this.activeSession.set(response.data);
          chatSessionsStore.update(list => [response.data, ...list]);
        }
      }),
      catchError((error) => {
        handleApiError(error, 'No se pudo iniciar la sesión del asistente.');
        return of(null);
      })
    ).subscribe({
      next: () => this.startingSession.set(false),
      error: () => this.startingSession.set(false)
    });
  }

  private loadExistingSession(sessionId: number) {
    this.sessionId = sessionId;
    this.activeSession.set(chatSessionsStore().find(session => session.id === sessionId) || { id: sessionId });

    this.chatService.getMessages(sessionId).pipe(
      take(1),
      tap((response) => {
        if (response.success && Array.isArray(response.data)) {
          this.chatHistory.set(this.mapMessagesToHistory(response.data));
        }
      }),
      catchError((error) => {
        handleApiError(error, 'No se pudo cargar la conversación.');
        return of(null);
      })
    ).subscribe({
      next: () => this.startingSession.set(false),
      error: () => this.startingSession.set(false)
    });
  }

  private submitMessage(userText: string) {
    if (!this.sessionId) return;

    this.chatHistory.update(history => [
      ...history,
      { type: 'text', direction: 'outgoing', content: userText }
    ]);

    this.isStreaming.set(true);

    this.chatService.sendMessage(this.sessionId, userText).pipe(
      take(1),
      tap((response) => {
        if (response.success && response.data) {
          this.chatHistory.update(history => [...history, ...this.buildAssistantEntries(response.data)]);
        }
      }),
      catchError((error) => {
        handleApiError(error, 'Ocurrió un error al procesar tu solicitud.');
        this.chatHistory.update(h => [
          ...h,
          { type: 'text', direction: 'incoming', content: 'Ocurrió un error al procesar tu solicitud.' }
        ]);
        return of(null);
      })
    ).subscribe(() => {
      this.isStreaming.set(false);
    });
  }

  private mapMessagesToHistory(messages: any[]): any[] {
    const history: any[] = [];

    for (const message of messages) {
      if (message.role === 'USER') {
        history.push({ type: 'text', direction: 'outgoing', content: message.content });
      } else if (message.role === 'ASSISTANT') {
        history.push(...this.buildAssistantEntries(message));
      }
    }

    return history;
  }

  private buildAssistantEntries(message: { content?: string; uiSchema?: Array<{ component: string; props: any }> | null }): any[] {
    const entries: any[] = [];

    if (message.content) {
      entries.push({ type: 'text', direction: 'incoming', content: message.content });
    }

    if (Array.isArray(message.uiSchema)) {
      for (const block of message.uiSchema) {
        entries.push({
          type: 'ui-block',
          direction: 'incoming',
          componentType: block.component,
          props: block.props || {}
        });
      }
    }

    return entries;
  }
}
