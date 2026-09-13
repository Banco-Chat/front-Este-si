import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class Budgets {
  httpClient = inject(HttpClient);

  private baseUrl: string = `${environment.apiUrlBase}`;

  getByAccount(accountId: number): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}accounts/${accountId}/budgets`);
  }

  create(accountId: number, payload: { categoryId: number; limitAmount: number; startPeriod: string; endPeriod: string }): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}accounts/${accountId}/budgets`, payload);
  }

  update(id: number, payload: Partial<{ categoryId: number; limitAmount: number; startPeriod: string; endPeriod: string }>): Observable<any> {
    return this.httpClient.patch<any>(`${this.baseUrl}budgets/${id}`, payload);
  }

  delete(id: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.baseUrl}budgets/${id}`);
  }

  getStatus(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}budgets/${id}/status`);
  }
}
