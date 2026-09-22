"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "../i18n";
import { withBase } from "../../lib/basePath";
import styles from "./res.module.css";

/**
 * On-demand STEP viewer. The 3D libraries load only after confirmation.
 * 按需 STEP 查看器。确认之后才加载 3D 库。
 */
export function StepViewer({ url }) {
  const { lang } = useLang();
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <div className={styles.gate}>
        <p className="home-type-body">
          {lang === "zh"
            ? "外壳预览会再下载大约 8 MB 的 3D 查看器，只在你确认后加载。"
            : "This enclosure preview downloads about 8 MB of 3D viewer code, and only after you confirm."}
        </p>
        <button type="button" className={`${styles.filled} home-type-action home-filled-action`} onClick={() => setArmed(true)}>
          {lang === "zh" ? "加载 3D 预览" : "Load 3D preview"}
        </button>
      </div>
    );
  }

  return <StepCanvas url={url} />;
}

function StepCanvas({ url }) {
  const { lang } = useLang();
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [state, setState] = useState("loading");

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    let cancelled = false;
    let frame = 0;
    let renderer;
    let controls;

    async function run() {
      try {
        const THREE = await import("three");
        const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
        const occtimportjs = (await import("occt-import-js")).default;
        const occt = await occtimportjs({ locateFile: (file) => withBase(`/external/${file}`) });
        const response = await fetch(url);
        if (!response.ok) throw new Error(String(response.status));
        const result = occt.ReadStepFile(new Uint8Array(await response.arrayBuffer()), null);
        if (!result?.success || !result.meshes?.length) throw new Error("empty");
        if (cancelled) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#10241c");
        const group = new THREE.Group();
        for (const mesh of result.meshes) {
          const geometry = buildGeometry(THREE, mesh);
          if (!geometry) continue;
          const colour = mesh.color || [0.75, 0.7, 0.6];
          const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(colour[0], colour[1], colour[2]),
            metalness: 0.3,
            roughness: 0.55,
          });
          group.add(new THREE.Mesh(geometry, material));
        }
        scene.add(group);

        const fit = new THREE.Box3().setFromObject(group);
        const center = fit.getCenter(new THREE.Vector3());
        const size = fit.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        group.position.sub(center);
        group.scale.setScalar(3 / maxDim);
        const fitted = new THREE.Box3().setFromObject(group);
        const fittedCenter = fitted.getCenter(new THREE.Vector3());
        const fittedSize = fitted.getSize(new THREE.Vector3());

        const width = wrap.clientWidth || 640;
        const height = wrap.clientHeight || 480;
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(width, height, false);
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        const distance = Math.max(fittedSize.x, fittedSize.y, fittedSize.z) * 1.6;
        camera.position.set(distance * 0.8, distance * 0.7, distance);
        camera.lookAt(fittedCenter);
        scene.add(new THREE.AmbientLight(0xffffff, 0.55));
        const key = new THREE.DirectionalLight(0xffffff, 1.1);
        key.position.set(distance, distance, distance);
        scene.add(key);

        controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.target.copy(fittedCenter);
        controls.update();
        if (!cancelled) setState("done");

        const loop = () => {
          if (cancelled) return;
          frame = requestAnimationFrame(loop);
          controls.update();
          renderer.render(scene, camera);
        };
        loop();
      } catch (error) {
        console.error("StepViewer", error);
        if (!cancelled) setState("error");
      }
    }

    run();
    const onResize = () => {
      if (renderer && wrap) renderer.setSize(wrap.clientWidth, wrap.clientHeight, false);
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frame);
      controls?.dispose?.();
      renderer?.dispose?.();
    };
  }, [url]);

  return (
    <div className={styles.stepStage} ref={wrapRef}>
      <canvas ref={canvasRef} className={state === "done" ? styles.stepReady : ""} />
      {state !== "done" && (
        <p className={styles.stepStatus}>
          {state === "error"
            ? (lang === "zh" ? "3D 预览没有载入，可以直接下载外壳文件。" : "The 3D preview did not load. Download the enclosure file instead.")
            : (lang === "zh" ? "正在载入 3D…" : "Loading 3D…")}
        </p>
      )}
      {state === "done" && (
        <p className={styles.stepHint}>{lang === "zh" ? "拖动旋转" : "Drag to rotate"}</p>
      )}
    </div>
  );
}

function buildGeometry(THREE, mesh) {
  const positions = mesh.attributes?.position?.array;
  if (!positions?.length) return null;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(Float32Array.from(positions), 3));
  const normals = mesh.attributes?.normal?.array;
  if (normals?.length) geometry.setAttribute("normal", new THREE.BufferAttribute(Float32Array.from(normals), 3));
  const index = mesh.index?.array;
  if (index?.length) geometry.setIndex(new THREE.BufferAttribute(Uint32Array.from(index), 1));
  if (!normals?.length) geometry.computeVertexNormals();
  return geometry;
}
