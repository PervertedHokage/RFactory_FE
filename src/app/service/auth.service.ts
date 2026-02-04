import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface ApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string | null;
    data: T;
    errors: any;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private readonly baseUrl = 'https://localhost:44346/api'; // Based on Swagger screenshot

    login(payload: any): Observable<ApiResponse<string>> {
        return this.http.post<ApiResponse<string>>(`${this.baseUrl}/Auth/login`, payload);
    }
}
