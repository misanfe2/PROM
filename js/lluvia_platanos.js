import * as THREE from 'three';
import { FBXLoader } from 'https://cdn.jsdelivr.net/npm/three@0.151.3/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.151.3/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.151.3/examples/jsm/loaders/GLTFLoader.js';


// Creamos la escena, la cámara y el renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Tipo de sombreado suave
document.body.appendChild(renderer.domElement);

// Creamos un raycaster para detectar clics en objetos 3D
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Variable global para detectar si se ha pulsado alguna palmera
let palmeraClicked = false;

// Añadimos un evento de clic al renderizador para detectar clics en objetos 3D
renderer.domElement.addEventListener('click', onClick);

function onClick(event) {
    // Calculamos las coordenadas del clic en relación con el tamaño del renderizador y las guardamos en la variable 'mouse'
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    // Actualizamos el rayo y encontramos los objetos intersectados
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    // Verificamos si alguna de las intersecciones es una palmera
    let palmeraIntersected = false;
    intersects.forEach(intersect => {
        if (intersect.object.isPalmera) {
            palmeraIntersected = true;
        }
    });

    // Si se ha intersectado alguna palmera, cambiamos el estado de palmeraClicked
    if (palmeraIntersected) {
        palmeraToggle();
    }
}

// Creamos un objeto de audio
const listener = new THREE.AudioListener();
camera.add(listener);

// Creamos un objeto de audio y lo asociamos al listener
const sound = new THREE.Audio(listener);

// Cargamos el archivo de audio
const audioLoader = new THREE.AudioLoader();
audioLoader.load('../3d/gradas/gradas.mp3', function(buffer) {
    sound.setBuffer( buffer );
	sound.setLoop(false);
	sound.setVolume(1);
});

// Creamos una luz direccional
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Color blanco, intensidad reducida
directionalLight.position.set(200, 500, 200); // Posición de la luz (x, y, z)
directionalLight.castShadow = true; // La luz proyecta sombras
scene.add(directionalLight);
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;

directionalLight.shadow.camera.left = -500;
directionalLight.shadow.camera.right = 500;
directionalLight.shadow.camera.top = 500;
directionalLight.shadow.camera.bottom = -500;
directionalLight.shadow.camera.near = 10;
directionalLight.shadow.camera.far = 1000;

// Creamos una luz ambiental con un tono amarillento suave
const ambientLight = new THREE.AmbientLight(0xffffcc, 0.2); // Color amarillo claro, intensidad reducida
scene.add(ambientLight);

// Creamos un plano 
const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
// Utilizamos un material transparente que recibe sombras
const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.3 }); // Ajusta la opacidad según sea necesario
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2; // Rotamos el plano para que esté en el eje xz
plane.position.y = 0;
plane.receiveShadow = true;
scene.add(plane);

//Create a helper for the shadow camera (optional)
const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(helper);
// Cargamos el cubemap
const cubeLoader = new THREE.CubeTextureLoader();
const cubeMap = cubeLoader.load([
    '../3d/skybox/mine_px.png',
    '../3d/skybox/mine_nx.png',
    '../3d/skybox/mine_py.png',
    '../3d/skybox/mine_ny.png',
    '../3d/skybox/mine_pz.png',
    '../3d/skybox/mine_nz.png'
]);
scene.background = cubeMap;

// Cargamos el modelo de la palmera
const objLoader = new OBJLoader();
const textureLoader = new THREE.TextureLoader();

objLoader.load(
    '../3d/palmera/TREP.obj',
    function (object) {
        const material = new THREE.MeshStandardMaterial({
            map: textureLoader.load('../3d/palmera/mt_tree_palm.png'),
            side: THREE.DoubleSide
        });
        // Configuramos la sombra para el modelo OBJ
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
            }
        });

        // Creamos palmeras en cada esquina
        const positions = [
            { x: -200, z: -200 },
            { x: 200, z: -200 },
            { x: -200, z: 200 },
            { x: 200, z: 200 }
        ];

        positions.forEach(pos => {
            const clonedObject = object.clone();
            clonedObject.scale.set(80, 80, 80);
            clonedObject.position.set(pos.x, 0, pos.z);
            clonedObject.castShadow = true;

            scene.add(clonedObject);

            clonedObject.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    child.material = material;
                    // Asignamos una propiedad 'isPalmera' al objeto para identificarlo como una palmera

                    child.isPalmera = true;
                }
            });
        });
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('Error loading model', error);
    }
);

// Cargamos el modelo FBX de la banana
const fbxLoader = new FBXLoader();

// Variable para almacenar las instancias de banana
const bananas = [];

function cargarBananas() {
    // Cargamos el modelo FBX de la banana cuando palmeraClicked sea TRUE
    if (palmeraClicked) {
        fbxLoader.load('../3d/banana/source/Banana.fbx', (fbx) => {
            // Cargamos las texturas y las aplicamos al modelo
            const baseTexture = textureLoader.load('../3d/banana/textures/Banana_BaseColor.png');
            const normalTexture = textureLoader.load('../3d/banana/textures/Banana_Normal.png');
            const roughnessTexture = textureLoader.load('../3d/banana/textures/Banana_Roughtness.png');

            fbx.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                }
            });

            fbx.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    // Creamos el material con las texturas cargadas
                    const material = new THREE.MeshStandardMaterial({
                        map: baseTexture,
                        normalMap: normalTexture,
                        roughnessMap: roughnessTexture
                    });
                    child.material = material;


                    // Asignamos una propiedad 'isBanana' al objeto para identificarlo como una banana
                    child.isBanana = true;

                }
            });

            // Creamos varias bananas
            for (let i = 0; i < 5; i++) {
                const clonedFbx = fbx.clone(); // Clonamos el modelo original
                const scale = 0.25;
                clonedFbx.scale.set(scale, scale, scale); // Aplicamos la escala al modelo clonado

                // Generamos coordenadas aleatorias 
                const randomX = Math.random() * 400 - 200;
                const randomZ = Math.random() * 400 - 200;
                clonedFbx.position.set(randomX, 200, randomZ);

                scene.add(clonedFbx); // Añadimos el modelo clonado a la escena

                // Agregamos la instancia de banana al array
                bananas.push(clonedFbx);
            }
        });
    } else {
        // Eliminamos todas las bananas de la escena cuando palmeraClicked sea FALSE
        bananas.forEach(banana => {
            scene.remove(banana);
        });
        bananas.length = 0; // Vaciamos el array de bananas
        robot.position.set(150, 0, 0);
        robot.rotation.y = -Math.PI / 2;

    }
}
const gltfGradasLoader = new GLTFLoader();

// Creamos el mixer
let mixerGradas = new THREE.AnimationMixer();

// Variable para almacenar las gradas
const gradas = [];
// Variable para almacenar los nombres de las animaciones de las gradas
let nombresAnimacionesGradas = [];

// Creamos un bucle for para generar las 4 gradas
for (let i = 0; i < 4; i++) {
    // Definimos las coordenadas para cada grada
    let x, y, z, rot;
    switch (i) {
        case 0:
            x = 250;
            z = 0;
            rot = 180;
            break;
        case 1:
            x = -250;
            z = 0;
            rot = 0;
            break;
        case 2:
            x = 0;
            z = 250;
            rot = 90;
            break;
        case 3:
            x = 0;
            z = -250;
            rot = -90;
            break;
    }
    y = 0;
    // Convertimos el ángulo de rotación de grados a radianes
    const rotRadianes = rot * (Math.PI / 180);
    // Cargamos el modelo GLB de las gradas
    gltfGradasLoader.load(
        '../3d/gradas/espectadores.glb',
        function (gltf) {
            const grada = gltf.scene;
            // Escalado y posicionado de las gradas
            grada.scale.set(12, 12, 12); // Ajusta el escalado según sea necesario
            grada.position.set(x, y, z); // Posiciona las gradas en la escena
            grada.rotation.y = rotRadianes;

            // Añadimos la grada a la escena
            scene.add(grada);

            // Agregamos la instancia de grada al array
            gradas.push(grada);

            // Configuramos las propiedades de las gradas
            grada.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    // Aplicar multiplyScalar(4.5) al material de cada mesh
                    if (child.material) {
                        child.material.color.multiplyScalar(2);
                    }
                }
            });

            // Buscamos las animaciones para reproducirlas
            const clipsGradas = gltf.animations;
            clipsGradas.forEach(clip => {
                const action = mixerGradas.clipAction(clip, grada);
                action.play();
                // Almacenar el nombre de la animación en el array
                nombresAnimacionesGradas.push(clip.name);
            });
            // Imprimir los nombres de las animaciones de las gradas en la consola
            console.log("Nombres de las animaciones de las gradas:");
            nombresAnimacionesGradas.forEach(nombre => {
                console.log(nombre);
            });
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('Error loading model', error);
        }
    );
}

// Cargamos el modelo GLB del robot
const gltfLoader = new GLTFLoader();

// Creamos el mixer
let mixer;
//Pausar o no las animaciones
let reproducir = false;

let duration = 0;
let robot;

// En la función de carga del modelo GLB del robot
gltfLoader.load(
    '../3d/robot/robot.glb',
    function (gltf) {
        robot = gltf.scene;
        // Escalado y posicionado
        robot.scale.set(50, 50, 50);
        robot.position.set(150, 0, 0);
        // Aplicamos la rotación sobre el eje Y
        robot.rotation.y = -Math.PI / 2; // Rotación de 90 grados en radianes
        // Configuramos la sombra para el modelo del robot
        robot.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
            }
        });

        scene.add(robot);

        // Buscamos las animaciones para reproducirlas
        mixer = new THREE.AnimationMixer(robot);

        const clips = gltf.animations;
        const barrelClip = THREE.AnimationClip.findByName(clips, 'BarrelAction.001');
        const armatureClip = THREE.AnimationClip.findByName(clips, 'ArmatureAction');

        const barrelAction = mixer.clipAction(barrelClip);
        const armatureAction = mixer.clipAction(armatureClip);

        barrelAction.play();
        armatureAction.play();

        // Obtener la duración total de la animación
        duration = Math.max(barrelClip.duration, armatureClip.duration);

        const fps = 30; // Tasa de fotogramas por segundo
        const totalFrames = duration * fps;

        // Modificar las propiedades del material del robot para que sea más brillante
        robot.traverse(function (child) {
            if (child.isMesh) {
                const material = child.material;
                if (material) {
                    material.color.multiplyScalar(4.5);// Puedes ajustar este valor según tus necesidades
                }
            }
        });
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('Error loading model', error);
    }
);

const gltfFlorLoader = new GLTFLoader();

// Array para almacenar las instancias de las flores
const flores = [];

// Función para cargar y generar flores
function cargarFlores() {
    // Nombres de los archivos GLB de las flores
    const nombresFlores = ["flor_azul.glb", "flor_rosa.glb", "flor_naranja.glb"];

    // Iterar sobre cada tipo de flor
    nombresFlores.forEach(nombreFlor => {
        // Cargar la flor 5 veces
        for (let i = 0; i < 10; i++) {
            gltfFlorLoader.load(
                `../3d/flores/${nombreFlor}`,
                function (gltf) {
                    // Clonar la flor original para crear múltiples instancias
                    const flor = gltf.scene.clone();
                    flor.scale.set(10, 10, 10);

                    // Generar coordenadas aleatorias dentro del área especificada
                    const randomX = Math.random() * 800 - 400;
                    const randomZ = Math.random() * 800 - 400;
                    flor.position.set(randomX, 0, randomZ);


                    const randoRotY = Math.random() * 360;
                    flor.rotation.y = randoRotY;

                    flor.traverse(function (child) {
                        if (child.isMesh) {
                            child.castShadow = true;
                            // Aplicar multiplyScalar(4.5) al material de cada mesh
                            if (child.material) {
                                child.material.color.multiplyScalar(3);
                            }
                        }
                    });

                    // Añadir la flor a la escena
                    scene.add(flor);

                    // Agregar la instancia de la flor al array
                    flores.push(flor);
                },
                function (xhr) {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },
                function (error) {
                    console.error('Error loading model', error);
                }
            );
        }
    });
}
// Llamamos a la función cargarFlores para generar las flores en la escena
cargarFlores();

// Llamamos a la función cargarBananas() al cambiar el estado de palmeraClicked
function palmeraToggle() {
    palmeraClicked = !palmeraClicked;
    //console.log('Estado de palmeraClicked:', palmeraClicked);
    cargarBananas();
}

// Definimos el radio y el ángulo inicial de la órbita de la cámara
let orbitRadius = 300;
let angle = 0;

// Función para actualizar la posición de la cámara en la órbita
function updateCameraPosition() {
    // Calculamos la posición de la cámara en la órbita
    const x = orbitRadius * Math.cos(angle);
    const z = orbitRadius * Math.sin(angle);

    // Actualizamos la posición de la cámara manteniendo su altura
    camera.position.set(x, 225, z);

    // Apuntamos la cámara hacia el centro de la escena
    camera.lookAt(scene.position);
}

// Variable para rastrear si alguna flecha está siendo pulsada
let arrowKeyPressed = false;
let tiempoDeAnimacionAlPausar = 0;

// Objeto para almacenar el estado de las teclas
const keys = {};

// Función para manejar la pulsación de teclas
function handleKeyDown(event) {
    keys[event.key] = true;
    handleKeyPress(event);
}

// Verificar el estado de las teclas relevantes en la función handleKeyPress
function handleKeyPress(event) {
    const rotationSpeed = 0.05; // Velocidad de rotación
    reproducir = false;

    // Giro en sentido antihorario
    if (keys['a']) {
        angle += rotationSpeed;
    }

    // Giro en sentido horario
    if (keys['d']) {
        angle -= rotationSpeed;
    }

    // Reproducción de animaciones del robot
    if (keys['ArrowUp']) {
        const deltaZ = 3 * Math.cos(robot.rotation.y);
        const deltaX = 3 * Math.sin(robot.rotation.y);
        robot.position.x += deltaX;
        robot.position.z += deltaZ;

    }

    if (keys['ArrowDown']) {
        const deltaZ = 3 * Math.cos(robot.rotation.y);
        const deltaX = 3 * Math.sin(robot.rotation.y);
        robot.position.x -= deltaX;
        robot.position.z -= deltaZ;
    }
    // Reproducción de animaciones del robot
    if (keys['ArrowLeft']) {
        robot.rotation.y += 0.1;

    }

    if (keys['ArrowRight']) {
        robot.rotation.y -= 0.1;
    }

    // Reproducción de animaciones del robot solo si alguna tecla de movimiento del robot está siendo pulsada
    if (keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight']) {
        reproducir = true;
    }
    // Imprimir el valor de 'reproducir' por consola
    //console.log('Valor de reproducir:', reproducir);

    // Actualizamos la posición de la cámara en función del nuevo ángulo
    updateCameraPosition();
}

function handleKeyUp(event) {
    keys[event.key] = false;
    handleKeyPress(event);
    // Si se suelta una tecla de flecha, marcamos que ninguna flecha está siendo pulsada
    if (event.key === 'ArrowUp' && event.key === 'ArrowDown' && event.key === 'ArrowRight' && event.key === 'ArrowLeft') {
        reproducir = false;
        tiempoDeAnimacionAlPausar = mixer.time;
        //console.log('TiempoPausado:', tiempoDeAnimacionAlPausar);

    }
    // Imprimir el valor de 'reproducir' por consola
    //console.log('Valor de reproducir:', reproducir);
}

document.addEventListener('keyup', handleKeyUp);
document.addEventListener('keydown', handleKeyDown);


//Establecemos los relojes
let duracionDeseada = 0;
const clock = new THREE.Clock();
const clockGradas = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    // Actualizamos el mixer del robot solo si está definido (el modelo ha sido cargado)
    if (mixer) {
        /// Actualizamos la reproducción de las animaciones del robot según el valor de 'reproducir'
        if (reproducir) {
            mixer.timeScale = 1; // Establecer el tiempo de reproducción a 1 para reproducir las animaciones
        } else {
            // Dividimos el tiempo de pausa por la duración total de la animación
            const tiempoTranscurrido = mixer.time - tiempoDeAnimacionAlPausar;
            //Obtenemos el resto
            const tiempoPausado = tiempoTranscurrido % duration;
            let nuevoTiempo = 0;
            //console.log('Resto:', tiempoPausado);
            if (tiempoPausado <= 0.2 || (tiempoPausado > 0.25 && tiempoPausado <= 0.55) || tiempoPausado > 0.6) {

                nuevoTiempo = tiempoPausado;
                mixer.timeScale = 1;
            } else {
                // Cuando el tiempo pausado esté dentro del rango deseado, pausamos la animación
                tiempoDeAnimacionAlPausar = nuevoTiempo;
                mixer.timeScale = 0;
            }
        }
        // Actualizamos el mixer en cada cuadro de animación
        mixer.update(clock.getDelta());
    }

    // En la función animate(), actualiza la reproducción de las animaciones de las gradas
    if (mixerGradas) {
        mixerGradas.update(clockGradas.getDelta());
        // Verifica si alguna de las animaciones de las gradas ha terminado
        if (mixerGradas.time >= duracionDeseada) {
            // Detiene la reproducción de las animaciones para que duren solamente 3.6 segundos
            mixerGradas.timeScale = 0;
        } else {
            mixerGradas.timeScale = 1;
        }
    }
    bananas.forEach(banana => {
        // Asignamos una velocidad aleatoria a cada banana
        if (!banana.velocityY) {
            banana.velocityY = -Math.random() * 0.5 - 0.2;
        }

        // Actualizamos la posición en el eje y
        banana.position.y += banana.velocityY;

        // En la sección donde verificas si el robot atrapa un plátano
        if (
            banana.position.x >= robot.position.x - 50 && banana.position.x <= robot.position.x + 50 &&
            banana.position.y >= robot.position.y - 10 && banana.position.y <= robot.position.y + 50 &&
            banana.position.z >= robot.position.z - 50 && banana.position.z <= robot.position.z + 50
        ) {
            // Eliminamos la banana de la escena y del array bananas
            scene.remove(banana);
            bananas.splice(bananas.indexOf(banana), 1);

            //Ejecutamos la animación de celebración de las gradas
            mixerGradas.setTime(0);
            duracionDeseada = 3.4;
            sound.stop();
            sound.play();
            // Verificar si el array de bananas está vacío
            if (bananas.length === 0) {
                // Establecer palmeraClicked en false
                robot.position.set(150, 0, 0);
                robot.rotation.y = -Math.PI / 2;
                palmeraClicked = false;
                platanosEliminados = 0;
                gradasTerminadas = 1;
            }
        }
        // Si la banana llega al suelo, la reseteamos
        if (banana.position.y <= 6) {
            banana.position.y = 200; // Lo reposicionamos arriba del plano
            banana.position.z = Math.random() * 400 - 200;
            banana.position.x = Math.random() * 400 - 200;
        }
        // Dotamos de un sueva giro sobre el eje y
        banana.rotation.y += 0.02;
    });
    renderer.render(scene, camera);
    //console.log("Posición del robot - X:", robot.position.x, "Y:", robot.position.y, "Z:", robot.position.z);
}

// Movemos la cámara a una posición inicial en la órbita
updateCameraPosition();

// Comenzamos la animación
animate();