import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  isCollapsed: boolean = false;
  professor: any;
  currentUser: any;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Restaurar estado do sidebar
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      this.isCollapsed = savedState === 'true';
    }

    // Pegar usuário logado do AuthService
    this.currentUser = this.authService.getCurrentUser();

    // Caso o AuthService não tenha método, pegar direto do localStorage
    if (!this.currentUser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());
  }

  getProfileEditRoute(): string[] {
    if (!this.currentUser || !this.currentUser.id) {
      return ['/login'];
    }
    return ['/perfil-editar', this.currentUser.id];
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
