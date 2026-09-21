import type { Edition, EditionConfig } from './edition';

export interface BuildEdition { edition: string; enabledModules: string[]; revision: string; }
export const BUILD_OVERRIDE_KEY = 'admin-edition-build-override';

export function applyBuildEdition(server: EditionConfig, build: BuildEdition | null, overriddenRevision: string | null): EditionConfig {
  if (!build || overriddenRevision === build.revision) return server;
  return { ...server, edition: build.edition as Edition, enabledModules: build.enabledModules,
    presets: { ...server.presets, [build.edition]: build.enabledModules } };
}
