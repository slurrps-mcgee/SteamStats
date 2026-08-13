import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, defer, from } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { defaultPolicy } from './resilience.service';

export type ApiOptions = {
    path: string; // path under api_base (e.g. /profile/:steamId)
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    params?: Record<string, any>;
    headers?: Record<string, string>;
};

const API_BASE_URL = '/api/v1';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private http = inject(HttpClient);

    request<T = any>(opts: ApiOptions): Observable<T> {
        const url = `${API_BASE_URL}${opts.path.startsWith('/') ? '' : '/'}${opts.path}`;
        const headers = new HttpHeaders(opts.headers || {});

        let params = new HttpParams();
        if (opts.params) {
            Object.keys(opts.params).forEach(k => {
                const v = opts.params![k];
                if (v !== undefined && v !== null) params = params.set(k, String(v));
            });
        }

        const method = (opts.method || 'GET').toUpperCase();

        // Create a fresh HttpClient call per attempt so cockatiel can retry failed responses
        const runOnce = () => {
            switch (method) {
                case 'GET':
                    return firstValueFrom(this.http.get<T>(url, { headers, params }));
                case 'POST':
                    return firstValueFrom(this.http.post<T>(url, opts.body, { headers, params }));
                case 'PUT':
                    return firstValueFrom(this.http.put<T>(url, opts.body, { headers, params }));
                case 'PATCH':
                    return firstValueFrom(this.http.patch<T>(url, opts.body, { headers, params }));
                case 'DELETE':
                    return firstValueFrom(this.http.delete<T>(url, { headers, params }));
                default:
                    return Promise.reject(new Error(`Unsupported method ${method}`));
            }
        };

        return defer(() => from(defaultPolicy.execute(() => runOnce())));
    }
}
