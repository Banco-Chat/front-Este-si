import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment.development';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class SavingsGoals {
  httpClient = inject(HttpClient);

  private baseUrl: string = `${environment.apiUrlBase}`;

  getByAccount(accountId: number): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}accounts/${accountId}/savings-goals`);
  }

  create(accountId: number, payload: { name: string; targetAmount: number }): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}accounts/${accountId}/savings-goals`, payload);
  }

  update(id: number, payload: { name?: string; targetAmount?: number }): Observable<any> {
    return this.httpClient.patch<any>(`${this.baseUrl}savings-goals/${id}`, payload);
  }

  contribute(id: number, amount: number): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}savings-goals/${id}/contribute`, { amount });
  }
}
