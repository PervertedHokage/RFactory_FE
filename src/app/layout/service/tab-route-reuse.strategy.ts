import { RouteReuseStrategy, DetachedRouteHandle, ActivatedRouteSnapshot } from '@angular/router';

export class TabRouteReuseStrategy implements RouteReuseStrategy {
    private storedHandles: { [key: string]: DetachedRouteHandle } = {};

    // Determines if this route (and its subtree) should be detached to be reused later
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        // Cache routes that have a component and are part of the tabbed navigation
        // In this template, most content routes are children of the empty path layout
        return !!route.component;
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
