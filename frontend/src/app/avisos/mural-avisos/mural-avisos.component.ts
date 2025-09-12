import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvisosService, Aviso } from '../../../services/avisos.service';
import { Navbar2Component } from "../../../navbar2/navbar2.component";

@Component({
  selector: 'app-mural-avisos',
  standalone: true,
  imports: [CommonModule, Navbar2Component],
  templateUrl: './mural-avisos.component.html',
  styleUrl: './mural-avisos.component.scss'
})
export class MuralAvisosComponent implements OnInit {
  
  avisos: Aviso[] = [];
  loading = true;
  errorMessage = '';

  constructor(private avisosService: AvisosService) {}

  ngOnInit(): void {
    this.carregarAvisos();
  }

  qtdAvisos(): number {
    return this.avisos.length;

    }


  carregarAvisos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.avisosService.getAvisosAluno().subscribe({
      next: (avisos) => {
        this.avisos = avisos;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar avisos. Tente novamente.';
        this.loading = false;
        console.error('Erro:', error);
      }
    });
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

  formatarData(data: string): string {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isAvisoExpirado(aviso: Aviso): boolean {
    if (!aviso.dataExpiracao) return false;
    return new Date(aviso.dataExpiracao) < new Date();
  }

  recarregar(): void {
    this.carregarAvisos();
  }

  getTurmasNomes(turmas: { id: string; nome: string }[]): string {
    return turmas.map(t => t.nome).join(', ');
  }
}
