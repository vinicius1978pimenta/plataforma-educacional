import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { lastValueFrom } from 'rxjs';

import { HttpErrorResponse } from '@angular/common/http';
import { AtividadeService } from '../../../../services/atividade.service';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar.component';

type Resposta = { status: 'ENVIADA'|'CORRIGIDA'; nota?: number|null };

@Component({
  selector: 'app-relatorios-professor',
  standalone: true,
  imports: [CommonModule,NavbarComponent],
  templateUrl: './relatorios-professor.component.html',
  styleUrls: ['./relatorios-professor.component.scss'],
})
export class RelatoriosProfessorComponent implements OnInit, OnDestroy {
  @ViewChild('chartStatus')   chartStatusRef!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('chartMaterias') chartMateriasRef!: ElementRef<HTMLCanvasElement>;

  loading = false;
  erro?: string;

  atividades: any[] = [];
  totalAtividades = 0;

  // status agregados (todas as atividades do professor)
  semRespostas = 0;
  aguardandoCorrecao = 0; // ENVIADA
  corrigidas = 0;         // CORRIGIDA

  // pontuação distribuída por matéria (soma de pontuacao das atividades criadas)
  materiasLabels: string[] = [];
  pontosPorMateria: number[] = [];

  private chartStatus?: Chart;
  private chartMaterias?: Chart;

  constructor(
    private atividadeService: AtividadeService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void { this.carregar(); }
  ngOnDestroy(): void { this.destroyCharts(); }

  private async carregar() {
    this.loading = true; this.erro = undefined;
    try {
      // pega atividades do professor
      this.atividades = await lastValueFrom(this.atividadeService.getAtividades());
      this.totalAtividades = this.atividades.length;

      // acumula respostas de cada atividade
      this.semRespostas = 0;
      this.aguardandoCorrecao = 0;
      this.corrigidas = 0;

      for (const a of this.atividades) {
        try {
          const respostas: Resposta[] = await lastValueFrom(this.atividadeService.getRespostas(a.id));
          if (!respostas || respostas.length === 0) {
            this.semRespostas++;
            continue;
          }
          this.aguardandoCorrecao += respostas.filter(r => r.status === 'ENVIADA').length;
          this.corrigidas        += respostas.filter(r => r.status === 'CORRIGIDA').length;
        } catch {
          // se falhar a leitura das respostas de uma atividade, ignora e segue
        }
      }

      this.calcularPontosPorMateria();

      this.loading = false;
      this.cdr.detectChanges();
      await new Promise<void>(r => requestAnimationFrame(() => r()));
      this.renderCharts();
    } catch (e) {
      this.erro = this.msgErro(e);
      this.loading = false;
    }
  }

  private msgErro(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      if (e.status === 401) return 'Não autorizado (401).';
      if (e.status === 404) return 'Rota não encontrada (404).';
      if (e.status === 0)   return 'API inacessível.';
      return `Erro ${e.status}`;
    }
    return 'Falha ao carregar dados.';
  }

  private calcularPontosPorMateria() {
    const map = new Map<string, number>();
    for (const a of this.atividades) {
      const materia = a?.materia;
      const pts = typeof a?.pontuacao === 'number' ? a.pontuacao : 0;
      if (!materia || pts <= 0) continue;
      map.set(materia, (map.get(materia) || 0) + pts);
    }
    const entries = Array.from(map.entries());
    this.materiasLabels = entries.map(([m]) => m);
    this.pontosPorMateria = entries.map(([, v]) => v);
  }

  private renderCharts() {
    this.destroyCharts();
    if (!this.chartStatusRef?.nativeElement || !this.chartMateriasRef?.nativeElement) return;

    // 1) Status agregado de respostas
    this.chartStatus = new Chart(this.chartStatusRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Sem respostas', 'Aguardando correção', 'Corrigidas'],
        datasets: [{
          data: [this.semRespostas, this.aguardandoCorrecao, this.corrigidas],
          backgroundColor: ['#9ca3af', '#f59e0b', '#16a34a'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'Status das respostas (todas as atividades)' },
          tooltip: {
            callbacks: {
              label: (ctx: any) => {
                const val = Number(ctx.raw ?? 0);
                const arr = Array.isArray(ctx.dataset.data) ? ctx.dataset.data : [];
                const total = arr.reduce((a: number, b: any) => a + Number(b ?? 0), 0) || 1;
                const pct = Math.round((val / total) * 100);
                return `${ctx.label}: ${val} (${pct}%)`;
              },
            },
          },
        },
      },
    });

    // 2) Pontos distribuídos por matéria + meta 100
    const meta = 100;
    const topo = Math.max(meta, ...(this.pontosPorMateria || [0])) + 5;

    this.chartMaterias = new Chart(this.chartMateriasRef.nativeElement, {
      data: {
        labels: this.materiasLabels,
        datasets: [
          { type: 'bar',  label: 'Pontos distribuídos', data: this.pontosPorMateria, backgroundColor: '#60a5fa', borderWidth: 0, order: 1 },
          { type: 'line', label: 'Meta 100', data: this.materiasLabels.map(() => meta),
            borderColor: '#ef4444', borderWidth: 3, borderDash: [10,6], pointRadius: this.materiasLabels.length === 1 ? 4 : 0,
            fill: false, order: 2, clip: false },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Pontos por matéria (meta 100 anual)' } },
        scales: { y: { beginAtZero: true, suggestedMax: topo } },
      },
    });
  }

  private destroyCharts() {
    this.chartStatus?.destroy();
    this.chartMaterias?.destroy();
  }

     voltar() {
    this.router.navigate(['/dashboard-aluno']);
  }
}