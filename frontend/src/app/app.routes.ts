import { Routes } from '@angular/router';
import { LoginComponent } from '../auth/undefined/login/login.component';
import { RegisterComponent } from '../auth/undefined/register/register.component';
import { DashboardProfessorComponent } from '../dashboard/professor/dashboard-professor.component';
import { DashboardAlunoComponent } from '../dashboard/aluno/dashboard-aluno.component';
import { DahsboardResponsaveisComponent } from '../dashboard/responsaveis/dahsboard-responsaveis.component';
import { AuthGuard } from '../guards/auth.guard';
import { RoleGuard } from '../guards/role.guard';
import { CriarAtividadeComponent } from '../dashboard/professor/Atividades/criar-atividade/criar-atividade.component';
import { ListarAtividadesComponent } from '../dashboard/professor/Atividades/listar-atividades/listar-atividades.component';
import { EditarAtividadeComponent } from '../dashboard/professor/Atividades/editar-atividade/editar-atividade.component';
import { MaterialListComponent } from './material/material-list/material-list';
import { MaterialFormComponent } from './material/material-form/material-form';
import { InicialComponent } from '../components-tela-inicial/inicial.component';
import { SobreNosComponent } from '../components-tela-inicial/sobre-nos-card/sobre-nos/sobre-nos.component';
import { PerfilEditarComponent } from '../dashboard/professor/perfil-editar/perfil-editar.component';
import { MaterialAtividadesListComponent } from './material-atividades-list/material-atividades-list.component';
import { VocabularioComponent } from '../vocabulario/vocabulario/vocabulario.component';
import { AlunoMaterialListComponent } from '../dashboard/aluno/aluno-material-list/aluno-material-list.component';
import { AlunoMaterialAtividadesListComponent } from '../dashboard/aluno/aluno-material-atividades-list/aluno-material-atividades-list.component';
import { AcompanhamentoFilhosComponent } from '../dashboard/responsaveis/acompanhamento-filhos/acompanhamento-filhos.component';
import { PerfilResponsavelComponent } from '../dashboard/responsaveis/perfil-responsavel/perfil-responsavel.component';
import { PerfilAlunoComponent } from '../dashboard/aluno/perfil-aluno/perfil-aluno.component';
import { CriarAvisoComponent } from './avisos/criar-aviso/criar-aviso.component';
import { MuralAvisosComponent } from './avisos/mural-avisos/mural-avisos.component';
import { CriarConteudoComponent } from '../dashboard/professor/conteudo/criar-conteudo/criar-conteudo.component';
import { RelatoriosAlunoComponent } from '../dashboard/aluno/relatorios-aluno/relatorios-aluno.component';
import { RelatoriosProfessorComponent } from '../dashboard/professor/relatórios-professor/relatorios-professor/relatorios-professor.component';
import { AlunoConteudoListComponent } from '../dashboard/aluno/conteudos/aluno-conteudo-list.component';
import { ProfessorAlunosListComponent } from '../dashboard/professor/professor-alunos-list/professor-alunos-list.component';



export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Rotas públicas
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {path: 'home', component : InicialComponent },
  {path: 'sobre', component : SobreNosComponent },

  
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
  {
  path: 'dashboard-responsaveis/acompanhamento-filhos',
    component: AcompanhamentoFilhosComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'RESPONSAVEL' }
  },

  {path: 'vocabulario', 
  component:VocabularioComponent,
  canActivate :[AuthGuard,RoleGuard],
  data : {role : 'ALUNO'}},

  { path: 'criar-atividade', component: CriarAtividadeComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'PROFESSOR' } },

{ path: 'atividades', component: ListarAtividadesComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'PROFESSOR' } },
{ path: 'atividades/editar/:id', component: EditarAtividadeComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'PROFESSOR' } },

  // Rota genérica de dashboard (você pode adaptar isso melhor depois)
  {
    path: 'dashboard',
    component: LoginComponent, // temporário — pode ser substituído por um redirecionamento inteligente
    canActivate: [AuthGuard]
  },

  {path : 'criar-conteudo', component : CriarConteudoComponent,canActivate: [AuthGuard, RoleGuard],
    data: { role: 'PROFESSOR' }},

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

  { path: 'perfil-editar/:id', component: PerfilEditarComponent },
  { path: 'perfil-responsavel-editar/:id', component: PerfilResponsavelComponent },
  { path: 'perfil-aluno/:id', component: PerfilAlunoComponent },


{
  path: 'materiais/:id/atividades',  // Usando o ID do material
  component: MaterialAtividadesListComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { role: 'PROFESSOR' }
},
   { path: 'aluno/materiais', component: AlunoMaterialListComponent 
    , canActivate: [AuthGuard, RoleGuard], data: { role: 'ALUNO' }
   },

  { 
  path: 'aluno/materiais/:id/atividades',
  component: AlunoMaterialAtividadesListComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { role: 'ALUNO' }
  },

 {
  path: 'aluno/materiais/:materialId/conteudos',
  component: AlunoConteudoListComponent,
  canActivate: [AuthGuard], // se você usar guards de autenticação
},

  {
    path: 'professor/alunos',
    component: ProfessorAlunosListComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'PROFESSOR' }
  },


  // Rotas de avisos
  {
    path: 'criar-aviso',
    component: CriarAvisoComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'PROFESSOR' }
  },
  {
    path: 'mural-avisos',
    component: MuralAvisosComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ALUNO' }
  },
  {
    path: 'avisos-responsavel',
    component: MuralAvisosComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'RESPONSAVEL' }
  },

{ path: 'aluno/relatorios', component: RelatoriosAlunoComponent, canActivate: [AuthGuard, RoleGuard], data: { role: 'ALUNO' } },

{ path: 'professor/relatorios', component: RelatoriosProfessorComponent,
  canActivate: [AuthGuard, RoleGuard], data: { role: 'PROFESSOR' } },

  // Rota fallback
  { path: '**', redirectTo: '/login' },

];
