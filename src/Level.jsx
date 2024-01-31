import * as THREE from 'three'
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { useMemo, useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text, useGLTF } from '@react-three/drei'

const boxGeometry = new THREE.BoxGeometry(1, 1, 1)

const floor1Material = new THREE.MeshStandardMaterial({ color: 'limegreen'})
const floor2Material = new THREE.MeshStandardMaterial({ color: 'greenyellow'})
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 'orangered'})
const wallMaterial = new THREE.MeshStandardMaterial({ color: 'slategrey'})

export function BlockStart({ position = [ 0, 0, 0 ] })
{
    return <group position={ position } >
        <Float floatIntensity={ 0.25 } rotationIntensity={ 0.25 }>
            <Text 
                font="./AmberyGardenRegular.ttf"
                scale={ 0.5 }
                maxWidth={ 0.25 }
                lineHeight={ 0.85 }
                textAlign="left"
                position={ [ - 1.25, 0.65, +1 ] }
                rotation-y={ Math.PI * 2 + 0.35}
            >
            Meo RunRun
            <meshBasicMaterial toneMapped={false} />
            </Text>
        </Float>
        <RigidBody type="fixed">
            <mesh 
                geometry={ boxGeometry }
                material={ floor1Material }
                position={ [ 0, -0.1, -4 ] }
                scale={ [ 4, 0.2, 12 ] }
                receiveShadow
            />
        </RigidBody>
    </group>
}

export function BlockEnd({ position = [ 0, 0, 0 ] })
{
    const tunaBox = useGLTF('./Tuna.glb')
    const TunaBox = useRef()
    tunaBox.scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
        }
    })

    const [ tunaMusic ] = useState(() => new Audio('./sboe.wav')) 
    const [winMusicOn, setWinMusicOn] = useState(false); 
    const collisionTunaEnter = () =>
    {
        setWinMusicOn((prevValue) => !prevValue)
    }

    if (winMusicOn) {    
        tunaMusic.currentTime = 0
        tunaMusic.volume = 0.3
        tunaMusic.play()
    } 
    
    else {
         if (!winMusicOn) {
            tunaMusic.pause()
        }
    }

    tunaBox.scene.children.forEach((mesh) => 
    {
        mesh.castShadow = true
    })

    useFrame(({ clock }) => {

        if (winMusicOn ){
            TunaBox.current.rotation.y += 0.025
            TunaBox.current.position.y = Math.cos(clock.elapsedTime * 2) * 0.05
            setTimeout(() => {
                setWinMusicOn(false);
            }, 4500);
        }

    });

    return <group position={ position } >
        <Text
            font="./AmberyGardenRegular.ttf"
            scale={ 1 }
            position={ [ 0, 1.25, - 2 ] }
        >
            FINISH
            <meshBasicMaterial toneMapped={ false } />
        </Text>
        <RigidBody type="fixed">
            <mesh 
                geometry={ boxGeometry }
                material={ floor1Material }
                position={ [ 0, 0, 3 ] }
                scale={ [ 4, 0.2, 10 ] }
                receiveShadow
            />
        </RigidBody>

        <RigidBody 
            type="kinematicPosition"
            colliders="hull"
            position={ [0, 2, 0] }
            restitution={ 0.2 }
            friction={ 0 }
            onCollisionEnter={ collisionTunaEnter }
         >
        <primitive castShadow  ref={ TunaBox } object={tunaBox.scene} scale={ 1.5 } position={ [ 0, -0.1, 0.5] } rotation={ [ 0, - Math.PI * 0.5, 0] } />
        </RigidBody>
    </group>
}

function Bounds({ length = 1 })
{   
    return<>
        <RigidBody type="fixed" restitution={ 0.2 } friction={ 0 }>

            <mesh
                position={ [ 2.15, 0.75, (length * 2) -3 ]}
                geometry={ boxGeometry }
                material={ wallMaterial }
                scale={ [ 0.3, 1.5, 4 * length + 14 ] }
                castShadow
            />

            <mesh
                position={ [ - 2.15, 0.75, (length * 2) - 3 ]}
                geometry={ boxGeometry }
                material={ wallMaterial }
                scale={ [ 0.3, 1.5, 4 * length + 14 ] }
                receiveShadow
            />
        </RigidBody>
        <CuboidCollider position={ [ 0, 0.75, (length * 4) - 2 ]} args={ [ 4, 1.5, 0.3 ] } />
    </>
}

export function BlockPit({ position = [ 0, 0, 0 ] })
{
    return <group position={ position } >
        <RigidBody type="fixed">
            <mesh 
                geometry={ boxGeometry }
                material={ floor2Material }
                position={ [ 0, -0.1, -1.5 ] }
                scale={ [ 4, 0.2, 1 ] }
                receiveShadow
            />
        </RigidBody>
        <RigidBody type="fixed">
            <mesh 
                geometry={ boxGeometry }
                material={ floor2Material }
                position={ [ 0, -0.1, 1.5 ] }
                scale={ [ 4, 0.2, 1 ] }
                receiveShadow
            />
        </RigidBody>
    </group>
}

export function BlockMovingBridge({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()
    const [ timeOffset ] = useState(() => (Math.random() * Math.PI * 2 ))

    useFrame((state) =>
    {
        const time = state.clock.getElapsedTime()
        const x = Math.sin(time + timeOffset) * 1
        obstacle.current.setNextKinematicTranslation({ x:position[0] + x, y:position[1] -0.1, z: position[2] })
    })

    return <group position={ position } >
        {/* Obstacle */}
        <RigidBody 
            ref={ obstacle }
            type="kinematicPosition"
            restitution={ 0.2 }
            friction={ 0 }
        >
        <mesh 
            geometry={ boxGeometry }
            material={ obstacleMaterial }
            scale={ [ 2, 0.2, 4 ] }
            castShadow
            receiveShadow
            />
        </RigidBody>

    </group>
}

export function BlockAxe({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()
    const [ timeOffset ] = useState(() => (Math.random() * Math.PI * 2 ))

    useFrame((state) =>
    {
        const time = state.clock.getElapsedTime()
        const x = Math.sin(time + timeOffset) * 1.25
        obstacle.current.setNextKinematicTranslation({ x:position[0] + x, y:position[1] + 0.75, z: position[2] })
    })

    return <group position={ position } >
        <RigidBody type="fixed">
            <mesh 
                geometry={ boxGeometry }
                material={ floor2Material }
                position={ [ 0, -0.1, 0 ] }
                scale={ [ 4, 0.2, 4 ] }
                receiveShadow
            />
        </RigidBody>

        {/* Obstacle */}

        <RigidBody 
            ref={ obstacle }
            type="kinematicPosition"
            position={ [ 0, 0.3, 0 ] }
            restitution={ 0.2 }
            friction={ 0 }
        >
        <mesh 
            geometry={ boxGeometry }
            material={ obstacleMaterial }
            scale={ [ 1.5, 1.5, 0.3 ] }
            castShadow
            receiveShadow
            />
        </RigidBody>

    </group>
}

export function BlockAxe2({ position = [ 0, 0, 0 ] })
{
    const obstacle = useRef()
    const obstacle2 = useRef()
    const [ timeOffset ] = useState(() => (Math.random() * Math.PI * 2 ))
    const [ timeOffset2 ] = useState(() => (Math.random() * Math.PI * 2 ))

    useFrame((state) =>
    {
        const time = state.clock.getElapsedTime()
        const x = Math.sin(time + timeOffset) * 1.35
        const x2 = Math.sin(time + timeOffset2) * 1.35
        obstacle.current.setNextKinematicTranslation({ x:position[0] + x, y:position[1] + 0.75, z: position[2] -1 })
        obstacle2.current.setNextKinematicTranslation({ x:position[0] + x2, y:position[1] + 0.75, z: position[2] + 1 })

    })

    return <group position={ position } >
        <RigidBody type="fixed">
            <mesh 
                geometry={ boxGeometry }
                material={ floor2Material }
                position={ [ 0, -0.1, 0 ] }
                scale={ [ 4, 0.2, 4 ] }
                receiveShadow
            />
        </RigidBody>

        {/* Obstacle */}

        <RigidBody 
            ref={ obstacle }
            type="kinematicPosition"
            position={ [ 0, 0.3, 0 ] }
            restitution={ 0.2 }
            friction={ 0 }
        >
        <mesh 
            geometry={ boxGeometry }
            material={ obstacleMaterial }
            scale={ [ 1.25, 1.5, 0.3 ] }
            castShadow
            receiveShadow
            />
        </RigidBody>

        <RigidBody 
            ref={ obstacle2 }
            type="kinematicPosition"
            position={ [ 0, 0.3, 0 ] }
            restitution={ 0.2 }
            friction={ 0 }
        >
        <mesh 
            geometry={ boxGeometry }
            material={ obstacleMaterial }
            scale={ [ 1.25, 1.5, 0.3 ] }
            castShadow
            receiveShadow
            />
        </RigidBody>

    </group>
}

export function Level({ count = 5, types = [ BlockPit, BlockMovingBridge, BlockAxe, BlockAxe2 ], seed = 0 })
{
    const blocks = useMemo(() => 
    {
        const blocks = []

        for(let i = 0; i < count; i++)
        {
            const type = types[ Math.floor(Math.random() * types.length) ]
            blocks.push(type)
        }

        return blocks
    }, [ count, types, seed ])

    return <>

        <BlockStart position={ [ 0, 0, 0] } />
        { blocks.map((Block, index) => <Block key={ index } position={ [ 0, 0, (index + 1) * 4] } />) }
        <BlockEnd position={ [ 0, 0, (count + 1) * 4 ] } />
        <Bounds length={ count + 2 } />
    </>
}