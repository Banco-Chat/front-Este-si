import { signal } from "@angular/core";

export const currentUser = signal<any | null>(null);

export const userAccounts = signal<any[]>([]);

export const appReady = signal<boolean>(false);

export const userInfoLoading = signal<boolean>(true);