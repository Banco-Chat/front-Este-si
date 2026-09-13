import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { publicAuthGuard } from '@guards/public-auth-guard';
import { authGuard } from '@guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            },
            {
                path: 'home',
                title: 'Inicio',
                loadComponent: () => import('@home/home').then((c) => c.Home)
            },
            {
                path: 'bank-transactions',
                title: 'Movimientos',
                loadComponent: () => import('@bank-transactions/bank-transactions').then((c) => c.BankTransactions)
            },
            {
                path: 'assistant',
                title: 'Asistente',
                loadComponent: () => import('@assistant/assistant').then((c) => c.Assistant)
            },
            {
                path: 'savings-goals',
                title: 'Metas de ahorro',
                loadComponent: () => import('@savings-goals/savings-goals').then((c) => c.SavingsGoalsPage)
            },
            {
                path: 'budgets',
                title: 'Presupuestos',
                loadComponent: () => import('@budgets/budgets').then((c) => c.BudgetsPage)
            },
            {
                path: 'transfers',
                title: 'Transferencias',
                loadComponent: () => import('@transfers/transfers').then((c) => c.TransfersPage)
            }
        ]
    },
    {
        path: 'auth',
        component: AuthLayout,
        canActivate: [publicAuthGuard],
        children: [
            {
                path: 'login',
                title: 'Iniciar sesión',
                loadComponent: () => import('@auth/login/login').then((c) => c.Login)
            }
        ]
    }
];
