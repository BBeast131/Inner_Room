import { Canvas } from "@react-three/fiber";
import {
    Circle,
    Loader,
    OrbitControls,
    PerspectiveCamera,
    SpotLight,
    SpotLightShadow,
    useTexture,
    Environment
} from '@react-three/drei';
import Lights from './Lights'
import { Suspense, useLayoutEffect } from 'react'
import { MathUtils, RepeatWrapping } from "three"

function Thing() {
    const texs = useTexture([
        "/grassy_cobble/grassy_cobblestone_diff_2k.jpg",
        "/grassy_cobble/grassy_cobblestone_nor_gl_2k.jpg",
        "/grassy_cobble/grassy_cobblestone_rough_2k.jpg",
        "/grassy_cobble/grassy_cobblestone_ao_2k.jpg"
    ]);

    useLayoutEffect(() => {
        for (const tex of texs) {
            tex.wrapS = tex.wrapT = RepeatWrapping;
            tex.repeat.set(2, 2);
        }
    }, [texs]);

    const [diffuse, normal, roughness, so] = texs

    const ceilTexture = useTexture('/shadow/image.jpg');

    return (
        <>
            <Circle receiveShadow args={[5, 64, 64]} rotation-x={-Math.PI / 2}>
                <meshStandardMaterial map={diffuse} normalMap={normal} roughnessMap={roughness} aoMap={so} envMapIntensity={0.2} />
            </Circle>
            <SpotLight distance={20} intensity={500} angle={MathUtils.degToRad(45)} color={"#fadcb9"} position={[5, 8, -2]} volumetric={false} debug>
                <SpotLightShadow scale={4} distance={0.8} width={2048} height={2048} map={ceilTexture}
                    shader={
                        /* glsl */ `
                        varying vec2 vUv;
                        uniform sampler2D uShadowMap;
                        uniform float uTime;
                        void main() {
                        // material.repeat.set(2.5) - Since repeat is a shader feature not texture
                        // we need to implement it manually
                        vec2 uv = mod(vUv, 0.4) * 2.5;

                        // Fake wind distortion
                        uv.x += sin(uv.y * 10.0 + uTime * 0.5) * 0.02;
                        uv.y += sin(uv.x * 10.0 + uTime * 0.5) * 0.02;
                        
                        vec3 color = texture2D(uShadowMap, uv).xyz;
                        gl_FragColor = vec4(color, 1.);
                        }
                        `
                    }
                />
            </SpotLight>
        </>
    )
}

export default function Shadow() {
    return (
        <div className="w-screen h-screen">
            <Canvas shadows>
                <Environment preset="park" background />
                <OrbitControls makeDefault autoRotate={true} autoRotateSpeed={0.5} minDistance={2} maxDistance={10} />
                <PerspectiveCamera
                    near={0.01} //
                    far={50}
                    position={[1, 3, 1]}
                    makeDefault
                    fov={60}
                />
                <Suspense>
                    <Thing />
                    <Lights />
                </Suspense>
            </Canvas>
            <Loader />
        </div>
    )
}