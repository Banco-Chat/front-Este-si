import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { handleApiError } from '@helpers/error.helper';
import { Auth } from '@services/auth';
import { Chat } from '@services/chat';
import { currentUser } from '@stores/auth.store';
import { chatSessions } from '@stores/chat.store';
import { catchError, of, take, tap } from 'rxjs';
import { Skeleton } from '@shared/components/skeleton/skeleton';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet, RouterModule, Skeleton],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  standalone: true,
})
export class MainLayout implements OnInit {
  authService = inject(Auth);
  chatService = inject(Chat);
  user = computed(() => currentUser());
  fechaHoy: string = '';
  saludo: string = '';

  isExpanded = signal<boolean>(true);
  mobileOpen = signal<boolean>(false);
  openSubmenu = signal<string | null>(null);
  loadingSessions = signal<boolean>(true);
  chatSessions = chatSessions;

  navItems = [
    {
      path: '/home',
      label: 'Inicio',
      icon: 'home'
    },
    {
      path: '/savings-goals',
      label: 'Metas de ahorro',
      icon: 'savingsGoals'
    },
    {
      path: '/budgets',
      label: 'Presupuestos',
      icon: 'budgets'
    },
    {
      path: '/transfers',
      label: 'Transferencias',
      icon: 'transfers'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    const hoy = new Date();

    const fecha = hoy.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const fechaCompleta = fecha.replace(/\sde\s/g, ' ');
    this.fechaHoy = this.capitalizar(fechaCompleta);

    const hora = hoy.getHours();

    if (hora >= 5 && hora < 12) {
      this.saludo = 'Buenos días';
    } else if (hora >= 12 && hora < 19) {
      this.saludo = 'Buenas tardes';
    } else {
      this.saludo = 'Buenas noches';
    }

    this.loadChatSessions();
  }

  private loadChatSessions() {
    this.chatService.getSessions().pipe(
      take(1),
      tap((response) => {
        if (response.success && Array.isArray(response.data)) {
          this.chatSessions.set(response.data);
        }
      }),
      catchError((error) => {
        handleApiError(error, 'No se pudieron cargar tus conversaciones.');
        return of(null);
      })
    ).subscribe({
      next: () => this.loadingSessions.set(false),
      error: () => this.loadingSessions.set(false)
    });
  }

  openSession(session: any) {
    this.closeOnMobile();
    this.router.navigate(['/assistant'], { queryParams: { session: session.id } });
  }

  toggleSidebar() {
    this.isExpanded.update(val => !val);
  }

  // Abre/cierra el cajón en móvil
  toggleMobileSidebar() {
    this.mobileOpen.update(val => !val);
    if (this.mobileOpen()) {
      this.isExpanded.set(true);
    }
  }

  closeMobileSidebar() {
    this.mobileOpen.set(false);
  }

  toggleSubmenu(path: string, event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.isExpanded()) {
      this.isExpanded.set(true);
      this.openSubmenu.set(path);
      return;
    }

    this.openSubmenu.update(current => current === path ? null : path);
  }

  isSubmenuOpen(path: string): boolean {
    return this.openSubmenu() === path;
  }

  closeOnMobile() {
    if (window.innerWidth < 1024) {
      this.mobileOpen.set(false);
    }
  }

  capitalizar(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  onLogout() {
    this.authService.clearSession();
  }

  goToAssistant() {
    this.closeOnMobile();
    this.router.navigate(['/assistant'], { queryParams: { new: 1 } });
  }

  isAssistantRoute(): boolean {
    return this.router.url.split('?')[0] === '/assistant';
  }

  isActiveSession(sessionId: number): boolean {
    const [, queryString] = this.router.url.split('?');
    if (!queryString) return false;

    return new URLSearchParams(queryString).get('session') === String(sessionId);
  }
}