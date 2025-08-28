import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { Navbar2Component } from "../../../navbar2/navbar2.component";

@Component({
  selector: 'app-perfil-editar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar2Component],
  templateUrl: './perfil-editar.component.html',
  styleUrls: ['./perfil-editar.component.scss'],
})
export class PerfilEditarComponent implements OnInit {
  usuario: any = {
    name: '',
    email: '',
    senhaAntiga: '',
    senhaNova: ''
  };

  usuarioId: string = '';
  usuarioRole: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.usuarioId = this.route.snapshot.paramMap.get('id')!;
    const currentUser = this.authService.getCurrentUser();

    if (currentUser && currentUser.role) {
      this.usuarioRole = currentUser.role;
    } else {
      console.error('Role do usuário não encontrada. Verifique o AuthService.');
      this.router.navigate(['/login']);
      return;
    }

    if (this.usuarioId) {
      this.carregarPerfil();
    }
  }

  carregarPerfil(): void {
    this.userService.getUserById(this.usuarioId, this.usuarioRole).subscribe({
      next: (res: any) => {
        this.usuario = res;
      },
      error: (err: any) => {
        console.error('Erro ao carregar perfil', err);
        alert('Erro ao carregar perfil do usuário.');
      }
    });
  }

  salvarAlteracoes(): void {
    const dadosAtualizados = {
      name: this.usuario.name,
      email: this.usuario.email
    };

    this.userService.updateUser(this.usuarioId, this.usuarioRole, dadosAtualizados).subscribe({
      next: () => {
        alert('Perfil atualizado com sucesso!');
        this.authService.updateCurrentUser({
          name: this.usuario.name,
          email: this.usuario.email
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
      oldPassword: this.usuario.senhaAntiga,
      newPassword: this.usuario.senhaNova
    };

    this.userService.updatePassword(this.usuarioId, this.usuarioRole, senhaAtualizada).subscribe({
      next: () => {
        alert('Senha atualizada com sucesso!');
        this.usuario.senhaAntiga = '';
        this.usuario.senhaNova = '';
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
}}





