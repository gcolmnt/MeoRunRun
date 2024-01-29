import { Physics } from '@react-three/rapier'
import * as THREE from 'three'
import Ecctrl, { EcctrlAnimation, EcctrlJoystick } from "ecctrl"
import { Canvas } from '@react-three/fiber'
import { KeyboardControls } from '@react-three/drei'
import Interface from './Interface.jsx'
import Player from './Player.jsx'
import { Level } from './Level.jsx'
import useGame from './stores/useGame.jsx'


export default function App()
{
    const keyboardMap = [
        { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
        { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
        { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
        { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
        { name: 'jump', keys: ['Space'] },
        { name: 'run', keys: ['Shift'] }
      ]
    
      const joystickMaterial = new THREE.MeshBasicMaterial({ color: "red" })

      const blocksCount = useGame((state) => state.blocksCount)
      const blocksSeed = useGame((state) => state.blocksSeed)
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

      return <>
        {isMobile && (
          <EcctrlJoystick 
            joystickBaseProps={{ material: joystickMaterial }}
            joystickStickProps={{ material: new THREE.MeshBasicMaterial({ color: "white" }) }}
            joystickHandleProps={{ material: new THREE.MeshBasicMaterial({ color: "darkred" }) }}
            buttonLargeBaseProps={{ material: new THREE.MeshBasicMaterial({ color: "darkred" }) }}
            buttonTop1Props={{ material: joystickMaterial }}
            buttonNumber={1}
          />
        )}
        <KeyboardControls 
          map={ keyboardMap }
        >
          <Canvas shadows >
            <Physics debug={ false }>
            {/* <Perf position="top-left" /> */}
            <Player />
            <Level count={ blocksCount } seed={ blocksSeed } />
            </Physics>
          </Canvas>
          <Interface />
        </KeyboardControls>
     </>
}