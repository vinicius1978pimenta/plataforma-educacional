import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AtividadeService } from '../../../../services/atividade.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar2Component } from "../../../../navbar2/navbar2.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-listar-atividades',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar2Component],
  templateUrl: './listar-atividades.component.html',
  styleUrls: ['./listar-atividades.component.scss']
})
export class ListarAtividadesComponent implements OnInit {
  @ViewChild('modalExclusao') modalExclusao!: TemplateRef<any>;
  @ViewChild('modalAviso') modalAviso!: TemplateRef<any>

  atividades: any[] = [];
  atividadesFiltradas: any[] = [];
  filtro = '';
  respostasPorAtividade: Record<string, any[]> = {};
carregandoRespostas: Record<string, boolean> = {};
  tituloModal: string = '';
  mensagemModal: string = '';

  constructor(
    private atividadeService: AtividadeService,
    private router: Router,
    private modalService:  NgbModal,
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

  this.modalService.open(this.modalExclusao, { centered: true }).result.then(
  
    (result) => {
      console.log('Confirmação recebida:', result);
      this.atividadeService.excluirAtividade(id).subscribe(() => {
        console.log('Atividade excluída com sucesso.');
        this.carregarAtividades(); 
      });
    },
   
    (reason) => {
      console.log('Exclusão cancelada:', reason);
   
    }
  );
}

carregarRespostas(atividadeId: string): void {
  console.log('Carregando respostas para atividade:', atividadeId);
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

      this.tituloModal = 'Sucesso!';
      this.mensagemModal = 'Avaliação registrada com sucesso!';
      this.modalService.open(this.modalAviso, { centered: true });

      resposta.status = 'CORRIGIDA';
      resposta.dataCorrecao = new Date().toISOString();
    },
    error: (err) => {
      console.error('Erro ao registrar avaliação:', err);
      this.tituloModal = 'Erro';
      this.mensagemModal = 'Ocorreu um erro ao registrar a avaliação.';
      this.modalService.open(this.modalAviso, { centered: true });
    }
  });
}

  voltar() {
    this.router.navigate(['/dashboard-aluno']);
  }

}
