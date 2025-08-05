import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'], 
})

export class LoginComponent {
  loginData = {
    email: '',
    password: ''
  };
  
  selectedRole: 'ALUNO' | 'PROFESSOR' | 'RESPONSAVEL' | null = null;
  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  selectRole(role: 'ALUNO' | 'PROFESSOR' | 'RESPONSAVEL') {
    this.selectedRole = role;
  }

  onSubmit() {
    if (!this.selectedRole) {
      this.errorMessage = 'Selecione o tipo de usuário';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        // Verifica se o role do usuário corresponde ao selecionado
        if (response.user.role !== this.selectedRole) {
          this.errorMessage = 'Tipo de usuário incorreto para este email';
          this.loading = false;
          return;
        }
        
        console.log('Login realizado com sucesso', response);
        
        // Redireciona para o dashboard específico baseado no role
        this.redirectToDashboard(response.user.role);
      },
      error: (error) => {
        console.error('Erro no login', error);
        this.errorMessage = error.error?.message || 'Erro ao fazer login';
        this.loading = false;
      }
    });
  }

  private redirectToDashboard(role: 'ALUNO' | 'PROFESSOR' | 'RESPONSAVEL') {
    const dashboardRoutes = {
      'PROFESSOR': '/dashboard-professor',
      'ALUNO': '/dashboard-aluno',
      'RESPONSAVEL': '/dashboard-responsaveis'
    };
    
    this.router.navigate([dashboardRoutes[role]]);
  }

  goToRegister(event: Event) {
    event.preventDefault();
    this.router.navigate(['/register']);
  }
}
