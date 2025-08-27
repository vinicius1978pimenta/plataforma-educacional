import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-perfil-aluno',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './perfil-aluno.component.html',
  styleUrls: ['./perfil-aluno.component.scss'],
})
export class PerfilAlunoComponent implements OnInit {
  aluno: any = {
    nome: '',
    email: '',
    senha: '',
    senhaAntiga: '',
    senhaNova: ''
  };

  alunoId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.alunoId = this.route.snapshot.paramMap.get('id')!;
    this.carregarPerfil();
  }

  carregarPerfil() {
    this.userService.getUserById(this.alunoId, 'ALUNO').subscribe({
      next: (res: any) => {
        this.aluno = res;
      },
      error: (err: any) => {
        console.error('Erro ao carregar perfil', err);
        alert('Erro ao carregar perfil');
      }
    });
  }

salvarAlteracoes() {
  const alunoAtualizado: any = {};

  if (this.aluno.name && this.aluno.name.trim() !== '') {
    alunoAtualizado.name = this.aluno.name;
  } else {
    console.error('Nome inválido ou vazio');
  }

  if (this.aluno.email && this.aluno.email.trim() !== '') {
  alunoAtualizado.email = this.aluno.email;
  } else {
    console.error('E-mail inválido ou vazio');
  }

  console.log('Dados a serem enviados:', alunoAtualizado);

  this.userService.updateUser(this.alunoId, 'ALUNO', alunoAtualizado).subscribe({
    next: () => {
      alert('Perfil atualizado com sucesso!');
      this.router.navigate(['/perfil']);
    },
    error: (err: any) => {
      console.error('Erro ao atualizar perfil', err);
      alert('Erro ao atualizar perfil');
    }
  });
}

  salvarAlteracaoSenha() {
    const senhaAtualizada = {
      oldPassword: this.aluno.senhaAntiga,
      newPassword: this.aluno.senhaNova
    };

    this.userService.updatePassword(this.alunoId, 'ALUNO', senhaAtualizada).subscribe({
      next: () => {
        alert('Senha atualizada com sucesso!');
        this.router.navigate(['/perfil']);
      },
      error: (err: any) => {
        console.error('Erro ao atualizar senha', err);
        alert('Erro ao atualizar senha');
      }
    });
  }
  voltar(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      const currentUser = this.authService.getCurrentUser();
      let dashboardRoute = '/dashboard';
  
      if (currentUser?.role) {
        switch (currentUser.role) {
          case 'PROFESSOR':
            dashboardRoute = '/dashboard-professor';
            break;
          case 'ALUNO':
            dashboardRoute = '/dashboard-aluno';
            break;
          case 'RESPONSAVEL':
            dashboardRoute = '/dashboard-responsavel';
            break;
        }
      }
    this.router.navigate([dashboardRoute]);
  }
}
}
