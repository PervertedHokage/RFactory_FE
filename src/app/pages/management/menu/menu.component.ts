import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { TreeSelectModule } from 'primeng/treeselect';
import { FluidModule } from 'primeng/fluid';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService, ConfirmationService, TreeNode } from 'primeng/api';
import { MenuService, MenuDto } from '../../../service/menu.service';

@Component({
    selector: 'app-menu-management',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TreeTableModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule,
        SelectModule,
        TreeSelectModule,
        FluidModule,
        IconFieldModule,
        InputIconModule
    ],
    providers: [MessageService, ConfirmationService, MenuService],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.scss'
})
export class MenuManagement implements OnInit {
    menuNodes = signal<TreeNode[]>([]);

    cols: any[] = [
        { field: 'actions', header: 'Thao tác', width: '10rem' },
        { field: 'name', header: 'Tên Menu' },
        { field: 'url', header: 'Đường dẫn' },
        { field: 'order', header: 'Thứ tự', width: '8rem' }
    ];

    menuDialog: boolean = false;
    dialogTitle: string = '';
    menu: Partial<MenuDto> = {};
    parentOptions: any[] = [];
    parentNodes: TreeNode[] = [];
    selectedParentNode: TreeNode | null = null;
    saving: boolean = false;

    constructor(
        private menuService: MenuService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        this.loadMenus();
    }

    loadMenus() {
        this.menuService.getMenus().subscribe({
            next: (res) => {
                if (res.success) {
                    this.menuNodes.set(this.mapMenusToNodes(res.data));
                    this.updateParentNodes(res.data);
                }
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách menu' });
            }
        });
    }

    mapMenusToNodes(menus: MenuDto[]): TreeNode[] {
        return menus.map(m => ({
            data: m,
            children: m.subMenus ? this.mapMenusToNodes(m.subMenus) : [],
            expanded: true
        }));
    }

    updateParentNodes(menus: MenuDto[], currentId?: number) {
        const buildNodes = (items: MenuDto[], isDescendant: boolean): TreeNode[] => {
            return items
                .filter(i => {
                    const isCurrent = i.id === currentId;
                    return !(isCurrent || isDescendant);
                })
                .map(i => ({
                    label: i.name,
                    data: i.id,
                    key: i.id?.toString(),
                    icon: i.icon,
                    children: i.subMenus ? buildNodes(i.subMenus, false) : []
                }));
        };
        this.parentNodes = buildNodes(menus, false);

        if (this.menu.parentMenuId) {
            this.selectedParentNode = this.findNode(this.parentNodes, this.menu.parentMenuId) || null;
        } else {
            this.selectedParentNode = null;
        }
    }

    findNode(nodes: TreeNode[], id: number): TreeNode | undefined {
        for (const node of nodes) {
            if (node.data === id) return node;
            if (node.children) {
                const found = this.findNode(node.children, id);
                if (found) return found;
            }
        }
        return undefined;
    }

    onParentSelect(event: any) {
        if (event.node) {
            this.menu.parentMenuId = event.node.data;
        }
    }

    onParentUnselect() {
        this.menu.parentMenuId = null;
    }

    onParentClear() {
        this.selectedParentNode = null;
        this.menu.parentMenuId = null;
    }

    openNew() {
        this.menu = { name: '', url: '', icon: '', order: 0, parentMenuId: null };
        this.dialogTitle = 'Thêm Menu mới';
        this.menuService.getMenus().subscribe(res => {
            if (res.success) this.updateParentNodes(res.data);
        });
        this.menuDialog = true;
    }

    editMenu(menu: MenuDto) {
        this.menu = { ...menu };
        this.dialogTitle = 'Chỉnh sửa Menu';
        this.menuService.getMenus().subscribe(res => {
            if (res.success) this.updateParentNodes(res.data, menu.id);
        });
        this.menuDialog = true;
    }

    hideDialog() {
        this.menuDialog = false;
    }

    saveMenu() {
        if (!this.menu.name || !this.menu.url) {
            this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng điền đủ thông tin bắt buộc' });
            return;
        }

        this.saving = true;
        const menuToSave = this.menu as MenuDto;

        if (menuToSave.id) {
            this.menuService.updateMenu(menuToSave.id, menuToSave).subscribe({
                next: (res) => {
                    this.saving = false;
                    if (res.success || res.statusCode === 200) {
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật menu' });
                        this.loadMenus();
                        this.hideDialog();
                    } else {
                        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: res.message || 'Cập nhật thất bại' });
                    }
                },
                error: (err) => {
                    this.saving = false;
                    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Lỗi kết nối máy chủ' });
                }
            });
        } else {
            this.menuService.createMenu(menuToSave).subscribe({
                next: (res) => {
                    this.saving = false;
                    if (res.success || res.statusCode === 200 || res.statusCode === 201) {
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm menu mới' });
                        this.loadMenus();
                        this.hideDialog();
                    } else {
                        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: res.message || 'Thêm mới thất bại' });
                    }
                },
                error: (err) => {
                    this.saving = false;
                    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Lỗi kết nối máy chủ' });
                }
            });
        }
    }

    deleteMenu(menu: MenuDto) {
        this.confirmationService.confirm({
            message: `Bạn có chắc chắn muốn xoá menu "${menu.name}"?`,
            header: 'Xác nhận xoá',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.menuService.deleteMenu(menu.id!).subscribe({
                    next: (res) => {
                        if (res.success) {
                            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xoá menu' });
                            this.loadMenus();
                        }
                    }
                });
            }
        });
    }
}
