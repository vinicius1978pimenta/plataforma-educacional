import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CardComponent } from './cards/card.component';
import { AuthService } from '../../services/auth.service';
import { AvisosService, Aviso } from '../../services/avisos.service';
import { TranslocoModule, TranslocoService, TranslocoPipe } from '@ngneat/transloco';

@Component({
  selector: 'app-dahsboard-responsaveis',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    SidebarComponent,
    CardComponent,
    TranslocoModule,
    TranslocoPipe
  ],
  templateUrl: './dahsboard-responsaveis.component.html',
  styleUrls: ['./dahsboard-responsaveis.component.scss']
})
export class DahsboardResponsaveisComponent implements OnInit, OnDestroy {
  currentUser: any;

  // Dados do mural
  ultimosAvisos: Aviso[] = [];

  // Carrossel
  currentSlide = 0;
  carouselInterval: any;
  autoSlideDelay = 4000; // ms
  isHovered = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private avisosService: AvisosService,
    private transloco: TranslocoService
  ) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) this.currentUser = JSON.parse(userData);

    this.carregarUltimosAvisos();
  }

  ngOnDestroy(): void {
    this.stopCarousel();
  }

  // i18n util
  changeLanguage(lang: string) {
    this.transloco.setActiveLang(lang);
  }
  getCurrentLang() {
    return this.transloco.getActiveLang();
  }

  // Logout / navegação
  logout() {
    const sair = confirm('deseja realmente sair ?');
    if (sair) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  irParaMateriais() {
    this.router.navigate(['/materiais']);
  }

  // ----- Avisos + carrossel -----
carregarUltimosAvisos(): void {
  this.avisosService.getAvisosResponsavel().subscribe({
    next: (avisos) => {
      const now = new Date();
      this.ultimosAvisos = (avisos || [])
        .filter(a => a.ativo && a.dataExpiracao && new Date(a.dataExpiracao) > now)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      if (this.ultimosAvisos.length > 1) this.startCarousel();
    },
    error: (err) => {
      console.error('Erro ao carregar avisos (responsável):', err);
      this.ultimosAvisos = []; // evita quebrar o *ngIf
    }
  });
}

  startCarousel() {
    this.stopCarousel();
    this.carouselInterval = setInterval(() => {
      if (!this.isHovered) this.nextSlide();
    }, this.autoSlideDelay);
  }

  stopCarousel() {
    if (this.carouselInterval) clearInterval(this.carouselInterval);
  }

  nextSlide() {
    if (!this.ultimosAvisos.length) return;
    this.currentSlide = (this.currentSlide + 1) % this.ultimosAvisos.length;
  }

  prevSlide() {
    if (!this.ultimosAvisos.length) return;
    this.currentSlide =
      this.currentSlide === 0 ? this.ultimosAvisos.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  onCarouselMouseEnter() {
    this.isHovered = true;
  }

  onCarouselMouseLeave() {
    this.isHovered = false;
  }

  getPrioridadeClass(prioridade: string): string {
    const classes: Record<string, string> = {
      CRITICA: 'prioridade-critica',
      ALTA: 'prioridade-alta',
      NORMAL: 'prioridade-normal',
      BAIXA: 'prioridade-baixa'
    };
    return classes[prioridade] || 'prioridade-normal';
  }

  getTipoIcon(tipo: string): string {
    const icons: Record<string, string> = {
      GERAL: 'fas fa-info-circle',
      URGENTE: 'fas fa-exclamation-triangle',
      EVENTO: 'fas fa-calendar-alt',
      LEMBRETE: 'fas fa-bell',
      COMUNICADO: 'fas fa-bullhorn'
    };
    return icons[tipo] || 'fas fa-info-circle';
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      GERAL: 'Geral',
      URGENTE: 'Urgente',
      EVENTO: 'Evento',
      LEMBRETE: 'Lembrete',
      COMUNICADO: 'Comunicado'
    };
    return labels[tipo] || 'Geral';
  }

  getPrioridadeLabel(prioridade: string): string {
    const labels: Record<string, string> = {
      CRITICA: 'Crítica',
      ALTA: 'Alta',
      NORMAL: 'Normal',
      BAIXA: 'Baixa'
    };
    return labels[prioridade] || 'Normal';
  }

  formatarDataRelativa(data: string): string {
    const agora = new Date();
    const dataAviso = new Date(data);
    const diffMs = agora.getTime() - dataAviso.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffHoras / 24);

    if (diffHoras < 1) return 'Agora mesmo';
    if (diffHoras < 24) return `${diffHoras}h atrás`;
    if (diffDias === 1) return 'Ontem';
    if (diffDias < 7) return `${diffDias} dias atrás`;
    return dataAviso.toLocaleDateString('pt-BR');
  }

  isAvisoExpirado(aviso: Aviso): boolean {
    if (!aviso.dataExpiracao) return false;
    return new Date(aviso.dataExpiracao) < new Date();
  }
}
