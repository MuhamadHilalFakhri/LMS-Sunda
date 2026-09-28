import {
    useEffect,
    useRef,
    useState,
    type KeyboardEvent,
    type PointerEvent,
} from 'react';
import { t } from '@/lib/ui-language';
import { createWelcomeMascotScene } from '@/pages/welcome-mascot-scene';
import type { WelcomeMascotControls } from '@/pages/welcome-mascot-scene';

type MascotStatus = 'loading' | 'ready' | 'error';
const ROTATION_STEP = Math.PI / 12;
const MASCOT_BREAKPOINT = '(min-width: 768px)';

export function WelcomeMascot() {
    const hostRef = useRef<HTMLDivElement>(null);
    const controlsRef = useRef<WelcomeMascotControls | null>(null);
    const dragRef = useRef<{ pointerId: number; lastX: number } | null>(null);
    const [status, setStatus] = useState<MascotStatus>('loading');

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;

        let disposed = false;
        let disposeScene: (() => void) | undefined;
        let intersectionObserver: IntersectionObserver | undefined;
        let idleTask: number | undefined;
        let startupTimer: number | undefined;
        const viewport = window.matchMedia(MASCOT_BREAKPOINT);

        const cancelPendingMount = () => {
            intersectionObserver?.disconnect();
            intersectionObserver = undefined;

            if (idleTask !== undefined) {
                const idleWindow = window as Window & {
                    cancelIdleCallback?: (handle: number) => void;
                };
                idleWindow.cancelIdleCallback?.(idleTask);
                idleTask = undefined;
            }

            if (startupTimer !== undefined) {
                window.clearTimeout(startupTimer);
                startupTimer = undefined;
            }
        };

        const start = () => {
            idleTask = undefined;
            startupTimer = undefined;
            if (disposed || !viewport.matches || disposeScene) return;
            disposeScene = createWelcomeMascotScene(host, {
                onReady: (controls) => {
                    if (disposed) return;
                    controlsRef.current = controls;
                    setStatus('ready');
                },
                onError: () => {
                    if (!disposed) setStatus('error');
                },
            });
        };

        const scheduleMount = () => {
            if (disposed || !viewport.matches || disposeScene) return;

            const idleWindow = window as Window & {
                requestIdleCallback?: (
                    callback: () => void,
                    options?: { timeout: number },
                ) => number;
            };

            if (idleWindow.requestIdleCallback) {
                idleTask = idleWindow.requestIdleCallback(start, {
                    timeout: 1400,
                });
                return;
            }

            startupTimer = window.setTimeout(start, 250);
        };

        const observeHost = () => {
            if (!viewport.matches || disposed) return;

            if ('IntersectionObserver' in window) {
                intersectionObserver = new IntersectionObserver(([entry]) => {
                    if (!entry.isIntersecting) return;
                    intersectionObserver?.disconnect();
                    intersectionObserver = undefined;
                    scheduleMount();
                }, { rootMargin: '80px' });
                intersectionObserver.observe(host);
            } else {
                scheduleMount();
            }
        };

        const handleViewportChange = (event: MediaQueryListEvent) => {
            if (event.matches) {
                observeHost();
                return;
            }

            cancelPendingMount();
            controlsRef.current = null;
            disposeScene?.();
            disposeScene = undefined;
            setStatus('loading');
        };

        viewport.addEventListener('change', handleViewportChange);
        observeHost();

        return () => {
            disposed = true;
            viewport.removeEventListener('change', handleViewportChange);
            cancelPendingMount();
            controlsRef.current = null;
            disposeScene?.();
        };
    }, []);

    const rotate = (direction: -1 | 1) => {
        controlsRef.current?.rotateBy(direction * ROTATION_STEP);
    };

    const startDrag = (event: PointerEvent<HTMLDivElement>) => {
        if (
            status !== 'ready' ||
            !event.isPrimary
        )
            return;

        dragRef.current = { pointerId: event.pointerId, lastX: event.clientX };
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.classList.add('is-dragging');
    };

    const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;

        const delta = event.clientX - drag.lastX;
        drag.lastX = event.clientX;
        controlsRef.current?.rotateBy(delta * 0.009);
    };

    const endDrag = (event: PointerEvent<HTMLDivElement>) => {
        if (dragRef.current?.pointerId !== event.pointerId) return;
        dragRef.current = null;
        event.currentTarget.classList.remove('is-dragging');
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    const rotateWithKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        rotate(event.key === 'ArrowLeft' ? -1 : 1);
    };

    return (
        <div className="landing-hero__mascot">
            <div
                ref={hostRef}
                className={`landing-mascot${status === 'ready' ? ' is-ready' : ''}`}
                role="group"
                aria-label={t(
                    'Karakter Sawala interaktif. Seret atau gunakan tombol panah kiri dan kanan untuk memutar.',
                )}
                aria-busy={status === 'loading'}
                aria-describedby={
                    status === 'ready' ? 'landing-mascot-hint' : undefined
                }
                tabIndex={status === 'ready' ? 0 : -1}
                onPointerDown={startDrag}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onLostPointerCapture={endDrag}
                onKeyDown={rotateWithKeyboard}
            >
                {status !== 'ready' && (
                    <div className="landing-mascot__fallback" aria-hidden="true">
                        <span className="landing-mascot__halo" />
                        <span className="landing-mascot__script sunda-script">
                            ᮞ
                        </span>
                    </div>
                )}
                {status === 'ready' && (
                    <span
                        id="landing-mascot-hint"
                        className="landing-mascot__hint"
                    >
                        {t('Seret untuk memutar')}
                    </span>
                )}
            </div>
            {status === 'error' && (
                <span className="landing-mascot__error" role="status">
                    Pratinjau 3D tidak tersedia di perangkat ini.
                </span>
            )}
        </div>
    );
}
