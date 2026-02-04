import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { MenuService } from '../../service/menu.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];
    private menuService = inject(MenuService);

    ngOnInit() {
        this.loadDynamicMenu();
    }

    private loadDynamicMenu() {
        this.menuService.getMenus().subscribe({
            next: (res) => {
                if (res.success && res.data) {
                    this.model = this.mapToMenuItems(res.data);
                } else {
                    this.loadDefaultMenu();
                }
            },
            error: () => {
                this.loadDefaultMenu();
            }
        });
    }

    private mapToMenuItems(menus: any[]): MenuItem[] {
        return menus.map((menu) => ({
            label: menu.name,
            icon: menu.icon || 'pi pi-fw pi-circle',
            routerLink: [menu.url],
            items: menu.subMenus && menu.subMenus.length > 0 ? this.mapToMenuItems(menu.subMenus) : undefined
        }));
    }

    private loadDefaultMenu() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                label: 'Management',
                items: [{ label: 'Menu management', icon: 'pi pi-fw pi-list', routerLink: ['/management/menu'] }]
            }
        ];
    }
}
