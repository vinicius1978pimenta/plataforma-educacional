import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AtividadeService } from '../../../../services/atividade.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-listar-atividades',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './listar-atividades.component.html',
  styleUrls: ['./listar-atividades.component.scss']
})
export class ListarAtividadesComponent implements OnInit {
  atividades: any[] = [];
  atividadesFiltradas: any[] = [];
  filtro = '';

  constructor(
    private atividadeService: AtividadeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarAtividades();
  }

  carregarAtividades() {
    this.atividadeService.getAtividades().subscribe({
      next: (res) => {
        console.log('Atividades carregadas:', res)
        this.atividades = res;
        this.filtrar();
      },
      error: (err) => {
        console.error('Erro ao carregar atividades', err);
      }
    });
  }

  filtrar() {
    const termo = this.filtro.toLowerCase();
    this.atividadesFiltradas = this.atividades.filter(a =>
      a.titulo.toLowerCase().includes(termo)
    );
  }

  editar(id: string) {
    this.router.navigate(['/atividades/editar', id]);
  }

  excluir(id: string) {
    if (confirm('Tem certeza que deseja excluir esta atividade?')) {
      this.atividadeService.excluirAtividade(id).subscribe(() => {
        this.carregarAtividades();
      });
    }
  }
}
