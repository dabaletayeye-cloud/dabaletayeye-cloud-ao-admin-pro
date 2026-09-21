# Core boundary

Core contains the application shell, authentication, layout, request adapters, RBAC and shared UI contracts. Optional business modules under `src/modules` must not be imported from this directory. The generated registry is the only application-shell integration point for module routes, menus and permissions.
