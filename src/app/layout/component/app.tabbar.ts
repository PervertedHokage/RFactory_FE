import { Component, ElementRef, ViewChild, ViewChildren, QueryList, AfterViewInit, OnDestroy, ChangeDetectorRef, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { TabsModule } from 'primeng/tabs';
import { MenuModule } from 'primeng/menu';
import { ContextMenuModule } from 'primeng/contextmenu';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MenuItem } from 'primeng/api';
import { TabService } from '../service/tab.service';

@Component({
    selector: 'app-tabbar',
    standalone: true,
    imports: [CommonModule, RouterModule, TabsModule, MenuModule, ButtonModule, TooltipModule, DragDropModule, ContextMenuModule],
    template: `
        <div class="layout-tab-container" *ngIf="tabService.tabs().length > 0">
            <div class="tab-scroller-wrapper" #scroller>
                <p-contextMenu #cm [model]="contextMenuItems" appendTo="body" />
                <p-tabs [value]="tabService.activeTabIndex()">
                    <p-tablist #tablist cdkDropList cdkDropListOrientation="horizontal" (cdkDropListDropped)="onTabDrop($event)">
                        <p-tab 
                            *ngFor="let tab of tabService.tabs(); let i = index" 
                            [value]="i" 
                            (click)="tabService.selectTab(i)" 
                            (contextmenu)="onContextMenu($event, i)"
                            [ngClass]="{'active-tab': tabService.activeTabIndex() === i}" 
                            #tabItem
                            cdkDrag
                            [cdkDragLockAxis]="'x'">
                            <div class="p-tab-drag-preview" *cdkDragPreview>
                                <i *ngIf="tab.icon" [ngClass]="tab.icon" class="tab-icon"></i>
                                <span class="tab-label">{{ tab.label }}</span>
                            </div>
                            <div class="tab-item-content">
                                <i *ngIf="tab.icon" [ngClass]="tab.icon" class="tab-icon"></i>
                                <span class="tab-label">{{ tab.label }}</span>
                                <i class="pi pi-times close-icon" (click)="tabService.removeTab(i, $event)"></i>
                            </div>
                        </p-tab>
                    </p-tablist>
                </p-tabs>
            </div>
            
            <div class="tab-actions">
                <p-button icon="pi pi-chevron-down" [text]="true" [plain]="true" (click)="onMenuOpen($event, menu)"></p-button>
                <p-menu #menu [model]="hiddenTabs" [popup]="true" appendTo="body"></p-menu>
            </div>
        </div>
    `,
    styles: [`
        :host {
            display: flex;
            flex: 1;
            min-width: 0;
            overflow: hidden;
        }

        .layout-tab-container {
            background-color: transparent;
            display: flex;
            align-items: center;
            border-bottom: none;
            padding: 0 1rem;
            height: 4rem;
            position: relative;
            flex: 1;
            min-width: 0;
            overflow: hidden;
            width: auto;
        }

        .tab-scroller-wrapper {
            flex: 1;
            overflow: hidden;
            display: flex;
        }

        .tab-actions {
            display: flex;
            align-items: center;
            padding-left: 0.5rem;
            border-left: 1px solid rgba(0,0,0,0.1);
            height: 50%;
        }

        :host ::ng-deep {
            .p-tabs {
                border: none;
                background: transparent;
                flex: 1;
                min-width: 0;
            }

            .p-tablist {
                background: transparent;
                border: none;
            }

            .p-tablist-content {
                background: transparent;
                border: none;
            }

            .p-tablist-tab-list {
                background: transparent;
                border: none;
                display: flex;
                overflow-x: auto;
                scrollbar-width: none; /* Firefox */
                height: 44px;
            }

            .p-tablist-tab-list::-webkit-scrollbar {
                display: none; /* Chrome, Safari, Opera */
            }

            .p-tab {
                background: transparent;
                color: var(--text-color-secondary);
                border: none;
                padding: 0 1.25rem;
                min-width: unset;
                border-radius: 0;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
                display: flex;
                align-items: center;
                height: 44px;
                border-bottom: 2px solid transparent;
                white-space: nowrap;
            }

            .p-tab:hover {
                color: var(--text-color);
                background: var(--surface-hover);
            }

            .p-tab.p-tab-active {
                color: var(--primary-color) !important;
                border-bottom: 2px solid var(--primary-color) !important;
                background: transparent !important;
            }

            .p-tab.p-tab-active .tab-label {
                font-weight: 700;
            }

            .p-tab-active .p-tab-ink-bar {
                display: none !important;
            }
        }

        .tab-item-content {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            white-space: nowrap;
        }

        .tab-label {
            font-size: 0.9rem;
            font-weight: 500;
            text-transform: capitalize;
        }

        .tab-icon {
            font-size: 1rem;
            color: var(--text-color-secondary);
        }

        .p-tab-active .tab-icon {
            color: var(--primary-color);
        }

        .close-icon {
            font-size: 0.7rem;
            margin-left: 0.5rem;
            opacity: 0;
            transition: opacity 0.2s;
            padding: 4px;
            border-radius: 50%;
        }

        .p-tab:hover .close-icon {
            opacity: 0.6;
        }

        .close-icon:hover {
            opacity: 1 !important;
            background: #f1f5f9;
            color: #ef4444;
        }
        .cdk-drag-preview {
            box-sizing: border-box;
            border-radius: 4px;
            box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                        0 8px 10px 1px rgba(0, 0, 0, 0.14),
                        0 3px 14px 2px rgba(0, 0, 0, 0.12);
            background-color: #ffffff;
            color: var(--text-color);
            padding: 0 1.25rem;
            display: inline-flex;
            align-items: center;
            height: 4rem;
            font-family: var(--font-family);
            z-index: 1000;
            opacity: 0.9;
            width: auto !important;
            min-width: min-content;
        }

        .cdk-drag-placeholder {
            opacity: 1;
            background: rgba(0, 0, 0, 0.05);
            border: 1px dashed #cbd5e1;
            border-radius: var(--content-border-radius);
        }

        .cdk-drag-animating {
            transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
        }

        .p-tablist-tab-list.cdk-drop-list-dragging .p-tab:not(.cdk-drag-placeholder) {
            transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
        }

        .p-tab-drag-preview {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            width: auto;
            height: 4rem;
            white-space: nowrap;
        }
    `]
})
export class AppTabbar {
    @ViewChild('scroller') scroller!: ElementRef;
    @ViewChildren('tabItem', { read: ElementRef }) tabItems!: QueryList<ElementRef>;
    @ViewChild('cm') cm!: any;

    hiddenTabs: MenuItem[] = [];
    contextMenuItems: MenuItem[] = [];

    constructor(public tabService: TabService, private cdr: ChangeDetectorRef) {
        effect(() => {
            const index = this.tabService.activeTabIndex();
            if (index !== -1) {
                // Use setTimeout to allow the DOM to update before scrolling
                setTimeout(() => {
                    const tabElements = this.tabItems.toArray();
                    if (tabElements[index]) {
                        tabElements[index].nativeElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'nearest',
                            inline: 'center'
                        });
                    }
                }, 0);
            }
        });
    }

    onMenuOpen(event: Event, menu: any) {
        this.updateHiddenTabs();
        menu.toggle(event);
    }

    onTabDrop(event: CdkDragDrop<any[]>) {
        this.tabService.reorderTabs(event.previousIndex, event.currentIndex);
    }

    onContextMenu(event: MouseEvent, index: number) {
        event.preventDefault();
        this.contextMenuItems = [
            {
                label: 'Close',
                icon: 'pi pi-times',
                command: () => this.tabService.removeTab(index)
            },
            {
                label: 'Close Others',
                icon: 'pi pi-fw pi-copy',
                command: () => this.tabService.closeOther(index)
            },
            {
                label: 'Close to Right',
                icon: 'pi pi-fw pi-arrow-right',
                command: () => this.tabService.closeRight(index)
            },
            {
                label: 'Close to Left',
                icon: 'pi pi-fw pi-arrow-left',
                command: () => this.tabService.closeLeft(index)
            },
            {
                label: 'Close All',
                icon: 'pi pi-fw pi-trash',
                command: () => this.tabService.closeAll()
            }
        ];
        this.cm.show(event);
    }

    updateHiddenTabs() {
        if (!this.scroller || !this.tabItems) return;

        const containerRect = this.scroller.nativeElement.getBoundingClientRect();
        const tabs = this.tabService.tabs();

        this.hiddenTabs = this.tabItems.map((tabRef, index) => {
            const tabRect = tabRef.nativeElement.getBoundingClientRect();

            // A tab is "hidden" if it's outside the container's visible area (considering horizontal scroll)
            // We can check if its right edge is beyond container's right edge, 
            // or left edge is before container's left edge.
            const isVisible = (tabRect.left >= containerRect.left && tabRect.right <= containerRect.right);

            if (!isVisible) {
                const tab = tabs[index];
                return {
                    label: tab.label,
                    icon: tab.icon,
                    command: () => {
                        this.tabService.selectTab(index);
                        // Optional: scroll the selected tab into view
                        tabRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    },
                    styleClass: this.tabService.activeTabIndex() === index ? 'active-menu-item' : ''
                } as MenuItem;
            }
            return null;
        }).filter(item => item !== null) as MenuItem[];

        if (this.hiddenTabs.length === 0) {
            this.hiddenTabs = [{ label: 'All tabs visible', disabled: true }];
        }
    }
}
