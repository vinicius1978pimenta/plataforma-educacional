import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserProfileComponent } from '../../app/perfil/perfil-usuario/perfil-usuario.component';

@Component({
  selector: 'app-dahsboard-responsaveis',
  imports: [CommonModule,RouterModule,UserProfileComponent],
  templateUrl: './dahsboard-responsaveis.component.html',
  styleUrl: './dahsboard-responsaveis.component.scss'
})
export class DahsboardResponsaveisComponent implements OnInit {

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
