import type { Material, Object3D } from 'three';

const MASCOT_MODEL = '/models/sawala-mascot.glb';

export type WelcomeMascotControls = {
    rotateBy: (radians: number) => void;
};

export function createWelcomeMascotScene(
    host: HTMLDivElement,
    callbacks: {
        onReady: (controls: WelcomeMascotControls) => void;
        onError: () => void;
    },
) {
    let disposed = false;
    let renderer: import('three').WebGLRenderer | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let model: Object3D | undefined;
    let renderFrame = 0;

    const dispose = () => {
        if (disposed) return;
        disposed = true;
        resizeObserver?.disconnect();
        if (renderFrame) window.cancelAnimationFrame(renderFrame);
        if (model) disposeModel(model);
        renderer?.dispose();
        renderer?.domElement.remove();
    };

    const fail = () => {
        if (disposed) return;
        callbacks.onError();
        dispose();
    };

    const mount = async () => {
        try {
            const [THREE, { GLTFLoader }] = await Promise.all([
                import('three'),
                import('three/addons/loaders/GLTFLoader.js'),
            ]);
            if (disposed) return;

            renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: false,
                powerPreference: 'low-power',
            });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
            renderer.outputColorSpace = THREE.SRGBColorSpace;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.12;
            renderer.setClearColor(0x000000, 0);
            renderer.domElement.setAttribute('aria-hidden', 'true');
            renderer.domElement.className = 'landing-mascot__canvas';
            host.appendChild(renderer.domElement);

            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
            scene.add(new THREE.HemisphereLight(0xffffff, 0xaaa2c5, 2.1));

            const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
            keyLight.position.set(-3, 5, 6);
            scene.add(keyLight);

            const fillLight = new THREE.DirectionalLight(0xc7d0ff, 1.1);
            fillLight.position.set(4, 1, 3);
            scene.add(fillLight);

            const render = () => {
                if (disposed || renderFrame) return;
                renderFrame = window.requestAnimationFrame(() => {
                    renderFrame = 0;
                    if (!disposed && renderer) renderer.render(scene, camera);
                });
            };

            const resize = () => {
                const width = host.clientWidth;
                const height = host.clientHeight;
                if (!renderer || !width || !height) return;

                renderer.setSize(width, height, false);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                render();
            };

            const loader = new GLTFLoader();
            loader.load(
                MASCOT_MODEL,
                (gltf) => {
                    if (disposed) {
                        disposeModel(gltf.scene);
                        return;
                    }

                    model = gltf.scene;
                    const bounds = new THREE.Box3().setFromObject(model);
                    const size = bounds.getSize(new THREE.Vector3());
                    const center = bounds.getCenter(new THREE.Vector3());
                    model.position.sub(center);
                    scene.add(model);

                    const height = Math.max(size.y, size.x, size.z);
                    const distance =
                        (height / 2 / Math.tan((camera.fov * Math.PI) / 360)) *
                        1.22;
                    camera.position.set(0, size.y * 0.04, distance);
                    camera.lookAt(0, -size.y * 0.03, 0);
                    resize();

                    resizeObserver = new ResizeObserver(resize);
                    resizeObserver.observe(host);
                    callbacks.onReady({
                        rotateBy: (radians) => {
                            if (!model || disposed) return;
                            model.rotation.y += radians;
                            render();
                        },
                    });
                },
                undefined,
                fail,
            );
        } catch {
            fail();
        }
    };

    void mount();
    return dispose;
}

function disposeModel(root: Object3D) {
    root.traverse((object) => {
        if (!('isMesh' in object) || !object.isMesh) return;

        const mesh = object as import('three').Mesh;
        mesh.geometry.dispose();
        const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];

        materials.forEach((material) => {
            disposeMaterialTextures(material);
            material.dispose();
        });
    });
}

function disposeMaterialTextures(material: Material) {
    Object.values(material).forEach((value) => {
        if (
            value &&
            typeof value === 'object' &&
            'isTexture' in value &&
            value.isTexture
        ) {
            value.dispose();
        }
    });
}
