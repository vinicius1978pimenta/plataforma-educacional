import { Routes } from '@angular/router';
import { LoginComponent } from '../auth/undefined/login/login.component';
import { RegisterComponent } from '../auth/undefined/register/register.component';
import { DashboardProfessorComponent } from '../dashboard/professor/dashboard-professor.component';
import { DashboardAlunoComponent } from '../dashboard/aluno/dashboard-aluno.component';
import { DahsboardResponsaveisComponent } from '../dashboard/responsaveis/dahsboard-responsaveis.component';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { MaterialListComponent } from './material/material-list/material-list';
import { MaterialFormComponent } from './material/material-form/material-form';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Rotas públicas
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Dashboards protegidos por autenticação e role específico
  {
    path: 'dashboard-professor',
    component: DashboardProfessorComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'PROFESSOR' }
  },
  {
    path: 'dashboard-aluno',
    component: DashboardAlunoComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ALUNO' }
  },
  {
    path: 'dashboard-responsaveis',
    component: DahsboardResponsaveisComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'RESPONSAVEL' }
  },

  // Rota genérica de dashboard (você pode adaptar isso melhor depois)
  {
    path: 'dashboard',
    component: LoginComponent, // temporário — pode ser substituído por um redirecionamento inteligente
    canActivate: [AuthGuard]
  },

  // Rotas de materiais (protegidas para professores)
  {
    path: 'materiais',
    component: MaterialListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'PROFESSOR' }
  },
  {
    path: 'materiais/novo',
    component: MaterialFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'PROFESSOR' }
  },
  {
    path: 'materiais/editar/:id',
    component: MaterialFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'PROFESSOR' }
  },

  // Rota fallback
  { path: '**', redirectTo: '/login' }
];

