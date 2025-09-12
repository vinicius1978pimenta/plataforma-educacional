import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar2',
  imports: [],
  templateUrl: './navbar2.component.html',
  styleUrl: './navbar2.component.scss'
})
export class Navbar2Component {

  constructor(
    private authService: AuthService,
    private location: Location,
    private router: Router
  ) {}
  
  voltar(): void {
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
          dashboardRoute = '/dashboard-responsaveis';
          break;
        default:
          console.warn('Papel de usuário não reconhecido:', currentUser.role);
          break;
      }
    }
    this.router.navigate([dashboardRoute]);
  }
}