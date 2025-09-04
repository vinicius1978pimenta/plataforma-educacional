import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef,
  Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Chart from 'chart.js/auto';
import { lastValueFrom } from 'rxjs';
import { AtividadeService } from '../../../services/atividade.service';
import { AuthService } from '../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';


// ---------- NITIDEZ ----------
const DPR = Math.min(3, Math.ceil(window.devicePixelRatio || 1));
Chart.defaults.devicePixelRatio = DPR;

// ---------- Plugins ----------
const valueInBarPlugin = {
  id: 'valueInBar',
  afterDatasetsDraw(chart: any, _args: any, opt: any) {
    const { ctx } = chart;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = opt?.font || '700 12px Inter, system-ui, sans-serif';
    const minInside = opt?.minInsideHeight ?? 18;
    const formatter = opt?.formatter || ((v: number) => String(v));
    const color = opt?.color || '#ffffff';

    chart.data.datasets.forEach((ds: any, di: number) => {
      const meta = chart.getDatasetMeta(di);
      if (meta.type !== 'bar' || !chart.isDatasetVisible(di)) return;

      meta.data.forEach((bar: any, i: number) => {
        const raw = Number(ds.data?.[i] ?? 0);
        if (isNaN(raw)) return;
        const x = bar.x;
        const yTop = bar.y;
        const yBase = bar.base;
        const h = Math.abs(yBase - yTop);
        const y = h >= minInside ? (yTop + (yBase - yTop) / 2) : (yTop - 8);
        ctx.fillStyle = color;
        ctx.fillText(formatter(raw, { datasetIndex: di, dataIndex: i }), x, y);
      });
    });

    ctx.restore();
  }
};
Chart.register(valueInBarPlugin);

const valueOnArcPlugin = {
  id: 'valueOnArc',
  afterDatasetsDraw(chart: any, _args: any, opt: any) {
    const { ctx } = chart;
    chart.data.datasets.forEach((ds: any, di: number) => {
      const meta = chart.getDatasetMeta(di);
      if (meta.type !== 'doughnut' || !chart.isDatasetVisible(di)) return;

      const dataArr = Array.isArray(ds.data) ? ds.data : [];
      const total = dataArr.reduce((a: number, b: any) => a + Number(b ?? 0), 0) || 1;

      meta.data.forEach((arc: any, i: number) => {
        const raw = Number(dataArr[i] ?? 0);
        if (!isFinite(raw) || raw <= 0) return;

        const pct = Math.round((raw / total) * 100);
        const minPct = opt?.minPercentToShow ?? 0;
        if (pct < minPct) return;

        const p = arc.getProps(['startAngle','endAngle','innerRadius','outerRadius','x','y'], true);
        const ang = (p.startAngle + p.endAngle) / 2;
        const r = (p.innerRadius + p.outerRadius) / 2;
        const x = p.x + Math.cos(ang) * r;
        const y = p.y + Math.sin(ang) * r;

        const font = opt?.font || '700 12px Inter, system-ui, sans-serif';
        const color = opt?.color || '#ffffff';
        const outlineWidth = opt?.outlineWidth ?? 3;
        const outlineColor = opt?.outlineColor ?? 'rgba(0,0,0,.35)';

        const text = typeof opt?.formatter === 'function'
          ? opt.formatter(raw, pct, { datasetIndex: di, dataIndex: i })
          : `${pct}%`;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = font;

        if (outlineWidth) {
          ctx.lineWidth = outlineWidth;
          ctx.strokeStyle = outlineColor;
          ctx.strokeText(text, x, y);
        }
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        ctx.restore();
      });
    });
  }
};
Chart.register(valueOnArcPlugin);

// ---------- Tipos ----------
type RespostaAluno = {
  status?: 'ENVIADA' | 'CORRIGIDA';
  nota?: number | null;
  feedback?: string | null;
};

@Component({
  selector: 'app-relatorios-responsavel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relatoriosresponsavel.component.html',
  styleUrls: ['./relatoriosresponsavel.component.scss'],
})
export class RelatoriosResponsavelComponent implements OnInit, OnDestroy {
  @Input() alunoId?: string | number;

  @ViewChild('chartStatus')    chartStatusRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartNotas')     chartNotasRef!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('chartMaterias')  chartMateriasRef!: ElementRef<HTMLCanvasElement>;

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
  valoresPorMateria: number[] = []; // feito/total conforme contexto

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

      const role = this.auth.getCurrentUser()?.role as 'ALUNO' | 'PROFESSOR' | 'RESPONSAVEL' | undefined;
      const targetAlunoId = role === 'RESPONSAVEL' && this.alunoId ? String(this.alunoId) : undefined;

      // 1) Atividades
      this.atividades = await lastValueFrom(
        this.atividadeService.getAtividadesRelatorio(materialId, targetAlunoId)
      );

      // 2) Respostas individuais (apenas com contexto de pessoa)
      const precisaRespostas = role === 'ALUNO' || (role === 'RESPONSAVEL' && !!targetAlunoId);
      if (precisaRespostas) {
        for (const a of this.atividades) {
          try {
            const r: RespostaAluno | null = await lastValueFrom(
              this.atividadeService.getMinhaRespostaRelatorio(a.id, targetAlunoId)
            );
            a.status = r?.status;
            a.nota = r?.nota;
            a.feedback = r?.feedback;
          } catch {}
        }
      } else {
        for (const a of this.atividades) {
          a.status = undefined;
          a.nota = undefined;
        }
      }

      this.calcularMetricas();
      this.calcularPorMateria(precisaRespostas);

      this.loading = false;
      this.cdr.detectChanges();
      await new Promise<void>(r => requestAnimationFrame(() => r()));
      this.renderCharts(precisaRespostas);
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

    const enviadas = this.atividades.filter(a => a.status === 'ENVIADA').length;
    this.corrigidas   = this.atividades.filter(a => a.status === 'CORRIGIDA').length;

    this.aguardandoCorrecao = enviadas;
    this.pendentes = Math.max(this.totalAtividades - enviadas - this.corrigidas, 0);

    this.pontuacaoDistribuida = this.atividades.reduce(
      (acc, a) => acc + (typeof a.pontuacao === 'number' ? a.pontuacao : 0), 0
    );
    this.notaObtida = this.atividades.reduce(
      (acc, a) => acc + (a.status === 'CORRIGIDA' && typeof a.nota === 'number' ? a.nota : 0), 0
    );
  }

  /**
   * Contexto individual (ALUNO/RESP+alunoId): mostra QUANTAS ATIVIDADES FEITAS por matéria
   * (status ENVIADA ou CORRIGIDA).
   * Modo geral (RESPONSÁVEL sem alunoId): mostra TOTAL de atividades por matéria.
   * Se preferir somar pontos no geral, troque `+1` por `+ pontuacao`.
   */
  private calcularPorMateria(precisaRespostas: boolean) {
    const map = new Map<string, number>();

    for (const a of this.atividades) {
      const materia = a?.materia; // do teu schema
      if (!materia) continue;

      if (precisaRespostas) {
        const feita = a.status === 'ENVIADA' || a.status === 'CORRIGIDA';
        if (feita) map.set(materia, (map.get(materia) || 0) + 1);
      } else {
        // Modo geral: total por matéria (conte as atividades)
        // Para somar pontuação por matéria no geral, use:
        // const val = typeof a.pontuacao === 'number' ? a.pontuacao : 0;
        // map.set(materia, (map.get(materia) || 0) + val);
        map.set(materia, (map.get(materia) || 0) + 1);
      }
    }

    const entries = Array.from(map.entries());
    this.materiasLabels   = entries.map(([m]) => m);
    this.valoresPorMateria = entries.map(([, v]) => v);
  }

  private renderCharts(precisaRespostas: boolean) {
    this.destroyCharts();
    if (!this.chartStatusRef?.nativeElement || !this.chartNotasRef?.nativeElement) return;

    // ---------------- Doughnut: Status ----------------
    this.chartStatus = new Chart(this.chartStatusRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['A fazer', 'Aguardando correção', 'Corrigidas'],
        datasets: [{
          data: [this.pendentes, this.aguardandoCorrecao, this.corrigidas],
          backgroundColor: ['#FDDB51', '#008BC9', '#3AAE96'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 15 } } },
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
          ...( { valueOnArc: {
            font: '800 17px Inter, system-ui, sans-serif',
            color: '#ffffff',
            outlineColor: 'rgba(0,0,0,.35)',
            outlineWidth: 3,
            minPercentToShow: 0,
            formatter: (valor: number) => String(valor),
          }} as any ),
        },
      },
    });

    // ---------------- Barras: Pontuação vs Nota ----------------
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
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false, labels: { font: { size: 12 } } },
          title:  { display: true, text: 'Pontuação vs Nota', font: { size: 16 } },
          ...( { valueInBar: {
            font: '800 17px Inter, system-ui, sans-serif',
            color: '#ffffff',
            minInsideHeight: 18,
          }} as any ),
        },
        scales: {
          x: { ticks: { font: { size: 15 } } },
          y: { beginAtZero: true, ticks: { precision: 0, font: { size: 12 } } },
        },
      },
    });

    // ---------------- Barras: Por matéria ----------------
    const LIMITE_AZUL  = 3;   // como agora é contagem de atividades, ajustei limites
    const LIMITE_VERDE = 6;
    const colorFor = (v: number) => (v >= LIMITE_VERDE ? '#3AAE96' : v >= LIMITE_AZUL ? '#3b82f6' : '#ef4444');

    const tituloMaterias = precisaRespostas
      ? 'Atividades feitas por matéria'
      : 'Atividades por matéria (geral)';

    const labelMaterias = precisaRespostas
      ? 'Feitas'
      : 'Total';

    this.chartMaterias = new Chart(this.chartMateriasRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.materiasLabels,
        datasets: [{
          label: labelMaterias,
          data: this.valoresPorMateria,
          borderWidth: 0,
          backgroundColor: (ctx: any) => colorFor(Number(ctx.raw ?? 0)),
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          title:  { display: true, text: tituloMaterias },
          tooltip: {
            callbacks: {
              label: (ctx: any) => `${ctx.dataset.label}: ${Number(ctx.raw ?? 0)}`
            },
          },
          ...( { valueInBar: {
            font: '700 17px Inter, system-ui, sans-serif',
            color: '#ffffff',
            minInsideHeight: 18,
          }} as any ),
        },
        scales: { 
          x: { ticks: { font: { size: 15 } } },
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
      },
    });
  }

  private destroyCharts() {
    this.chartStatus?.destroy();
    this.chartNotas?.destroy();
    this.chartMaterias?.destroy();
  }

  voltar() {
    const role = this.auth.getCurrentUser()?.role;
    if (role === 'RESPONSAVEL') {
      this.router.navigate(['/dashboard-responsaveis']);
    } else if (role === 'PROFESSOR') {
      this.router.navigate(['/dashboard-professor']);
    } else {
      this.router.navigate(['/dashboard-aluno']);
    }
  }
}
