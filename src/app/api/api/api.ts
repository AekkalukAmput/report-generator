export * from './app.service';
import { AppApi } from './app.service';
export * from './auth.service';
import { AuthApi } from './auth.service';
export * from './users.service';
import { UsersApi } from './users.service';
export const APIS = [AppApi, AuthApi, UsersApi];
