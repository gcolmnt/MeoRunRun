import React from 'react'
import { useGLTF } from '@react-three/drei'



export default function Model() {
    
    const { nodes, materials } = useGLTF('./Cat.glb')  

    return (
        <group name="Root_Scene">
          <group name="RootNode">
            <group name="CharacterArmature" rotation={[-Math.PI / 2, 0, 0]} scale={0.5} position={[0, -0.65, 0.3]}>
              <primitive object={nodes.Root} />
            </group>
            <group name="Cat">
              <skinnedMesh
                name="Cat"
                geometry={nodes.Cat.geometry}
                material={materials.CatSkin}
                skeleton={nodes.Cat.skeleton}
                castShadow
              />
              <skinnedMesh
                name="Sweat"
                geometry={nodes.Sweat.geometry}
                material={materials.Sweat}
                skeleton={nodes.Sweat.skeleton}
                castShadow
              />
            </group>
          </group>
        </group>
      )
    }

        useGLTF.preload('./Cat.glb')
