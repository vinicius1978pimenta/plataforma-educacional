import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AtividadeService } from '../../../services/atividade.service';
import { Navbar2Component } from "../../../navbar2/navbar2.component";


@Component({
  selector: 'app-aluno-material-atividades-list',
  standalone: true,
  templateUrl: './aluno-material-atividades-list.component.html',
  styleUrls: ['./aluno-material-atividades-list.component.scss'],
  imports: [CommonModule, FormsModule, RouterModule, Navbar2Component],
})
export class AlunoMaterialAtividadesListComponent implements OnInit {
  atividades: any[] = [];
  loading = false;
  materialId = '';
  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private atividadeService: AtividadeService
  ) {}

  ngOnInit(): void {
    this.materialId = this.route.snapshot.params['id'];
    this.carregarAtividades();
  }

 carregarAtividades(): void {
  this.loading = true;
  this.atividadeService.findByMaterialId(this.materialId).subscribe({
    next: (atividades) => { 
      this.atividades = atividades;

      // Checar status de cada atividade
      this.atividades.forEach((atividade) => {
        this.atividadeService.getMinhaResposta(atividade.id).subscribe({
          next: (resposta) => {
            if (resposta && resposta.status) {
              atividade.status = resposta.status;
              atividade.nota = resposta.nota;
              atividade.feedback = resposta.feedback;
            }
          },
          error: (err) => console.error('Erro ao obter status da resposta:', err)
        });
      });

      this.loading = false; 
    },
    error: (err) => {
      console.error('Erro ao carregar atividades:', err);
      this.loading = false;
      alert('Erro ao carregar atividades vinculadas.');
    }
  });
}

enviarResposta(atividade: any): void {
  if (!atividade.resposta?.trim()) {
    alert('Por favor, insira uma resposta!');
    return;
  }

  const payload = {
    atividadeId: atividade.id,
    resposta: atividade.resposta.trim(),
    anexos: [] as string[],
  };

  this.atividadeService.enviarResposta(payload).subscribe({
    next: () => {
      alert('Resposta enviada com sucesso!');
      atividade.resposta = '';
      atividade.status = 'ENVIADA'; // <-- para esconder o textarea e mostrar o status
    },
    error: (err) => {
      console.error('Erro ao enviar resposta:', err);
      alert('Erro ao enviar resposta.');
    },
  });
}

voltar(): void {
  this.router.navigate(['/aluno/materiais']);
}

  traduzirAtividade(atividade: any, targetLang: string): void {
  atividade.traduzindo = true;

  this.atividadeService.traduzirAtividade(atividade.conteudo, targetLang).subscribe({
    next: (res) => {
      if (targetLang === 'en') {
        atividade.traducaoIngles = res.traduzido;
      } else if (targetLang === 'es') {
        atividade.traducaoEspanhol = res.traduzido;
      }
      atividade.traduzindo = false;
    },
    error: (err) => {
      console.error('Erro ao traduzir atividade:', err);
      alert('Erro ao traduzir atividade.');
      atividade.traduzindo = false;
    }
  });
}

  
}