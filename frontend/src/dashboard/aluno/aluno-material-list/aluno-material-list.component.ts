import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FiltroMaterialDto, Material, MaterialService } from '../../../app/material/material.service';
import { Navbar2Component } from "../../../navbar2/navbar2.component";




@Component({
  selector: 'app-aluno-material-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar2Component],
  templateUrl: './aluno-material-list.component.html',
  styleUrls: ['./aluno-material-list.component.scss']
})
export class AlunoMaterialListComponent implements OnInit {
  materiais: Material[] = [];
  loading = false;
  filtros: FiltroMaterialDto = {};
  showModal: boolean = false;
  materialSelecionado: any = null;


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

 

  irParaDashboard(): void {
    this.router.navigate(['/dashboard-aluno']);
  }

  formatarData(dataString: string): string {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  }

   

  // Método para abrir o modal (substitui o antigo abrirMaterial)
  abrirModalSelecao(material: any) {
    this.materialSelecionado = material;
    this.showModal = true;
  }

  // Método para fechar o modal
  fecharModal() {
    this.showModal = false;
    this.materialSelecionado = null;
  }

  // Método para abrir atividade
  abrirAtividade() {
    if (this.materialSelecionado) {
      // Navega para a página de atividades do material
      this.router.navigate(['/aluno/materiais', this.materialSelecionado.id, 'atividades']);
      this.fecharModal();
    }
  }

  // Método para abrir conteúdo
  abrirConteudo() {
  if (this.materialSelecionado) {
    // Navega para a página de conteúdos do material
    this.router.navigate(['/aluno/materiais', this.materialSelecionado.id, 'conteudos']);
    this.fecharModal();
  }
}

}