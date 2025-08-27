import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Navbar2Component } from "../../../navbar2/navbar2.component";

@Component({
  selector: 'app-acompanhamento-filhos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar2Component],
  templateUrl: './acompanhamento-filhos.component.html',
  styleUrls: ['./acompanhamento-filhos.component.scss']
})
export class AcompanhamentoFilhosComponent implements OnInit {
  filhos: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    private location: Location
  ) {} 

  ngOnInit(): void {
    this.getFilhosDoResponsavel();
  }

  getFilhosDoResponsavel(): void {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser && currentUser.id) {
      this.userService.getFilhosByResponsavelId(currentUser.id).subscribe({
        next: (data) => {
          this.filhos = data;
        },
        error: (error) => {
          console.error('Erro ao buscar filhos:', error);
        }
      });
    } else {
      console.warn('Usuário responsável não encontrado no localStorage.');
    }
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
}
}