import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AtividadeService } from '../../../../services/atividade.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-editar-atividade',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './editar-atividade.component.html',
  styleUrls: ['./editar-atividade.component.scss']
})
export class EditarAtividadeComponent implements OnInit {
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private atividadeService: AtividadeService,
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
        alert('Erro ao carregar atividade');
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
    alert('Atividade atualizada com sucesso!');
    this.router.navigate(['/atividades']);
  },
  error: (err) => {
    console.error('Erro ao atualizar atividade', err);
    alert('Erro ao atualizar atividade');
  }
});
  }
}
