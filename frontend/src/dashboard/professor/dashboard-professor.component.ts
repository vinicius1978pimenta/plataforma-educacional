import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule} from '@angular/router';

@Component({
  selector: 'app-dashboard-professor',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-professor.component.html',
  styleUrl: './dashboard-professor.component.scss'
})
export class DashboardProfessorComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}



    logout() {
      const sair = confirm("deseja Realemte sair ?")
      if(sair){this.authService.logout();
      this.router.navigate(['/login']); }

    }

    irParaMateriais() {
      this.router.navigate(['/materiais']);
    }

    currentUser: any;
    ngOnInit(): void { //para aprecer o boas vindas e seu nome
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    };
    }

}
