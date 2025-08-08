import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterModule],
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

  getRoleDisplayName(role: string): string {
    const roles = {
      'PROFESSOR': 'Professor',
      'ALUNO': 'Aluno',
      'RESPONSAVEL': 'Responsável'
    };
    return roles[role as keyof typeof roles] || role;
  }
}
