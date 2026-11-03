export interface DesktopSceneOptions {
 night: boolean;
 initialTime?: number;
 onReady(): void;
 onLoading?(): void;
 onFallback(reason: 'context-lost' | 'unavailable'): void;
}
export interface DesktopSceneController {
 dispose(): void;
 setNight(night: boolean): Promise<void>;
 setPaused(paused: boolean): void;
 getTime(): number;
}
export function mountDesktopScene(host: HTMLDivElement, options: DesktopSceneOptions): DesktopSceneController;
