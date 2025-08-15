
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core'
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule} from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CardComponent } from './cards/card.component';

@Component({
  selector: 'app-dashboard-aluno',
  imports: [CommonModule, 
            RouterModule,
            NavbarComponent,
            SidebarComponent, 
            CardComponent],

  templateUrl: './dashboard-aluno.component.html',
  styleUrl: './dashboard-aluno.component.scss'
})
export class DashboardAlunoComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}



    logout() {
      const sair = confirm("deseja realmente sair ?")
      if(sair){this.authService.logout();
      this.router.navigate(['/login']); }

    }

    irParaMateriais() {
      this.router.navigate(['././materiais']);
    }

    currentUser: any;
    ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    };
    }

}