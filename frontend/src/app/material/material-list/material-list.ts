import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MaterialService, Material, FiltroMaterialDto } from '../material.service';
import { Navbar2Component } from "../../../navbar2/navbar2.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-material-list',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar2Component],
  templateUrl: './material-list.html',
  styleUrl: './material-list.scss'
})
export class MaterialListComponent implements OnInit {
   @ViewChild('modalAviso') modalAviso!: TemplateRef<any>;
   @ViewChild('modalExclusao') modalExclusao!: TemplateRef<any>;





  materiais: Material[] = [];
  loading = false;
  filtros: FiltroMaterialDto = {};
   tituloModal: string = '';
  mensagemModal: string = '';


  constructor(
    private materialService: MaterialService,
    private router: Router,
    private modalService:  NgbModal,
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
        this.tituloModal = 'Erro';
        this.mensagemModal = 'Ocorreu um erro ao carregar as matérias. Por favor, tente novamente.';
        this.modalService.open(this.modalAviso);
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

  this.modalService.open(this.modalExclusao, { centered: true }).result.then(
    (result) => {

      if (result === 'confirm') {
        this.materialService.remove(id).subscribe({
          next: () => {
            this.tituloModal = 'Sucesso!';
            this.mensagemModal = 'Material excluído com sucesso!';
            this.modalService.open(this.modalAviso, { centered: true });
            this.carregarMateriais();
          },
          error: (error) => {
            console.error('Erro ao excluir material:', error);
            this.tituloModal = 'Erro';
            this.mensagemModal = 'Erro ao excluir o material. Tente novamente.';
            this.modalService.open(this.modalAviso, { centered: true });
          }
        });
      }
    },
    (reason) => {
      console.log('Exclusão de material cancelada.');
    }
  );
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
