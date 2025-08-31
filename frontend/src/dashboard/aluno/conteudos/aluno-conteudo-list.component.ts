import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Conteudo } from '../../../services/interfaces/conteudo-create.model';
import { Material, MaterialService } from '../../../app/material/material.service';
import { ConteudoService } from '../../../services/conteudo.service';

@Component({
  selector: 'app-aluno-conteudo-list',
  standalone: true, 
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './aluno-conteudo-list.component.html',
  styleUrl: './aluno-conteudo-list.component.scss'
})
export class AlunoConteudoListComponent implements OnInit {
  conteudos: Conteudo[] = [];
  material: Material | null = null;
  materialId: string = '';
  loading = false;
  showModal: boolean = false;
  conteudoSelecionado: Conteudo | null = null;

  constructor(
    private conteudoService: ConteudoService,
    private materialService: MaterialService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Pega o ID da matéria da URL
    this.route.params.subscribe(params => {
      this.materialId = params['materialId'];
      if (this.materialId) {
        this.carregarMaterial();
        this.carregarConteudos();
      }
    });
  }

  carregarMaterial(): void {
    this.materialService.findOne(this.materialId).subscribe({
      next: (material) => {
        this.material = material;
        console.log('[ALUNO] Material carregado:', material);
      },
      error: (err) => {
        console.error('Erro ao carregar material:', err);
      }
    });
  }

  carregarConteudos(): void {
    this.loading = true;

    this.conteudoService.listarconteudo(this.materialId).subscribe({
      next: (conteudos) => {
        console.log('[ALUNO] Conteúdos carregados:', conteudos);
        this.conteudos = conteudos;
      },
      error: (err) => {
        console.error('[ALUNO] Erro ao carregar conteúdos:', err);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // Abrir modal com opções do conteúdo
  abrirModalConteudo(conteudo: Conteudo) {
    this.conteudoSelecionado = conteudo;
    this.showModal = true;
  }

  // Fechar modal
  fecharModal() {
    this.showModal = false;
    this.conteudoSelecionado = null;
  }

  // Visualizar conteúdo (texto ou link)
  visualizarConteudo() {
    if (this.conteudoSelecionado) {
      if (this.conteudoSelecionado.tipo === 'LINK' && this.conteudoSelecionado.url) {
        // Abre link em nova aba
        window.open(this.conteudoSelecionado.url, '_blank');
      } else {
        // Para conteúdo texto, pode navegar para uma página de visualização
        // ou mostrar em um modal maior
        this.router.navigate(['/aluno/conteudo', this.conteudoSelecionado.id]);
      }
      this.fecharModal();
    }
  }

  // Download de PDF
  downloadPdf() {
    if (this.conteudoSelecionado && this.conteudoSelecionado.tipo === 'PDF') {
      this.loading = true;
      this.conteudoService.downloadPdf(this.conteudoSelecionado.id).subscribe({
        next: (blob) => {
          const nomeArquivo = this.conteudoSelecionado!.nomeArquivo || `${this.conteudoSelecionado!.titulo}.pdf`;
          this.conteudoService.baixarArquivo(blob, nomeArquivo);
          this.loading = false;
          this.fecharModal();
        },
        error: (err) => {
          console.error('Erro ao baixar PDF:', err);
          this.loading = false;
        }
      });
    }
  }

  // Voltar para lista de materiais
  voltarParaMateriais(): void {
    this.router.navigate(['/aluno/materiais']);
  }

  // Ir para atividades da matéria
  irParaAtividades(): void {
    this.router.navigate(['/aluno/materiais', this.materialId, 'atividades']);
  }

  // Formatar data
  formatarData(dataString: string): string {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  }

  // Método para identificar o ícone baseado no tipo
  getIconeConteudo(tipo: string | undefined): string {
    if (!tipo) return '📄';
    
    switch (tipo) {
      case 'PDF':
        return '📄';
      case 'LINK':
        return '🔗';
      case 'TEXTO':
        return '📝';
      default:
        return '📄';
    }
  }

  // Método para definir cor baseada no tipo
  getCorTipo(tipo: string | undefined): string {
    if (!tipo) return 'text-gray-600';
    
    switch (tipo) {
      case 'PDF':
        return 'text-red-600';
      case 'LINK':
        return 'text-blue-600';
      case 'TEXTO':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  }
}