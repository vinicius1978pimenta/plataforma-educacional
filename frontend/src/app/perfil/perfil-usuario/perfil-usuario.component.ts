import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './perfil-usuario.component.html',
  styleUrl: './perfil-usuario.component.scss'
})
export class UserProfileComponent implements OnInit {
  currentUser: any = null;
  showDropdown = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  closeDropdown(): void {
    this.showDropdown = false;
  }

  logout(): void {
    const confirmacao = confirm('Deseja realmente sair?');
    if (confirmacao) {
      this.authService.logout().subscribe(() => {
        this.router.navigate(['/login']);
      });
    }
  }
  getProfileEditRoute(): string[] {
    if (!this.currentUser || !this.currentUser.id) {
      return ["/login"]; 
    }

    const userId = this.currentUser.id;
    // ADICIONAR: Obtenha o role do usuário
    const userRole = this.currentUser.role;

    // EDITAR: Adicione a lógica condicional para redirecionar com base no role
    if (userRole === 'RESPONSAVEL') {
      return ['/perfil-responsavel-editar', userId];
    } else {
      return ['/perfil-editar', userId];
    }
  }

  getRoleDisplayName(role: string): string {
    const roles = {
      'PROFESSOR': 'Professor',
      'ALUNO': 'Aluno',
      'RESPONSAVEL': 'Responsável'
    };
    return roles[role as keyof typeof roles] || role;
  }
}
