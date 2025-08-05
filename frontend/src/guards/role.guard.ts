import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    const requiredRole = route.data?.['role'];
    
    if (requiredRole && currentUser.role !== requiredRole) {
      // Redireciona para o dashboard correto do usuário
      this.redirectToCorrectDashboard(currentUser.role);
      return false;
    }

    return true;
  }

  private redirectToCorrectDashboard(role: 'ALUNO' | 'PROFESSOR' | 'RESPONSAVEL') {
    const dashboardRoutes = {
      'PROFESSOR': '/dashboard-professor',
      'ALUNO': '/dashboard-aluno',
      'RESPONSAVEL': '/dashboard-responsaveis'
    };
    
    this.router.navigate([dashboardRoutes[role]]);
  }
}