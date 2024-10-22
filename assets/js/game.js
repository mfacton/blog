/////////////////////// Initialize /////////////////////////////
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
camera.position.y = 2;
camera.quaternion.x = -0.1;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/////////////////////// Lighting ///////////////////////////////
scene.background = new THREE.Color(0xeeeeee);

const ambientLight = new THREE.AmbientLight(0x808080);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xa0a0a0, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

////////////////////////// Init Scene //////////////////////////////
function createCircuitGrid(size, step, height) {
    const gridGroup = new THREE.Group();

    for (let x = -size; x <= size; x += step) {
        const geometry = new THREE.BoxGeometry(size*2, height, 0.1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x999999,
        });

        const horizontalPrism = new THREE.Mesh(geometry, material);
        horizontalPrism.position.set(0, height / 2, x);
        gridGroup.add(horizontalPrism);
    }

    for (let z = -size; z <= size; z += step) {
        const geometry = new THREE.BoxGeometry(0.1, height, size*2);
        const material = new THREE.MeshStandardMaterial({
            color: 0x999999,
        });

        const verticalPrism = new THREE.Mesh(geometry, material);
        verticalPrism.position.set(z, height / 2, 0);
        gridGroup.add(verticalPrism);
    }

    return gridGroup;
}

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.y = 1;
scene.add(cube);

const circuitGrid = createCircuitGrid(50, 5, 0.5);
scene.add(circuitGrid);

//////////////////////// Variables /////////////////////////////////
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let moveUp = false, moveDown = false;
const moveSpeed = 0.1;

let yaw = 0;
let pitch = 0;
const sensitivity = 0.002;

///////////////////////// Main Loop /////////////////////////////////
function loop() {
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    camera.getWorldDirection(forward); 
    forward.y = 0; 
    forward.normalize(); 

    right.crossVectors(camera.up, forward); 
    right.normalize();

    if (moveForward) camera.position.add(forward.clone().multiplyScalar(moveSpeed)); 
    if (moveBackward) camera.position.add(forward.clone().multiplyScalar(-moveSpeed)); 
    if (moveLeft) camera.position.add(right.clone().multiplyScalar(moveSpeed)); 
    if (moveRight) camera.position.add(right.clone().multiplyScalar(-moveSpeed)); 
    if (moveUp) camera.position.y += moveSpeed; 
    if (moveDown) camera.position.y -= moveSpeed;

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
}

//////////////////////////// Animate //////////////////////////////
function animate() {
    requestAnimationFrame(animate);

    loop();

    renderer.render(scene, camera);
}
animate();

/////////////////////////// Listeners ///////////////////////////////
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock;
document.addEventListener('click', () => {
    document.body.requestPointerLock();
});

function updateCameraRotation() {
    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
    camera.quaternion.copy(quaternion);
}
document.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement === document.body) {
        yaw -= event.movementX * sensitivity;
        pitch -= event.movementY * sensitivity;
        pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch)); // Limit pitch to avoid flipping
        updateCameraRotation();
    }
});

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
        case 'Space': moveUp = true; break;
        case 'ShiftLeft': moveDown = true; break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
        case 'Space': moveUp = false; break;
        case 'ShiftLeft': moveDown = false; break;
    }
});
