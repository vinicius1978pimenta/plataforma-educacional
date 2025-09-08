import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { AvisosService } from '../../../services/avisos.service';


@Component({
  selector: 'app-navbar',
  imports: [RouterModule,TranslocoModule,TranslocoPipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit{
  botoes: any

  constructor(
    private authService: AuthService,
    private router: Router,
    private transloco: TranslocoService,
    public avisosService: AvisosService
  ) {}

  

  changeLanguage(lang: string) {
    this.transloco.setActiveLang(lang);
      }
    
  getCurrentLang() {
    return this.transloco.getActiveLang();
  }

  currentUser: any;
  ngOnInit(): void {
      const userData = localStorage.getItem('user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      };

      this.changeLanguage
      this.getCurrentLang

      this.avisosService.getAvisosAluno().subscribe(avisos => {
      console.log(`Navbar carregou ${avisos.length} avisos no serviço.`);
    });



    }


  
  logout() {
      const sair = confirm("deseja realmente sair ?")
      if(sair){this.authService.logout();
      this.router.navigate(['/login']); }

    }

}
