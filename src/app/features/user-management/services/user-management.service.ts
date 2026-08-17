import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserCreateRequest, UserUpdateRequest, UsersListResponse } from '../models/user.model';
import { API_CONFIG } from '../../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  constructor(private http: HttpClient) { }

  getUsers(page: number = 1, pageSize: number = 20, search?: string): Observable<UsersListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<UsersListResponse>(
      `${API_CONFIG.apiUrl}${API_CONFIG.endpoints.users}`,
      { params }
    );
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(
      `${API_CONFIG.apiUrl}${API_CONFIG.endpoints.users}/${id}`
    );
  }

  createUser(data: UserCreateRequest): Observable<User> {
    return this.http.post<User>(
      `${API_CONFIG.apiUrl}${API_CONFIG.endpoints.users}`,
      data
    );
  }

  updateUser(id: string, data: UserUpdateRequest): Observable<User> {
    return this.http.put<User>(
      `${API_CONFIG.apiUrl}${API_CONFIG.endpoints.users}/${id}`,
      data
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(
      `${API_CONFIG.apiUrl}${API_CONFIG.endpoints.users}/${id}`
    );
  }
}
