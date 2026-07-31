"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./thumb.module.css";

// 用 occt-import-js(WASM) 解析 STEP → three.js 渲染可旋转 3D 缩略图。
// 字节经 /api/proxy 取（绕 CORS）。
export default function StepThumb({ url }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [state, setState] = useState("idle");

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    let cancelled = false;
    let raf = 0;
    let renderer, controls;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        run();
      },
      { rootMargin: "200px" }
    );
    io.observe(wrap);

    async function run() {
      if (cancelled) return;
      setState("loading");
      try {
        const THREE = await import("three");
        const { OrbitControls } = await import(
          "three/examples/jsm/controls/OrbitControls.js"
        );
        const occtimportjs = (await import("occt-import-js")).default;

        const occt = await occtimportjs({
          locateFile: (p) => "/external/" + p,
        });

        const proxy = "/api/proxy?url=" + encodeURIComponent(url);
        const res = await fetch(proxy);
        if (!res.ok) throw new Error("fetch step " + res.status);
        const buf = new Uint8Array(await res.arrayBuffer());
        const result = occt.ReadStepFile(buf, null);
        if (!result || !result.success || !result.meshes?.length)
          throw new Error("step parse empty");

        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#0e2a22");

        // meshes
        const group = new THREE.Group();
        const box = new THREE.Box3();
        for (const mesh of result.meshes) {
          const geom = buildGeometry(THREE, mesh);
          if (!geom) continue;
          const col = mesh.colour || [0.75, 0.7, 0.6];
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(col[0], col[1], col[2]),
            metalness: 0.3,
            roughness: 0.55,
          });
          const m = new THREE.Mesh(geom, mat);
          group.add(m);
          box.expandByObject(m);
        }
        scene.add(group);

        // 居中并缩放到统一尺寸
        const fitBox = new THREE.Box3().setFromObject(group);
        const center = new THREE.Vector3();
        fitBox.getCenter(center);
        const size = new THREE.Vector3();
        fitBox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        group.position.sub(center);            // 几何中心移到原点
        const s = 3 / maxDim;
        group.scale.setScalar(s);
        // 缩放后的包围盒用于相机
        const fitted = new THREE.Box3().setFromObject(group);
        const fc = new THREE.Vector3();
        fitted.getCenter(fc);
        const fs = new THREE.Vector3();
        fitted.getSize(fs);

        const w = wrap.clientWidth || 400;
        const h = wrap.clientHeight || 280;
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(w, h, false);
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));

        const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
        const dist = Math.max(fs.x, fs.y, fs.z) * 1.6;
        camera.position.set(dist * 0.8, dist * 0.7, dist);
        camera.lookAt(fc);

        const amb = new THREE.AmbientLight(0xffffff, 0.55);
        scene.add(amb);
        const key = new THREE.DirectionalLight(0xffffff, 1.1);
        key.position.set(dist, dist, dist);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0x88aaff, 0.35);
        fill.position.set(-dist, -dist * 0.5, dist);
        scene.add(fill);

        controls = new OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.target.copy(fc);
        controls.update();

        if (!cancelled) setState("done");
        const loop = () => {
          if (cancelled) return;
          raf = requestAnimationFrame(loop);
          controls.update();
          renderer.render(scene, camera);
        };
        loop();
      } catch (e) {
        console.error("StepThumb", e);
        if (!cancelled) setState("error");
      }
    }

    const onResize = () => {
      if (renderer && wrap) {
        renderer.setSize(wrap.clientWidth, wrap.clientHeight, false);
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      io.disconnect();
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      try {
        controls?.dispose?.();
        renderer?.dispose?.();
      } catch {}
    };
  }, [url]);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <canvas ref={canvasRef} className={state === "done" ? styles.show : ""} />
      {state !== "done" && (
        <div className={styles.loading}>
          {state === "error"
            ? "3D 预览失败"
            : state === "loading"
            ? "渲染 3D…"
            : "3D 外壳"}
        </div>
      )}
    </div>
  );
}

function buildGeometry(THREE, mesh) {
  const attrs = mesh.attributes || [];
  const pos = attrs.find((a) => a.name === "position");
  const idx = attrs.find((a) => a.name === "index");
  const nrm = attrs.find((a) => a.name === "normal");
  if (!pos) return null;
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(pos.data, 3));
  if (nrm) geom.setAttribute("normal", new THREE.BufferAttribute(nrm.data, 3));
  if (idx) geom.setIndex(new THREE.BufferAttribute(idx.data, 1));
  if (!nrm) geom.computeVertexNormals();
  return geom;
}
