import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MaterialService, Material, FiltroMaterialDto } from '../material.service';

@Component({
  selector: 'app-material-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './material-list.html',
  styleUrl: './material-list.scss'
})
export class MaterialListComponent implements OnInit {
  materiais: Material[] = [];
  loading = false;
  filtros: FiltroMaterialDto = {};

  constructor(
    private materialService: MaterialService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarMateriais();
  }

  carregarMateriais(): void {
    this.loading = true;
    this.materialService.findAll(this.filtros).subscribe({
      next: (materiais) => {
        this.materiais = materiais;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar materiais:', error);
        this.loading = false;
        alert('Erro ao carregar materiais. Verifique sua conexão.');
      }
    });
  }

  aplicarFiltros(): void {
    setTimeout(() => {
      this.carregarMateriais();
    }, 500);
  }

  limparFiltros(): void {
    this.filtros = {};
    this.carregarMateriais();
  }

  irParaNovo(): void {
    this.router.navigate(['/materiais/novo']);
  }

  editarMaterial(id: string): void {
    this.router.navigate(['/materiais/editar', id]);
  }

  excluirMaterial(id: string): void {
    const confirmacao = confirm('Tem certeza que deseja excluir este material?');
    if (confirmacao) {
      this.materialService.remove(id).subscribe({
        next: () => {
          alert('Material excluído com sucesso!');
          this.carregarMateriais();
        },
        error: (error) => {
          console.error('Erro ao excluir material:', error);
          alert('Erro ao excluir material. Tente novamente.');
        }
      });
    }
  }

abrirMaterial(id: string): void {
  this.router.navigate(['/materiais', id, 'atividades']);
}

  formatarData(dataString: string): string {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  }
  irParaDashboard(): void {
    this.router.navigate(['/dashboard-professor']);
  }
}
