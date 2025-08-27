import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { Navbar2Component } from "../../../navbar2/navbar2.component";

@Component({
  selector: 'app-perfil-responsavel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar2Component],
  templateUrl: './perfil-responsavel.component.html',
  styleUrls: ['./perfil-responsavel.component.scss'],
})
export class PerfilResponsavelComponent implements OnInit {
  responsavel: any = {
    name: '',
    email: '',
    senhaAntiga: '',
    senhaNova: ''
  };

  responsavelId: string = '';
  responsavelRole: string = 'RESPONSAVEL';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.responsavelId = this.route.snapshot.paramMap.get('id')!;
    const currentUser = this.authService.getCurrentUser();

    if (currentUser && currentUser.role) {
    } else {
      console.error('Role do usuário não encontrada. Verifique o AuthService.');
      this.router.navigate(['/login']);
      return;
    }

    if (this.responsavelId) {
      this.carregarPerfil();
    }
  }

  carregarPerfil(): void {
    this.userService.getUserById(this.responsavelId, this.responsavelRole).subscribe({
      next: (res: any) => {
        this.responsavel = res;
      },
      error: (err: any) => {
        console.error('Erro ao carregar perfil', err);
        alert('Erro ao carregar perfil do responsável.');
      }
    });
  }

  salvarAlteracoes(): void {
    const dadosAtualizados = {
      name: this.responsavel.name,
      email: this.responsavel.email
    };

    this.userService.updateUser(this.responsavelId, this.responsavelRole, dadosAtualizados).subscribe({
      next: () => {
        alert('Perfil atualizado com sucesso!');
        this.authService.updateCurrentUser({
          name: this.responsavel.name,
          email: this.responsavel.email
        });
        this.voltar();
      },
      error: (err) => {
        console.error('Erro ao atualizar perfil', err);
        alert('Erro ao atualizar perfil.');
      }
    });
  }

  salvarAlteracaoSenha(): void {
    const senhaAtualizada = {
      oldPassword: this.responsavel.senhaAntiga,
      newPassword: this.responsavel.senhaNova
    };

    this.userService.updatePassword(this.responsavelId, this.responsavelRole, senhaAtualizada).subscribe({
      next: () => {
        alert('Senha atualizada com sucesso!');
        this.responsavel.senhaAntiga = '';
        this.responsavel.senhaNova = '';
      },
      error: (err: any) => {
        console.error('Erro ao atualizar senha', err);
        alert(err.error.message || 'Erro ao atualizar senha.');
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