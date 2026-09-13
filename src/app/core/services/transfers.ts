import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment.development';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class Transfers {
  httpClient = inject(HttpClient);

  private baseUrl: string = `${environment.apiUrlBase}transfers/`;

  getAll(): Observable<any> {
    return this.httpClient.get<any>(`${this.baseUrl}`);
  }

  create(payload: { fromAccountId: number; toAccountId: number; amount: number; description?: string }): Observable<any> {
    return this.httpClient.post<any>(`${this.baseUrl}`, payload);
  }
}
