import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class Chat {
  httpClient = inject(HttpClient);

  private baseUrl: string = `${environment.apiUrlBase}chat/`;

  createSession(): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}sessions`, {});
  }

  getSessions(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}sessions`);
  }

  getMessages(sessionId: number): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}sessions/${sessionId}/messages`);
  }

  sendMessage(sessionId: number, content: string): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}sessions/${sessionId}/messages`, { content });
  }
}
