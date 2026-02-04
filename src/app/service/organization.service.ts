import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from './auth.service';

export interface OrganizationDto {
    id?: number;
    organizationCode: string;
    organizationName: string;
    parentId?: number | null;
    subOrganizations?: OrganizationDto[];
}

@Injectable({
    providedIn: 'root'
})
export class OrganizationService {
    private http = inject(HttpClient);
    private readonly baseUrl = 'https://localhost:44346/api/Organization';

    getOrganizations(): Observable<ApiResponse<OrganizationDto[]>> {
        return this.http.get<ApiResponse<OrganizationDto[]>>(this.baseUrl);
    }

    getOrganization(id: number): Observable<ApiResponse<OrganizationDto>> {
        return this.http.get<ApiResponse<OrganizationDto>>(`${this.baseUrl}/${id}`);
    }

    createOrganization(org: OrganizationDto): Observable<ApiResponse<OrganizationDto>> {
        return this.http.post<ApiResponse<OrganizationDto>>(this.baseUrl, org);
    }

    updateOrganization(id: number, org: OrganizationDto): Observable<ApiResponse<OrganizationDto>> {
        return this.http.put<ApiResponse<OrganizationDto>>(`${this.baseUrl}/${id}`, org);
    }

    deleteOrganization(id: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
    }
}
