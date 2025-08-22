import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import Chart from 'chart.js/auto';
import { lastValueFrom } from 'rxjs';
import { AtividadeService } from '../../../services/atividade.service';
import { AuthService } from '../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';


type RespostaAluno = {
  status?: 'ENVIADA' | 'CORRIGIDA';
  nota?: number | null;
  feedback?: string | null;
};

@Component({
  selector: 'app-relatorios-aluno',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './relatorios-aluno.component.html',
  styleUrls: ['./relatorios-aluno.component.scss'],
})
export class RelatoriosAlunoComponent implements OnInit, OnDestroy {
  @ViewChild('chartStatus') chartStatusRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartNotas')  chartNotasRef!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('chartMaterias') chartMateriasRef!: ElementRef<HTMLCanvasElement>;

  loading = false;
  erro?: string;

  atividades: any[] = [];
  totalAtividades = 0;

  // métricas
  pendentes = 0;             // A fazer
  aguardandoCorrecao = 0;    // ENVIADA
  corrigidas = 0;            // CORRIGIDA

  pontuacaoDistribuida = 0;
  notaObtida = 0;

  materiasLabels: string[] = [];
  notasPorMateria: number[] = [];


  private chartStatus?: Chart;
  private chartNotas?: Chart;
  private chartMaterias?: Chart;

  constructor(
    private route: ActivatedRoute,
    private atividadeService: AtividadeService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const materialId = this.route.snapshot.queryParamMap.get('materialId') || undefined;
    this.carregar(materialId);
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private async carregar(materialId?: string) {
    this.loading = true;
    this.erro = undefined;

    try {
      const token = this.auth.getAccessToken?.();
      if (!token) {
        this.erro = 'Token não encontrado. Faça login.';
        this.loading = false;
        return;
      }

      const fonte$ = this.atividadeService.getAtividadesRelatorio(materialId);
      this.atividades = await lastValueFrom(fonte$);

      for (const a of this.atividades) {
        try {
          const r: RespostaAluno | null = await lastValueFrom(
            this.atividadeService.getMinhaRespostaRelatorio(a.id)
          );
          a.status = r?.status;
          a.nota = r?.nota;
          a.feedback = r?.feedback;
        } catch {}
      }

      this.calcularMetricas();
      this.calcularNotasPorMateria();

      this.loading = false;
      this.cdr.detectChanges();                    // garante <canvas> no DOM
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

  private calcularMetricas() {
    this.totalAtividades = this.atividades.length;

    const respondidas = this.atividades.filter(a => a.status === 'ENVIADA').length;
    this.corrigidas = this.atividades.filter(a => a.status === 'CORRIGIDA').length;

    this.aguardandoCorrecao = respondidas;
    this.pendentes = Math.max(this.totalAtividades - respondidas - this.corrigidas, 0);

    this.pontuacaoDistribuida = this.atividades.reduce(
      (acc, a) => acc + (typeof a.pontuacao === 'number' ? a.pontuacao : 0), 0
    );
    this.notaObtida = this.atividades.reduce(
      (acc, a) => acc + (a.status === 'CORRIGIDA' && typeof a.nota === 'number' ? a.nota : 0), 0
    );
  }

  private calcularNotasPorMateria() {
  const map = new Map<string, number>();
  for (const a of this.atividades) {
    if (a?.materia && a.status === 'CORRIGIDA' && typeof a.nota === 'number') {
      map.set(a.materia, (map.get(a.materia) || 0) + a.nota);
    }
  }
  const entries = Array.from(map.entries());
  this.materiasLabels = entries.map(([m]) => m);
  this.notasPorMateria = entries.map(([, v]) => v);
}

  private renderCharts() {
    this.destroyCharts();
    if (!this.chartStatusRef?.nativeElement || !this.chartNotasRef?.nativeElement) return;

    // Doughnut
    this.chartStatus = new Chart(this.chartStatusRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['A fazer', 'Aguardando correção', 'Corrigidas'],
        datasets: [{
          data: [this.pendentes, this.aguardandoCorrecao, this.corrigidas],
          backgroundColor: ['#9ca3af', '#f59e0b', '#16a34a'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // usa altura do contêiner
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 12 } } },
          title:  { display: true, text: 'Status das atividades', font: { size: 16 } },
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

    // Barras: Pontuação vs Nota
    this.chartNotas = new Chart(this.chartNotasRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Distribuída', 'Obtida'],
        datasets: [{
          data: [this.pontuacaoDistribuida, this.notaObtida],
          backgroundColor: ['#93c5fd', '#60a5fa'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // usa altura do contêiner
        plugins: {
          legend: { display: false, labels: { font: { size: 12 } } },
          title:  { display: true, text: 'Pontuação vs Nota', font: { size: 16 } },
        },
        scales: {
          x: { ticks: { font: { size: 12 } } },
          y: { beginAtZero: true, ticks: { precision: 0, font: { size: 12 } } },
        },
      },
    });

    this.chartMaterias = new Chart(this.chartMateriasRef.nativeElement, {
  data: {
    labels: this.materiasLabels,
    datasets: [
      { type: 'bar',  label: 'Minhas notas', data: this.notasPorMateria, backgroundColor: '#60a5fa', borderWidth: 0 },
      { type: 'line', label: 'Meta 60',      data: this.materiasLabels.map(() => 60), backgroundColor:'rgba(74, 119, 93, 1)', borderWidth: 3, borderDash: [12,4], pointRadius: 0, fill: false },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Notas por matéria (meta 60)' } },
    scales: { y: { beginAtZero: true } },
  },
});
  }

  private destroyCharts() {
    this.chartStatus?.destroy();
    this.chartNotas?.destroy();
    this.chartMaterias?.destroy();
  }

    voltar() {
    this.router.navigate(['/dashboard-aluno']);
  }
}