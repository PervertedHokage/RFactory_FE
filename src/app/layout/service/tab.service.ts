import { Injectable, signal, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TabRouteReuseStrategy } from './tab-route-reuse.strategy';

export interface Tab {
    label: string;
    routerLink: any[];
    icon?: string;
}

@Injectable({
    providedIn: 'root'
})
export class TabService {
    tabs = signal<Tab[]>([]);
    activeTabIndex = signal<number>(-1);

    constructor(
        private router: Router,
        private strategy: TabRouteReuseStrategy
    ) {
        // Automatically select the tab based on the current URL
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            const currentUrl = this.router.url;
            const index = this.tabs().findIndex((tab) => {
                const tabUrl = this.router.serializeUrl(this.router.createUrlTree(tab.routerLink));
                return currentUrl === tabUrl;
            });
            if (index !== -1) {
                this.activeTabIndex.set(index);
            }
        });
    }

    addTab(item: any) {
        if (!item.routerLink) return;

        const currentTabs = this.tabs();
        const existingTabIndex = currentTabs.findIndex((tab) =>
            JSON.stringify(tab.routerLink) === JSON.stringify(item.routerLink)
        );

        if (existingTabIndex === -1) {
            const newTab: Tab = {
                label: item.label,
                routerLink: item.routerLink,
                icon: item.icon
            };
            this.tabs.set([...currentTabs, newTab]);
            this.activeTabIndex.set(this.tabs().length - 1);
        } else {
            this.activeTabIndex.set(existingTabIndex);
        }
    }

    removeTab(index: number, event?: Event) {
        if (event) {
            event.stopPropagation();
        }

        const currentTabs = this.tabs();
        const removedTab = currentTabs[index];
        const newTabs = currentTabs.filter((_, i) => i !== index);

        // Clear the route cache for the removed tab
        if (removedTab && removedTab.routerLink) {
            const url = this.router.serializeUrl(this.router.createUrlTree(removedTab.routerLink));
            this.strategy.clearCache(url);
        }

        this.tabs.set(newTabs);

        if (newTabs.length === 0) {
            this.activeTabIndex.set(-1);
            this.router.navigate(['/']);
        } else if (this.activeTabIndex() === index) {
            const nextIndex = Math.min(index, newTabs.length - 1);
            this.activeTabIndex.set(nextIndex);
            this.router.navigate(newTabs[nextIndex].routerLink);
        } else if (this.activeTabIndex() > index) {
            this.activeTabIndex.set(this.activeTabIndex() - 1);
        }
    }

    selectTab(index: number) {
        this.activeTabIndex.set(index);
        this.router.navigate(this.tabs()[index].routerLink);
    }

    reorderTabs(fromIndex: number, toIndex: number) {
        const tabs = [...this.tabs()];
        const activeIndex = this.activeTabIndex();
        const activeTab = tabs[activeIndex];

        const [movedTab] = tabs.splice(fromIndex, 1);
        tabs.splice(toIndex, 0, movedTab);

        this.tabs.set(tabs);

        // Update active index to track the active tab's new position
        const newActiveIndex = tabs.indexOf(activeTab);
        this.activeTabIndex.set(newActiveIndex);
    }

    closeAll() {
        const tabs = this.tabs();
        tabs.forEach((tab) => this.clearTabCache(tab));
        this.tabs.set([]);
        this.activeTabIndex.set(-1);
        this.router.navigate(['/']);
    }

    closeOther(index: number) {
        const tabs = this.tabs();
        const tabToKeep = tabs[index];
        const tabsToRemove = tabs.filter((_, i) => i !== index);

        tabsToRemove.forEach((tab) => this.clearTabCache(tab));

        this.tabs.set([tabToKeep]);
        this.activeTabIndex.set(0);
        this.router.navigate(tabToKeep.routerLink);
    }

    closeLeft(index: number) {
        if (index <= 0) return;
        const tabs = this.tabs();
        const tabsToRemove = tabs.slice(0, index);
        const tabsToKeep = tabs.slice(index);

        tabsToRemove.forEach((tab) => this.clearTabCache(tab));

        this.tabs.set(tabsToKeep);

        const currentActiveIndex = this.activeTabIndex();
        if (currentActiveIndex < index) {
            // Active tab was closed. Select the first of remaining (the one right-clicked)
            this.activeTabIndex.set(0);
            this.router.navigate(tabsToKeep[0].routerLink);
        } else {
            // Active tab is kept. Adjust index.
            this.activeTabIndex.set(currentActiveIndex - index);
        }
    }

    closeRight(index: number) {
        const tabs = this.tabs();
        if (index >= tabs.length - 1) return;

        const tabsToKeep = tabs.slice(0, index + 1);
        const tabsToRemove = tabs.slice(index + 1);

        tabsToRemove.forEach((tab) => this.clearTabCache(tab));

        this.tabs.set(tabsToKeep);

        const currentActiveIndex = this.activeTabIndex();
        if (currentActiveIndex > index) {
            // Active tab was closed. Select the last of remaining (the one right-clicked)
            this.activeTabIndex.set(index);
            this.router.navigate(tabsToKeep[index].routerLink);
        }
    }

    private clearTabCache(tab: Tab) {
        if (tab && tab.routerLink) {
            const url = this.router.serializeUrl(this.router.createUrlTree(tab.routerLink));
            this.strategy.clearCache(url);
        }
    }
}
