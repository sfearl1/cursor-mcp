import { fileURLToPath } from 'url';
import path from 'path';
// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Project root is one level up from src
export const PROJECT_ROOT = path.resolve(__dirname, '..');
export const SRC_ROOT = __dirname;
export const BUILD_ROOT = path.resolve(PROJECT_ROOT, 'build');
// Helper function to resolve paths relative to project root
export function resolveRoot(...paths) {
    return path.resolve(PROJECT_ROOT, ...paths);
}
// Helper function to resolve paths relative to src
export function resolveSrc(...paths) {
    return path.resolve(SRC_ROOT, ...paths);
}
// Helper function to resolve paths relative to build
export function resolveBuild(...paths) {
    return path.resolve(BUILD_ROOT, ...paths);
}
