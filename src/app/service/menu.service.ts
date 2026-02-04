import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from './auth.service';

export interface MenuDto {
    id?: number;
    name: string;
    url: string;
    icon?: string;
    order: number;
    parentMenuId?: number | null;
    subMenus: MenuDto[];
}

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    private http = inject(HttpClient);
    private readonly baseUrl = 'https://localhost:44346/api/Menu';

    getMenus(): Observable<ApiResponse<MenuDto[]>> {
        return this.http.get<ApiResponse<MenuDto[]>>(this.baseUrl);
    }

    getMenu(id: number): Observable<ApiResponse<MenuDto>> {
        return this.http.get<ApiResponse<MenuDto>>(`${this.baseUrl}/${id}`);
    }

    createMenu(menu: MenuDto): Observable<ApiResponse<MenuDto>> {
        return this.http.post<ApiResponse<MenuDto>>(this.baseUrl, menu);
    }

    updateMenu(id: number, menu: MenuDto): Observable<ApiResponse<MenuDto>> {
        return this.http.put<ApiResponse<MenuDto>>(`${this.baseUrl}/${id}`, menu);
    }

    deleteMenu(id: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
    }
}
