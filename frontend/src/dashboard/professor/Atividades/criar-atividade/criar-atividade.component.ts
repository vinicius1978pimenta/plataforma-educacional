import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AtividadeService } from '../../../../services/atividade.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Material, MaterialService } from '../../../../app/material/material.service';
import { NavbarComponent } from '../../navbar/navbar.component';

interface AtividadeForm {
  titulo: string;
  descricao: string;
  conteudo: string;
  materia: Material; // Sempre será um objeto Material
  tipo: string;
  dificuldade: string;
  ativa: boolean;
  pontuacao: number | null;
  tempoEstimado: number | null;
  instrucoes: string;
  dataVencimento: string | null;
  materialId: string; // Aqui você quer garantir que sempre seja enviado o ID do material
}

@Component({
  selector: 'app-criar-atividade',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ],
  templateUrl: './criar-atividade.component.html',
  styleUrls: ['./criar-atividade.component.scss']
})
export class CriarAtividadeComponent {
  atividade: AtividadeForm = {
    titulo: '',
    descricao: '',
    conteudo: '',
    materia: {
      id: '',
      titulo: '',
      conteudo: '',
      traducao: '',
      professorId: '',
      createdAt: '',
      updatedAt: ''
    },
    tipo: 'EXERCICIO',
    dificuldade: 'MEDIO',
    ativa: true,
    pontuacao: null,
    tempoEstimado: null,
    instrucoes: '',
    dataVencimento: null,
    materialId: ''
  };

  tipos = ['EXERCICIO', 'AULA', 'PROVA'];
  dificuldades = ['FACIL', 'MEDIO', 'DIFICIL'];
  materiais: Material[] = [];
  loadingMateriais = false;

  constructor(
    private atividadeService: AtividadeService,
    private router: Router,
    private materialService: MaterialService
  ) {}

 criarAtividade() {
  const atividadeToSend = {
    ...this.atividade,
    materia: this.atividade.materia.titulo,  // Mantém apenas o título
    materialId: this.atividade.materia.id     // Envia o ID
  };

  console.log('Dados enviados para criar atividade:', atividadeToSend);

  this.atividadeService.criarAtividade(atividadeToSend).subscribe({
    next: (response) => {
      alert('Atividade criada com sucesso!');
      this.router.navigate(['/atividades']);
    },
    error: (error) => {
      console.error('Erro ao criar atividade', error);
      alert('Erro ao criar atividade');
    }
  });
}

  ngOnInit() {
    this.carregarMateriais();
  }

  carregarMateriais() {
    this.loadingMateriais = true;
    this.materialService.findAll({}).subscribe({
      next: (materiais) => {
        this.materiais = materiais;
        this.loadingMateriais = false;
      },
      error: (err) => {
        console.error('Erro ao carregar materiais:', err);
        this.loadingMateriais = false;
      }
    });
  }
}
