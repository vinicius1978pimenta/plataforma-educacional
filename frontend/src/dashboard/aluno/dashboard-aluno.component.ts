import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core'
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule} from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CardComponent } from './cards/card.component';
import { AvisosService, Aviso } from '../../services/avisos.service';
import { TranslocoModule, TranslocoPipe, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-dashboard-aluno',
  imports: [CommonModule, 
            RouterModule,
            NavbarComponent,
            SidebarComponent, 
            CardComponent,
            TranslocoModule,
            TranslocoPipe],

  templateUrl: './dashboard-aluno.component.html',
  styleUrls: ['./dashboard-aluno.component.scss']
})
export class DashboardAlunoComponent implements OnInit, OnDestroy {
  ultimosAvisos: Aviso[] = [];
  currentUser: any;

  // Propriedades do carrossel
  currentSlide = 0;
  carouselInterval: any;
  autoSlideDelay = 4000; // 4 segundos
  isHovered = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private avisosService: AvisosService,
    private  transloco: TranslocoService
  ) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
    
    this.carregarUltimosAvisos();
  }


    changeLanguage(lang: string) {
        this.transloco.setActiveLang(lang);
      }
    
      getCurrentLang() {
        return this.transloco.getActiveLang();
      }


  ngOnDestroy() {
    this.stopCarousel();
  }

  carregarUltimosAvisos(): void {
    this.avisosService.getAvisosAluno().subscribe({
      next: (avisos) => {
        const now = new Date();
        this.ultimosAvisos = avisos
          .filter(aviso => aviso.ativo && aviso.dataExpiracao && new Date(aviso.dataExpiracao) > now)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5); // Aumentado para 5 avisos no carrossel
        
        console.log('Avisos carregados:', this.ultimosAvisos.length);
        console.log('Avisos:', this.ultimosAvisos);
        
        if (this.ultimosAvisos.length > 1) {
          console.log('Iniciando carrossel...');
          this.startCarousel();
        } else {
          console.log('Carrossel não iniciado - apenas', this.ultimosAvisos.length, 'aviso(s)');
        }
      },
      error: (error) => {
        console.error('Erro ao carregar avisos:', error);
      }
    });
  }

  // Métodos do carrossel
  startCarousel() {
    this.stopCarousel();
    this.carouselInterval = setInterval(() => {
      if (!this.isHovered) {
        this.nextSlide();
      }
    }, this.autoSlideDelay);
  }

  stopCarousel() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.ultimosAvisos.length;
  }

  prevSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.ultimosAvisos.length - 1 : this.currentSlide - 1;
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
    const classes = {
      'CRITICA': 'prioridade-critica',
      'ALTA': 'prioridade-alta',
      'NORMAL': 'prioridade-normal',
      'BAIXA': 'prioridade-baixa'
    };
    return classes[prioridade as keyof typeof classes] || 'prioridade-normal';
  }

  getTipoIcon(tipo: string): string {
    const icons = {
      'GERAL': 'fas fa-info-circle',
      'URGENTE': 'fas fa-exclamation-triangle',
      'EVENTO': 'fas fa-calendar-alt',
      'LEMBRETE': 'fas fa-bell',
      'COMUNICADO': 'fas fa-bullhorn'
    };
    return icons[tipo as keyof typeof icons] || 'fas fa-info-circle';
  }

  getTipoLabel(tipo: string): string {
    const labels = {
      'GERAL': 'Geral',
      'URGENTE': 'Urgente',
      'EVENTO': 'Evento',
      'LEMBRETE': 'Lembrete',
      'COMUNICADO': 'Comunicado'
    };
    return labels[tipo as keyof typeof labels] || 'Geral';
  }

  getPrioridadeLabel(prioridade: string): string {
    const labels = {
      'CRITICA': 'Crítica',
      'ALTA': 'Alta',
      'NORMAL': 'Normal',
      'BAIXA': 'Baixa'
    };
    return labels[prioridade as keyof typeof labels] || 'Normal';
  }

  formatarDataRelativa(data: string): string {
    const agora = new Date();
    const dataAviso = new Date(data);
    const diffMs = agora.getTime() - dataAviso.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffHoras / 24);

    if (diffHoras < 1) {
      return 'Agora mesmo';
    } else if (diffHoras < 24) {
      return `${diffHoras}h atrás`;
    } else if (diffDias === 1) {
      return 'Ontem';
    } else if (diffDias < 7) {
      return `${diffDias} dias atrás`;
    } else {
      return dataAviso.toLocaleDateString('pt-BR');
    }
  }

  isAvisoExpirado(aviso: Aviso): boolean {
    if (!aviso.dataExpiracao) return false;
    return new Date(aviso.dataExpiracao) < new Date();
  }

  logout() {
    const sair = confirm("deseja realmente sair ?")
    if(sair){
      this.authService.logout();
      this.router.navigate(['/login']); 
    }
  }

  irParaMateriais() {
    this.router.navigate(['././materiais']);
  }
}