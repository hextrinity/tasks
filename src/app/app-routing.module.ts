import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListTasksComponent } from './features/list-tasks/list-tasks.component';
import { ListDeletedTasksComponent } from './features/list-deleted-tasks/list-deleted-tasks.component';

const routes: Routes = [
  { path: '', redirectTo: '/active', pathMatch: 'full' },
  { path: 'active', component: ListTasksComponent },
  { path: 'deleted', component: ListDeletedTasksComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
