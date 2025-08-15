import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit{

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  currentUser: any;
  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    };
    }
  
  logout() {
      const sair = confirm("deseja realmente sair ?")
      if(sair){this.authService.logout();
      this.router.navigate(['/login']); }

    }

}
