import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment.development';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class Information {
  httpClient = inject(HttpClient);
  
  private baseUrl: string = `${environment.apiUrlBase}accounts/`;
  private baseUrlCats: string = `${environment.apiUrlBase}categories/`;
  
  getAccountInformation(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}`);
  }

  newAccount(payload: any): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}`, payload);
  }

  getAccountTransactions(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}${id}/transactions`);
  }

  getCategories(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrlCats}`);
  }

  getMonthlySummary(accountId: number, month: string): Observable<any> {
    const params = new HttpParams().set('month', month);
    return this.httpClient.get<any>(`${this.baseUrl}${accountId}/transactions/summary`, { params });
  }

  getSpendingByCategory(accountId: number, from: string, to: string): Observable<any> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.httpClient.get<any>(`${this.baseUrl}${accountId}/transactions/spending-by-category`, { params });
  }
}
