import { RouteReuseStrategy, DetachedRouteHandle, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TabRouteReuseStrategy implements RouteReuseStrategy {
    private storedHandles: { [key: string]: DetachedRouteHandle } = {};

    // Determines if this route (and its subtree) should be detached to be reused later
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        // Only detach routes that have a component and are NOT the structural layout or auth routes
        // We use pathFromRoot to detect if it's the root layout or an auth route
        const url = this.getResolvedUrl(route);

        if (!route.component || url.includes('auth') || url === '') {
            return false;
        }

        // Avoid detaching routes that have children defined (likely structural layouts)
        if (route.routeConfig?.children && route.routeConfig.children.length > 0) {
            return false;
        }

        return true;
    }

    // Stores the detached route handle
    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        const url = this.getResolvedUrl(route);
        if (handle) {
            this.storedHandles[url] = handle;
        }
    }

    // Determines if this route should be reattached
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        const url = this.getResolvedUrl(route);
        return !!this.storedHandles[url];
    }

    // Retrieves the previously stored route handle
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
        const url = this.getResolvedUrl(route);
        return this.storedHandles[url] || null;
    }

    // Determines if a route should be reused
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        // Ensure we handle cases where routeConfig might be null
        return future.routeConfig === curr.routeConfig;
    }

    // Utility to get the full URL from the snapshot
    private getResolvedUrl(route: ActivatedRouteSnapshot): string {
        return route.pathFromRoot
            .map((v) => v.url.map((segment) => segment.toString()).join('/'))
            .join('/')
            .replace(/\/+/g, '/')
            .replace(/\/$/, '');
    }

    // Public method to clear cache for a specific route when a tab is closed
    public clearCache(url: string): void {
        // Normalizing URL for matching
        const normalizedUrl = url.replace(/\/$/, '');
        if (this.storedHandles[normalizedUrl]) {
            // Destroy the component properly if needed (manually or let Angular handle it)
            delete this.storedHandles[normalizedUrl];
        } else {
            // Try to find matching URL if it's not exact
            const keys = Object.keys(this.storedHandles);
            const match = keys.find(k => k.endsWith(normalizedUrl));
            if (match) {
                delete this.storedHandles[match];
            }
        }
    }
}
