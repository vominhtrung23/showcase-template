import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageComponent } from './components/page/page.component';
import { CompanyComponent } from './components/company/company.component';


const routes: Routes = [
  { path: 'showcase/:any/languageid/:langid', component: PageComponent },
  { path: 'showcase/:any', component: PageComponent },
  { path: 'showcase/:any/:legacy', component: PageComponent },
  { path: 'showcase/:any/category/:id', component: PageComponent },
  { path: 'showcase/:any/category/:id/:legacy', component: PageComponent },
  { path: 'showcase/:any/page/:id', component: PageComponent },
  { path: 'showcase/:any/page/:id/languageid/:langid', component: PageComponent },
  { path: 'showcase/:any/page/:id/:legacy', component: PageComponent },
  { path: 'cspshowcase', component: PageComponent },
  { path: 'cspshowcase/:legacy', component: PageComponent },
  { path: 'cspshowcase/category/:id', component: PageComponent },
  { path: 'cspshowcase/category/:id/:legacy', component: PageComponent },
  { path: 'cspshowcase/page/:id', component: PageComponent },
  { path: 'cspshowcase/page/:id/:legacy', component: PageComponent },
  { path: 'showcase', component: CompanyComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,
    {
      scrollPositionRestoration: 'enabled',
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
