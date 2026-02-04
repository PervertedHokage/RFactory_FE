import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from './auth.service';

export interface UserDto {
    id?: number;
    loginName: string;
    password?: string;
    fullName: string;
    email: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private http = inject(HttpClient);
    private readonly baseUrl = 'https://localhost:44346/api/UserManagement';

    getUsers(): Observable<ApiResponse<UserDto[]>> {
        return this.http.get<ApiResponse<UserDto[]>>(this.baseUrl);
    }

    getUser(id: number): Observable<ApiResponse<UserDto>> {
        return this.http.get<ApiResponse<UserDto>>(`${this.baseUrl}/${id}`);
    }

    createUser(user: UserDto): Observable<ApiResponse<UserDto>> {
        return this.http.post<ApiResponse<UserDto>>(this.baseUrl, user);
    }

    updateUser(id: number, user: UserDto): Observable<ApiResponse<UserDto>> {
        return this.http.put<ApiResponse<UserDto>>(`${this.baseUrl}/${id}`, user);
    }

    deleteUser(id: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
    }
}
