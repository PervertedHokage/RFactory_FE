import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FluidModule } from 'primeng/fluid';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService, UserDto } from '../../../service/user.service';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule,
        FluidModule
    ],
    providers: [MessageService, ConfirmationService, UserService],
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss'
})
export class UserManagement implements OnInit {
    users = signal<UserDto[]>([]);

    cols: any[] = [
        { field: 'actions', header: 'Thao tác', width: '10rem' },
        { field: 'loginName', header: 'Tên đăng nhập', width: '15rem' },
        { field: 'fullName', header: 'Họ và tên' },
        { field: 'email', header: 'Email' }
    ];

    userDialog: boolean = false;
    dialogTitle: string = '';
    user: Partial<UserDto> = {};
    saving: boolean = false;

    constructor(
        private userService: UserService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.userService.getUsers().subscribe({
            next: (res) => {
                if (res.success) {
                    this.users.set(res.data);
                }
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách người dùng' });
            }
        });
    }

    openNew() {
        this.user = { loginName: '', fullName: '', email: '', password: '' };
        this.dialogTitle = 'Thêm Người dùng mới';
        this.userDialog = true;
    }

    editUser(user: UserDto) {
        this.user = { ...user };
        this.user.password = ''; // Don't show password hash
        this.dialogTitle = 'Chỉnh sửa Người dùng';
        this.userDialog = true;
    }

    hideDialog() {
        this.userDialog = false;
    }

    saveUser() {
        if (!this.user.loginName || !this.user.fullName || !this.user.email) {
            this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng điền đủ thông tin bắt buộc' });
            return;
        }

        // Only require password for NEW user
        if (!this.user.id && !this.user.password) {
            this.messageService.add({ severity: 'warn', summary: 'Cảnh báo', detail: 'Vui lòng nhập mật khẩu cho người dùng mới' });
            return;
        }

        this.saving = true;
        const userToSave = this.user as UserDto;

        if (userToSave.id) {
            this.userService.updateUser(userToSave.id, userToSave).subscribe({
                next: (res) => {
                    this.saving = false;
                    if (res.success || res.statusCode === 200) {
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật người dùng' });
                        this.loadUsers();
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
            this.userService.createUser(userToSave).subscribe({
                next: (res) => {
                    this.saving = false;
                    if (res.success || res.statusCode === 200 || res.statusCode === 201) {
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm người dùng mới' });
                        this.loadUsers();
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

    deleteUser(user: UserDto) {
        this.confirmationService.confirm({
            message: `Bạn có chắc chắn muốn xoá người dùng "${user.loginName}"?`,
            header: 'Xác nhận xoá',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.userService.deleteUser(user.id!).subscribe({
                    next: (res) => {
                        if (res.success) {
                            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xoá người dùng' });
                            this.loadUsers();
                        } else {
                            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: res.message || 'Xoá thất bại' });
                        }
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Lỗi kết nối máy chủ' });
                    }
                });
            }
        });
    }
}
