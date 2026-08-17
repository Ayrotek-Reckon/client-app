import { Injectable } from '@angular/core';

/**
 * There is no settings/preferences/profile backend endpoint.
 * auth-service only exposes /login, /register, /refresh and /logout —
 * UserService.changePassword() exists server-side but is never wired to a
 * controller route, and there is no user-preferences storage at all.
 *
 * This service is intentionally left as a stub until that backend surface
 * exists; the settings pages read the JWT-derived profile from AuthService
 * instead of calling non-existent endpoints.
 */
@Injectable({
  providedIn: 'root'
})
export class SettingsService { }
