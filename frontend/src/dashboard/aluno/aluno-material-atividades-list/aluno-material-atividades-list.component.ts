import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AtividadeService } from '../../../services/atividade.service';


@Component({
  selector: 'app-aluno-material-atividades-list',
  standalone: true,
  templateUrl: './aluno-material-atividades-list.component.html',
  styleUrls: ['./aluno-material-atividades-list.component.scss'],
  imports: [CommonModule, FormsModule, RouterModule],
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
      next: (atividades) => { this.atividades = atividades; this.loading = false; },
      error: (err) => {
        console.error('Erro ao carregar atividades:', err);
        this.loading = false;
        alert('Erro ao carregar atividades vinculadas.');
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/aluno/materiais']);
  }

enviarResposta(atividade: any): void {
  if (!atividade.resposta?.trim()) {
    alert('Por favor, insira uma resposta!');
    return;
  }

  const payload = {
    atividadeId: atividade.id,
    resposta: atividade.resposta.trim(),
    anexos: [] as string[], // se quiser anexos no futuro
  };

  this.atividadeService.enviarResposta(payload).subscribe({
    next: () => {
      alert('Resposta enviada com sucesso!');
      atividade.resposta = '';
    },
    error: (err) => {
      console.error('Erro ao enviar resposta:', err);
      alert('Erro ao enviar resposta.');
    },
  });
}

}