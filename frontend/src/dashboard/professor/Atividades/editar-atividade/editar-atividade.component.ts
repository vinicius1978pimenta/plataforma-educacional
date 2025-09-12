import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AtividadeService } from '../../../../services/atividade.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar2Component } from "../../../../navbar2/navbar2.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-editar-atividade',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar2Component],
  templateUrl: './editar-atividade.component.html',
  styleUrls: ['./editar-atividade.component.scss']
})
export class EditarAtividadeComponent implements OnInit {
   @ViewChild('meuModal') meuModal!: TemplateRef<any>;

  atividade: any = {
    titulo: '',
    descricao: '',
    conteudo: '',
    materia: '',
    tipo: '',
    dificuldade: '',
    ativa: true
  };

  tipos = ['EXERCICIO', 'AULA', 'PROVA'];
  dificuldades = ['FACIL', 'MEDIO', 'DIFICIL'];

  atividadeId: string = '';
  tituloModal: string = '';
  mensagemModal: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private atividadeService: AtividadeService,
    private modalService:  NgbModal,
  ) {}

  ngOnInit(): void {
    this.atividadeId = this.route.snapshot.paramMap.get('id')!;
    this.carregarAtividade();
  }

  carregarAtividade() {
    this.atividadeService.getAtividadeById(this.atividadeId).subscribe({
      next: (res: any) => {
        this.atividade = res;
      },
      error: (err: any) => {
        console.error('Erro ao carregar atividade', err);
        this.tituloModal = 'Erro';
        this.mensagemModal = 'Ocorreu um erro ao carregar a atividade. Por favor, tente novamente.';
        this.modalService.open(this.meuModal);
      }
    });
  }

  salvarAlteracoes() {
  const atividadeAtualizada = {
  titulo: this.atividade.titulo,
  descricao: this.atividade.descricao,
  conteudo: this.atividade.conteudo,
  materia: this.atividade.materia,
  tipo: this.atividade.tipo,
  dificuldade: this.atividade.dificuldade,
  ativa: this.atividade.ativa,
  pontuacao: this.atividade.pontuacao || null,
  tempoEstimado: this.atividade.tempoEstimado || null,
  instrucoes: this.atividade.instrucoes || null,
  dataVencimento: this.atividade.dataVencimento || null,
  turmaId: this.atividade.turmaId || null
};

 this.atividadeService.atualizarAtividade(this.atividadeId, atividadeAtualizada).subscribe({
    next: () => {
      this.tituloModal = 'Sucesso!';
      this.mensagemModal = 'Atividade atualizada com sucesso!';

      this.modalService.open(this.meuModal,).result.then(
        (result) => {
          
          console.log('Modal fechado com sucesso:', result);
          this.router.navigate(['/atividades']);
        },
        (reason) => {
           
           this.router.navigate(['/atividades']);
        }
      );
    },   

    error: (err) => {
      console.error('Erro ao atualizar atividade', err);
      this.tituloModal = 'Erro';
      this.mensagemModal = 'Ocorreu um erro ao salvar as alterações.';
      this.modalService.open(this.meuModal);
    }
  });
}
}