import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AtividadeService } from '../../../../services/atividade.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-listar-atividades',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent  ],
  templateUrl: './listar-atividades.component.html',
  styleUrls: ['./listar-atividades.component.scss']
})
export class ListarAtividadesComponent implements OnInit {
  atividades: any[] = [];
  atividadesFiltradas: any[] = [];
  filtro = '';
  respostasPorAtividade: Record<string, any[]> = {};
carregandoRespostas: Record<string, boolean> = {};

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

carregarRespostas(atividadeId: string): void {
  this.carregandoRespostas[atividadeId] = true;
  this.atividadeService.getRespostas(atividadeId).subscribe({
    next: (respostas) => {
      this.respostasPorAtividade[atividadeId] = respostas;
      this.carregandoRespostas[atividadeId] = false;
    },
    error: (err) => {
      console.error('Erro ao carregar respostas:', err);
      this.carregandoRespostas[atividadeId] = false;
      alert('Erro ao carregar respostas.');
    }
  });
}

registrarAvaliacao(resposta: any): void {
  const avaliacao = {
    respostaId: resposta.id,
    nota: resposta.nota,
    feedback: resposta.feedback,
  };

  this.atividadeService.registrarAvaliacao(avaliacao).subscribe({
    next: () => {
      alert('Avaliação registrada com sucesso!');
      // opcional: marcar como corrigida localmente
      resposta.status = 'CORRIGIDA';
      resposta.dataCorrecao = new Date().toISOString();
    },
    error: (err) => {
      console.error('Erro ao registrar avaliação:', err);
      alert('Erro ao registrar avaliação.');
    }
  });
}

}
