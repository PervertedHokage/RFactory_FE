import { Routes } from '@angular/router';
import { MenuManagement } from './menu/menu.component'
import { OrganizationManagement } from './organization/organization.component';
import { UserManagement } from './user/user.component';
export default [
    { path: 'menu', component: MenuManagement },
    { path: 'organization', component: OrganizationManagement },
    { path: 'user', component: UserManagement },
    { path: '**', redirectTo: '/notfound' }
] as Routes;


