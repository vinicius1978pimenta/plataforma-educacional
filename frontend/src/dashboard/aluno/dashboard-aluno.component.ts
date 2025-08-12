import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserProfileComponent } from "../../app/perfil/perfil-usuario/perfil-usuario.component";


@Component({
  selector: 'app-dashboard-aluno',
  standalone: true,  
  imports: [CommonModule, RouterModule, UserProfileComponent],
  templateUrl: './dashboard-aluno.component.html',
  styleUrls: ['./dashboard-aluno.component.scss'],  
})
export class DashboardAlunoComponent implements OnInit {

  currentUser: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
  }

  logout() {
    const sair = confirm("Deseja realmente sair?");
    if (sair) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  irParaMateriais() {
    this.router.navigate(['./materiais']);
  }
}
