import Model from './Model.jsx'
import Ecctrl, { EcctrlAnimation, EcctrlJoystick } from "ecctrl"
import { Suspense, useRef, useEffect, useState } from 'react'
import useGame from './stores/useGame.jsx'
import { useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { useJoystickControls  } from "ecctrl";


export default function Player()
{
    const playerRef = useRef()
    const light = useRef()
    const boulderRef = useRef()

    const characterURL = './Cat.glb';
    
    const animationSet = {
      idle: "Idle",
      walk: "Walk",
      run: "Run",
      jump: "Jump",
      jumpIdle: "Jump_Idle",
      action1: "Hello"
    };

    const [ subscribeKeys, getKeys ] = useKeyboardControls()
    const getJoystickValues = useJoystickControls(state => state.getJoystickValues)

    const [ startMusic ] = useState(() => new Audio('./384-Steppin-Up.mp3'))

    const start = useGame((state) => state.start)
    const end = useGame((state) => state.end)
    const restart = useGame((state) => state.restart)
    const blocksCount = useGame((state) => state.blocksCount)


    const reset = () =>
    {
        playerRef.current.setTranslation({ x: 0, y: 0.5, z: 0.5 })
        playerRef.current.setLinvel({ x: 0, y: 0, z: 0 })
        playerRef.current.setAngvel({ x: 0, y: 0, z: 0 })
        boulderRef.current.position.set(0, 1.5, -5)
        startMusic.pause()
        setFirstInput(false)
    }


    const [ jumpSound ] = useState(() => new Audio('./jump_02.wav'))
    const [ jumpSoundPlayed, setJumpSoundPlayed] = useState(false);
    const [ firstInput, setFirstInput] = useState(false);

    const hasPressedKey = () => {
        if (!firstInput) {
            setFirstInput(true)  
            setTimeout(() => {
                startMusic.currentTime = 0
                startMusic.loop = true
                startMusic.volume = 0.25
                startMusic.play()
            }, 500);
            
        }
      }
    
    const startGame = () => {
        start()
        hasPressedKey()
    }

    useEffect(() => {
    
        const unsubscribeReset = useGame.subscribe(
            (state) => state.phase,
            (value) => {
                if (value === 'ready') reset();
            }
        )
    
        // Attach event listener for keydown event
        const handleKeyDown = (event) => {
            if ((subscribeKeys) && !firstInput) {
            startGame();
            setFirstInput(true);
          }
        };

        // Attach event listener for pointerdown event
        const pointerDown = () => {
            if (!firstInput) {
                startGame();
                setFirstInput(true);
            }
        };
        
        const unsubscribeAny = subscribeKeys(startGame);
        window.addEventListener('pointerdown', pointerDown);
    
        return () => {
          unsubscribeReset();
          unsubscribeAny();
          window.removeEventListener('pointerdown', pointerDown);
        };
      }, [firstInput]);

    useFrame((state, delta) =>
    {
        const characterPosition = playerRef.current.translation();
        
        // Light
        light.current.position.z = characterPosition.z + 1 - 7
        light.current.target.position.z = characterPosition.z - 7
        light.current.target.updateMatrixWorld()
        
        // Boulder
        if((characterPosition.z > 2) && (characterPosition.z < (blocksCount * 4 + 2))){
            boulderRef.current.position.z += 4 * delta
            boulderRef.current.rotation.x += 5 * delta
        }

        // Winning condition
        if (characterPosition.z > (blocksCount * 4 + 2)){
            boulderRef.current.position.z = boulderRef.current.position.z
            boulderRef.current.rotation.x = boulderRef.current.rotation.x
            startMusic.pause()
            end()
        }

        // Respawn condition
        if(characterPosition.y < - 1.5){
            restart()
        } else if (boulderRef.current.position.z > characterPosition.z -0.75)
        { restart() }

        // Jump
        const { jump } = getKeys();
        if (jump || getJoystickValues().button1Pressed === true) {
            if (!jumpSoundPlayed) {
                setJumpSoundPlayed(true); 
                jumpSound.currentTime = 0
                jumpSound.volume = 0.5
                jumpSound.play()
                setTimeout(() => {
                    setJumpSoundPlayed(false);
                }, 900);
            }
        }

    })


return<>
    <directionalLight
            ref ={ light }
            castShadow
            position={ [ 4, 4, 1 ] }
            intensity={ 1.5 }
            shadow-mapSize={ [ 1024, 1024 ] }
            shadow-camera-near={ 1 }
            shadow-camera-far={ 10 }
            shadow-camera-top={ 10 }
            shadow-camera-right={ 10 }
            shadow-camera-bottom={ - 10 }
            shadow-camera-left={ - 10 }
    />
    <ambientLight intensity={ 0.5 } />

    <Suspense fallback={ null }>
        <Ecctrl
        ref={playerRef}
        floatingDis={0.33}
        camInitDis= {-5}
        sprintMult= {2}
        jumpVel= {2.5}
        capsuleHalfHeight= {0.35}
        capsuleRadius= {0.3}
        position={[ 0, 1, 0.5 ]}
        camCollision= {false}
        camInitDir = {{ x: - Math.PI / 9, y:  Math.PI, z: 0 }}
        animated={ true }
        >
            <EcctrlAnimation
            characterURL={characterURL} // Must have property
            animationSet={animationSet} // Must have property
            >
                <Model />
            </EcctrlAnimation>
        </Ecctrl>

        {/* Boulder */}
        <mesh
            ref={boulderRef}
            castShadow
            position={ [ 0, 1.5, -5] }
        >
            <icosahedronGeometry args={ [1.7 , 1] }/>
            <meshStandardMaterial flatShading/>
        </mesh>

    </Suspense>
</>
}