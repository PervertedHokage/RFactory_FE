import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TreeSelectModule } from 'primeng/treeselect';
import { FluidModule } from 'primeng/fluid';
import { MessageService, ConfirmationService, TreeNode } from 'primeng/api';
import { OrganizationService, OrganizationDto } from '../../../service/organization.service';

@Component({
    selector: 'app-organization-management',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TreeTableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule,
        TreeSelectModule,
        FluidModule
    ],
    providers: [MessageService, ConfirmationService, OrganizationService],
    templateUrl: './organization.component.html',
    styleUrl: './organization.component.scss'
})
export class OrganizationManagement implements OnInit {
    orgNodes = signal<TreeNode[]>([]);

    cols: any[] = [
        { field: 'actions', header: 'Thao tác', width: '10rem' },
        { field: 'organizationName', header: 'Tên tổ chức' },
        { field: 'organizationCode', header: 'Mã tổ chức', width: '15rem' }
    ];

    orgDialog: boolean = false;
    dialogTitle: string = '';
    org: Partial<OrganizationDto> = {};
    parentNodes: TreeNode[] = [];
    selectedParentNode: TreeNode | null = null;
    saving: boolean = false;

    constructor(
        private orgService: OrganizationService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        this.loadOrganizations();
    }

    loadOrganizations() {
        this.orgService.getOrganizations().subscribe({
            next: (res) => {
                if (res.success) {
                    const flatOrgs = res.data;
                    const treeData = this.buildOrgTree(flatOrgs);
                    this.orgNodes.set(treeData);
                    this.parentNodes = this.buildParentNodes(flatOrgs);

                    if (this.org.parentId) {
                        this.selectedParentNode = this.findNode(this.parentNodes, this.org.parentId) || null;
                    }
                }
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách tổ chức' });
            }
        });
    }

    buildOrgTree(flatOrgs: OrganizationDto[]): TreeNode[] {
        const map = new Map<number, TreeNode>();
        const roots: TreeNode[] = [];

        // First pass: Create nodes
        flatOrgs.forEach(org => {
            map.set(org.id!, {
                data: org,
                children: [],
                expanded: true
            });
        });

        // Second pass: Build hierarchy
        flatOrgs.forEach(org => {
            const node = map.get(org.id!);
            if (org.parentId && map.has(org.parentId)) {
                map.get(org.parentId)!.children!.push(node!);
            } else {
                roots.push(node!);
            }
        });

        return roots;
    }

    buildParentNodes(flatOrgs: OrganizationDto[], currentId?: number): TreeNode[] {
        const map = new Map<number, TreeNode>();
        const roots: TreeNode[] = [];

        // filter out descendants to prevent circular refs
        const forbiddenIds = new Set<number>();
        if (currentId) {
            const findDescendants = (id: number) => {
                forbiddenIds.add(id);
                flatOrgs.filter(o => o.parentId === id).forEach(o => findDescendants(o.id!));
            };
            findDescendants(currentId);
        }

        flatOrgs.filter(o => !forbiddenIds.has(o.id!)).forEach(org => {
            map.set(org.id!, {
                label: org.organizationName,
                data: org.id,
                key: org.id?.toString(),
                children: []
            });
        });

        flatOrgs.forEach(org => {
            if (map.has(org.id!) && org.parentId && map.has(org.parentId)) {
                map.get(org.parentId)!.children!.push(map.get(org.id!)!);
            } else if (map.has(org.id!)) {
                roots.push(map.get(org.id!)!);
            }
        });

        return roots;
    }

    updateParentNodes(orgs: OrganizationDto[], currentId?: number) {
        this.parentNodes = this.buildParentNodes(orgs, currentId);
        if (this.org.parentId) {
            this.selectedParentNode = this.findNode(this.parentNodes, this.org.parentId) || null;
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
            this.org.parentId = event.node.data;
        }
    }

    onParentUnselect() {
        this.org.parentId = null;
    }

    onParentClear() {
        this.selectedParentNode = null;
        this.org.parentId = null;
    }

    openNew() {
        this.org = { organizationName: '', organizationCode: '', parentId: null };
        this.dialogTitle = 'Thêm Tổ chức mới';
        this.orgService.getOrganizations().subscribe(res => {
            if (res.success) this.updateParentNodes(res.data);
        });
        this.orgDialog = true;
    }

    editOrg(org: OrganizationDto) {
        this.org = { ...org };
        this.dialogTitle = 'Chỉnh sửa Tổ chức';
        this.orgService.getOrganizations().subscribe(res => {
            if (res.success) this.updateParentNodes(res.data, org.id);
        });
        this.orgDialog = true;
    }

    hideDialog() {
        this.orgDialog = false;
    }

    saveOrg() {
        if (!this.org.organizationName || !this.org.organizationCode) {
            this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng điền đủ thông tin bắt buộc' });
            return;
        }

        this.saving = true;
        const orgToSave = this.org as OrganizationDto;

        if (orgToSave.id) {
            this.orgService.updateOrganization(orgToSave.id, orgToSave).subscribe({
                next: (res) => {
                    this.saving = false;
                    if (res.success || res.statusCode === 200) {
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật tổ chức' });
                        this.loadOrganizations();
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
            this.orgService.createOrganization(orgToSave).subscribe({
                next: (res) => {
                    this.saving = false;
                    if (res.success || res.statusCode === 200 || res.statusCode === 201) {
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm tổ chức mới' });
                        this.loadOrganizations();
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

    deleteOrg(org: OrganizationDto) {
        this.confirmationService.confirm({
            message: `Bạn có chắc chắn muốn xoá tổ chức "${org.organizationName}"?`,
            header: 'Xác nhận xoá',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.orgService.deleteOrganization(org.id!).subscribe({
                    next: (res) => {
                        if (res.success) {
                            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xoá tổ chức' });
                            this.loadOrganizations();
                        }
                    }
                });
            }
        });
    }
}
