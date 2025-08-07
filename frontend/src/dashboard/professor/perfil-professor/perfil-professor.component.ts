import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';


import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfilProfessorService } from '../../../services/perfil-professor.service';

@Component({
  selector: 'app-perfil-professor',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule], // Ajuste conforme necessário
  templateUrl: './perfil-professor.component.html',
  styleUrls: ['./perfil-professor.component.scss'],
})
export class PerfilProfessorComponent implements OnInit {
  professor: any = {
    nome: '',
    email: '',
    senha: '',
    senhaAntiga: '',
    senhaNova: ''
  };

  professorId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private perfilProfessorService: PerfilProfessorService // Serviço atualizado
  ) {}

  ngOnInit(): void {
    this.professorId = this.route.snapshot.paramMap.get('id')!;
    this.carregarPerfil();
  }

  carregarPerfil() {
    this.perfilProfessorService.getProfessorById(this.professorId).subscribe({
      next: (res: any) => {
        this.professor = res;
      },
      error: (err: any) => {
        console.error('Erro ao carregar perfil', err);
        alert('Erro ao carregar perfil');
      }
    });
  }

salvarAlteracoes() {
  const professorAtualizado: any = {};

  // Verifica se o nome e o email não estão vazios ou indefinidos
  if (this.professor.name && this.professor.name.trim() !== '') {
    professorAtualizado.name = this.professor.name;
  } else {
    console.error('Nome inválido ou vazio');
  }

  if (this.professor.email && this.professor.email.trim() !== '') {
    professorAtualizado.email = this.professor.email;
  } else {
    console.error('E-mail inválido ou vazio');
  }

  console.log('Dados a serem enviados:', professorAtualizado);  // Verifique os dados aqui

  this.perfilProfessorService.atualizarPerfil(this.professorId, professorAtualizado).subscribe({
    next: () => {
      alert('Perfil atualizado com sucesso!');
      this.router.navigate(['/perfil']);
    },
    error: (err) => {
      console.error('Erro ao atualizar perfil', err);
      alert('Erro ao atualizar perfil');
    }
  });
}

  salvarAlteracaoSenha() {
    const senhaAtualizada = {
      oldPassword: this.professor.senhaAntiga,
      newPassword: this.professor.senhaNova
    };

    this.perfilProfessorService.atualizarSenha(this.professorId, senhaAtualizada).subscribe({
      next: () => {
        alert('Senha atualizada com sucesso!');
        this.router.navigate(['/perfil']); // redireciona para a página de perfil
      },
      error: (err: any) => {
        console.error('Erro ao atualizar senha', err);
        alert('Erro ao atualizar senha');
      }
    });
  }
}
