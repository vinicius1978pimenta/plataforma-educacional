import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../../components-tela-inicial/navbar/navbar.component';

@Component({
  standalone : true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule,NavbarComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

   registerData = {
    name: '',
    email: '',
    password: '',
    role: '' as 'ALUNO' | 'PROFESSOR' | 'RESPONSAVEL' | '',
    responsavelEmail: ''
  };
  
  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  selectRole(role: 'ALUNO' | 'PROFESSOR' | 'RESPONSAVEL') {
    this.registerData.role = role;
    // Limpa o email do responsável se não for aluno
    if (role !== 'ALUNO') {
      this.registerData.responsavelEmail = '';
    }
  }

  onSubmit() {
    if (!this.registerData.role) {
      this.errorMessage = 'Selecione o tipo de usuário';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Prepara os dados para envio
    const dataToSend = {
      name: this.registerData.name,
      email: this.registerData.email,
      password: this.registerData.password,
      role: this.registerData.role,
      ...(this.registerData.role === 'ALUNO' && { 
        responsavelEmail: this.registerData.responsavelEmail 
      })
    };

    this.authService.register(dataToSend).subscribe({
      next: (response) => {
        console.log('Cadastro realizado com sucesso', response);
        this.successMessage = 'Cadastro realizado com sucesso! Redirecionando para login...';
        
        // Redireciona para login após 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Erro no cadastro', error);
        this.errorMessage = error.error?.message || 'Erro ao fazer cadastro';
        this.loading = false;
      }
    });
  }

  goToLogin(event: Event) {
    event.preventDefault();
    this.router.navigate(['/login']);
  }
}


