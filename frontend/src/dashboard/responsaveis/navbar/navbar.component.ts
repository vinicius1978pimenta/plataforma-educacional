import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@ngneat/transloco';


@Component({
  selector: 'app-navbar',
  imports: [RouterModule,TranslocoModule,],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit{

  constructor(
    private authService: AuthService,
    private router: Router,
    private transloco : TranslocoService
  ) {}



  currentUser: any;
  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    };
    }

     changeLanguage(lang: string) {
    this.transloco.setActiveLang(lang);
      }
    
  getCurrentLang() {
    return this.transloco.getActiveLang();
  }
  
  logout() {
      const sair = confirm("deseja realmente sair ?")
      if(sair){this.authService.logout();
      this.router.navigate(['/login']); }

    }

}
