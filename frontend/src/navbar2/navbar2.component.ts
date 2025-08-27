import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-navbar2',
  imports: [],
  templateUrl: './navbar2.component.html',
  styleUrl: './navbar2.component.scss'
})
export class Navbar2Component {

  constructor(
    private authService: AuthService,
    private location: Location
  ) {}
  
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
    }
  }
}
