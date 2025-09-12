import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent  implements OnInit{
@ViewChild('modalLogout') modalLogout!: TemplateRef<any>;
    constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: NgbModal,
  ) {}
  
   currentUser: any;
    ngOnInit(): void { //para aprecer o boas vindas e seu nome
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUser = JSON.parse(userData);
    };
    }


   

  logout() {
 
  this.modalService.open(this.modalLogout, { centered: true }).result.then(
    (result) => {
      if (result === 'confirm') {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    },
    (reason) => {
      console.log('Logout cancelado.');
    }
  );
}

}
