/**
 * INFO: Interface definitions for K8s resources
 */
export interface Deployment extends Record<string, unknown> {
    apiVersion: string,
    metadata: {
        name: string,
        labels: {
            app: string
        }
    }
}