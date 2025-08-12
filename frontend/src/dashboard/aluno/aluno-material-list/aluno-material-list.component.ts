import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FiltroMaterialDto, Material, MaterialService } from '../../../app/material/material.service';



@Component({
  selector: 'app-aluno-material-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './aluno-material-list.component.html',
  styleUrls: ['./aluno-material-list.component.scss']
})
export class AlunoMaterialListComponent implements OnInit {
  materiais: Material[] = [];
  loading = false;
  filtros: FiltroMaterialDto = {};

  constructor(private materialService: MaterialService, private router: Router) {}

  ngOnInit(): void {
    this.carregarMateriais();
  }

carregarMateriais(): void {
  this.loading = true;
  this.materialService.findAll(this.filtros).subscribe({
    next: (materiais) => {
      console.log('[ALUNO] GET /material ->', materiais);
      this.materiais = materiais;
      this.loading = false;
    },
    error: (err) => {
      console.error('Erro ao carregar materiais:', err);
      this.loading = false;
    }
  });
}

  aplicarFiltros(): void {
    // debounce simples
    setTimeout(() => this.carregarMateriais(), 400);
  }

  abrirMaterial(id: string): void {
    this.router.navigate(['/aluno/materiais', id, 'atividades']);
  }

  irParaDashboard(): void {
    this.router.navigate(['/dashboard-aluno']);
  }

  formatarData(dataString: string): string {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  }
}