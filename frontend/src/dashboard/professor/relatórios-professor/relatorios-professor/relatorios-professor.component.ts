import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';
import { lastValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AtividadeService } from '../../../../services/atividade.service';
import { Router } from '@angular/router';
import { Navbar2Component } from '../../../../navbar2/navbar2.component';


type Resposta = { status: 'ENVIADA'|'CORRIGIDA'; nota?: number|null };

// ---------- NITIDEZ  ----------
const DPR = Math.min(3, Math.ceil(window.devicePixelRatio || 1));
Chart.defaults.devicePixelRatio = DPR;

// ---------- Plugin: valor no centro da barra  ----------
const valueInBarPlugin = {
  id: 'valueInBar',
  afterDatasetsDraw(chart: any, _args: any, pluginOptions: any) {
    const { ctx } = chart;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = pluginOptions?.font || '700 12px Inter, system-ui, sans-serif';

    const minInside = pluginOptions?.minInsideHeight ?? 18;
    const formatter = pluginOptions?.formatter || ((v: number) => String(v));
    const color = pluginOptions?.color || '#ffffff';

    chart.data.datasets.forEach((ds: any, di: number) => {
      const meta = chart.getDatasetMeta(di);
      if (meta.type !== 'bar' || !chart.isDatasetVisible(di)) return;

      meta.data.forEach((bar: any, i: number) => {
        const raw = Number(ds.data?.[i] ?? 0);
        if (!isNaN(raw)) {
          const x = bar.x;
          const yTop = bar.y;
          const yBase = bar.base;
          const h = Math.abs(yBase - yTop);
          const y = h >= minInside ? (yTop + (yBase - yTop) / 2) : (yTop - 8);

          ctx.fillStyle = color;
          ctx.fillText(formatter(raw, { datasetIndex: di, dataIndex: i }), x, y);
        }
      });
    });

    ctx.restore();
  }
};
Chart.register(valueInBarPlugin);

// --- Números sobre os arcos do doughnut ---
const valueOnArcPlugin = {
  id: 'valueOnArc',
  afterDatasetsDraw(chart: any, _args: any, pluginOptions: any) {
    const { ctx } = chart;

    chart.data.datasets.forEach((ds: any, di: number) => {
      const meta = chart.getDatasetMeta(di);
      if (meta.type !== 'doughnut' || !chart.isDatasetVisible(di)) return;

      const dataArr = Array.isArray(ds.data) ? ds.data : [];
      const total = dataArr.reduce((a: number, b: any) => a + Number(b ?? 0), 0) || 1;

      meta.data.forEach((arc: any, i: number) => {
        const raw = Number(dataArr[i] ?? 0);
        if (!isFinite(raw) || raw <= 0) return;

        // geometria atual do arco
        const p = arc.getProps(['startAngle','endAngle','innerRadius','outerRadius','x','y'], true);
        const ang = (p.startAngle + p.endAngle) / 2;
        const r = (p.innerRadius + p.outerRadius) / 2;

        const x = p.x + Math.cos(ang) * r;
        const y = p.y + Math.sin(ang) * r;

        const font = pluginOptions?.font || '700 12px Inter, system-ui, sans-serif';
        const color = pluginOptions?.color || '#ffffff';
        const outlineWidth = pluginOptions?.outlineWidth ?? 3;
        const outlineColor = pluginOptions?.outlineColor ?? 'rgba(0,0,0,.35)';

        const text = typeof pluginOptions?.formatter === 'function'
          ? pluginOptions.formatter(raw, 0, { datasetIndex: di, dataIndex: i }) // aqui usamos só o valor bruto
          : String(raw);

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

@Component({
  selector: 'app-relatorios-professor',
  standalone: true,
  imports: [CommonModule, Navbar2Component],
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

    // 1) Status agregado de respostas (DOUGHNUT com números nas fatias)
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
        cutout: '55%', // abre espaço para texto confortável
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 15 } } },
          title: { display: true, text: 'Status de todas as atividades)' },
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
          // <<< números brutos em cada fatia >>>
          ...( { valueOnArc: {
            font: '800 17px Inter, system-ui, sans-serif',
            color: '#ffffff',
            outlineColor: 'rgba(0,0,0,.35)',
            outlineWidth: 3,
            minPercentToShow: 0,
            formatter: (valor: number) => String(valor),
          } } as any ),
        },
      },
    });

    // 2) Pontos distribuídos por matéria + meta 100 (BARRA + LINHA) com números nas barras
    const meta = 100;
    const topo = Math.max(meta, ...(this.pontosPorMateria || [0])) + 5;

    this.chartMaterias = new Chart(this.chartMateriasRef.nativeElement, {
      data: {
        labels: this.materiasLabels,
        datasets: [
          {
            type: 'bar',
            label: 'Pontos distribuídos',
            data: this.pontosPorMateria,
            backgroundColor: '#60a5fa',
            borderWidth: 0,
            order: 1
          },
          {
            type: 'line',
            label: 'Pontos liberados',
            data: this.materiasLabels.map(() => meta),
            borderColor: '#f7c3a0ff',
            borderWidth: 3,
            borderDash: [10,6],
            pointRadius: this.materiasLabels.length === 1 ? 4 : 0,
            fill: false,
            order: 2,
            clip: false
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'Pontos por matéria' },

          // <<< números dentro das barras (apenas no dataset de barras) >>>
          ...( { valueInBar: {
            font: '700 17px Inter, system-ui, sans-serif',
            color: '#ffffff',
            minInsideHeight: 18,
            // formatter: (v: number) => v.toFixed(0),
          } } as any ),
        },
        scales: {
           x: { ticks: { font: { size: 15 } } },
           y: { beginAtZero: true, suggestedMax: topo } },
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
