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

    const requiredRoles = route.data?.['role'];
    
    if (!requiredRoles) {
      return true;
    }

    if (Array.isArray(requiredRoles)) {
      if (requiredRoles.includes(currentUser.role)) {
        return true;
      }
    } else {
      if (currentUser.role === requiredRoles) {
        return true;
      }
    }

    this.redirectToCorrectDashboard(currentUser.role);
    return false;
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