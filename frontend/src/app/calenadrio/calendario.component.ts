import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Navbar2Component } from '../../navbar2/navbar2.component';
import { Aviso, AvisosService } from '../../services/avisos.service';

interface DiaCalendario {
  data: Date;
  dia: number;
  mesAtual: boolean;
  avisos: Aviso[];
  temAvisos: boolean;
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, Navbar2Component],
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.scss'
})
export class CalendarioComponent implements OnInit {
  mesAtual: Date = new Date();
  diasCalendario: DiaCalendario[] = [];
  avisos: Aviso[] = [];
  loading = false;
  diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  modalAberto = false;
  avisosDoDia: Aviso[] = [];
  dataSelecionada: Date | null = null;

  constructor(
    private avisosService: AvisosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarAvisosDoMesAtual();
  }

  carregarAvisosDoMesAtual(): void {
    this.loading = true;
    const ano = this.mesAtual.getFullYear();
    const mes = this.mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const dataInicio = primeiroDia.toISOString().split('T')[0];
    const dataFim = ultimoDia.toISOString().split('T')[0];

    this.avisosService.getAvisosPorPeriodo(dataInicio, dataFim).subscribe({
      next: (avisos) => {
        this.avisos = avisos;
        this.gerarCalendario();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar avisos:', error);
        this.loading = false;
      }
    });
  }

  gerarCalendario(): void {
    const ano = this.mesAtual.getFullYear();
    const mes = this.mesAtual.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const inicioCalendario = new Date(primeiroDia);
    inicioCalendario.setDate(primeiroDia.getDate() - primeiroDia.getDay());
    const fimCalendario = new Date(ultimoDia);
    fimCalendario.setDate(ultimoDia.getDate() + (6 - ultimoDia.getDay()));

    this.diasCalendario = [];
    const dataAtual = new Date(inicioCalendario);

    while (dataAtual <= fimCalendario) {
      const avisosDoDia = this.getAvisosDoDia(dataAtual);
      this.diasCalendario.push({
        data: new Date(dataAtual),
        dia: dataAtual.getDate(),
        mesAtual: dataAtual.getMonth() === mes,
        avisos: avisosDoDia,
        temAvisos: avisosDoDia.length > 0,
      });
      dataAtual.setDate(dataAtual.getDate() + 1);
    }
  }

  getAvisosDoDia(data: Date): Aviso[] {
    const diaCalendario = new Date(data);
    diaCalendario.setHours(0, 0, 0, 0);

    return this.avisos.filter(aviso => {
      if (aviso.dataExpiracao) {
        const dataExpiracao = new Date(aviso.dataExpiracao);
        dataExpiracao.setHours(0, 0, 0, 0);
        return diaCalendario.getTime() === dataExpiracao.getTime();
      } else {
        const dataInicio = new Date(aviso.dataInicio);
        dataInicio.setHours(0, 0, 0, 0);
        return diaCalendario.getTime() === dataInicio.getTime();
      }
    });
  }

  mesAnterior(): void {
    this.mesAtual.setMonth(this.mesAtual.getMonth() - 1);
    this.carregarAvisosDoMesAtual();
  }

  proximoMes(): void {
    this.mesAtual.setMonth(this.mesAtual.getMonth() + 1);
    this.carregarAvisosDoMesAtual();
  }

  voltarHoje(): void {
    this.mesAtual = new Date();
    this.carregarAvisosDoMesAtual();
  }

  clicouNoDia(diaCalendario: DiaCalendario): void {
    if (diaCalendario.temAvisos) {
      this.dataSelecionada = diaCalendario.data;
      this.avisosDoDia = diaCalendario.avisos;
      this.modalAberto = true;
    }
  }

  fecharModal(): void {
    this.modalAberto = false;
    this.avisosDoDia = [];
    this.dataSelecionada = null;
  }

  formatarData(data: Date): string {
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatarDataString(dataStr: string): string {
    if (!dataStr) return '';
    return this.formatarData(new Date(dataStr));
  }

  formatarDataCompleta(data: Date): string {
    return data.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  }

  getTipoLabel(tipo: string): string {
    const tipos: { [key: string]: string } = { 'GERAL': 'Geral', 'URGENTE': 'Urgente', 'EVENTO': 'Evento', 'LEMBRETE': 'Lembrete', 'COMUNICADO': 'Comunicado' };
    return tipos[tipo] || tipo;
  }

  getPrioridadeLabel(prioridade: string): string {
    const prioridades: { [key: string]: string } = { 'BAIXA': 'Baixa', 'NORMAL': 'Normal', 'ALTA': 'Alta', 'CRITICA': 'Crítica' };
    return prioridades[prioridade] || prioridade;
  }

  getPrioridadeClass(prioridade: string): string {
    switch (prioridade) {
      case 'CRITICA': return 'prioridade-critica';
      case 'ALTA': return 'prioridade-alta';
      case 'NORMAL': return 'prioridade-normal';
      case 'BAIXA': return 'prioridade-baixa';
      default: return 'prioridade-normal';
    }
  }

  getTipoClass(tipo: string): string {
    switch (tipo) {
      case 'URGENTE': return 'tipo-urgente';
      case 'EVENTO': return 'tipo-evento';
      case 'LEMBRETE': return 'tipo-lembrete';
      case 'COMUNICADO': return 'tipo-comunicado';
      case 'GERAL': return 'tipo-geral';
      default: return 'tipo-geral';
    }
  }

  voltar(): void {
    this.router.navigate(['/dashboard-aluno']);
  }
}
