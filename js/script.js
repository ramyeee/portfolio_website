import * as THREE from '../three/build/three.module.js';
import { OrbitControls } from '../three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from '../three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from '../three/examples/jsm/loaders/MTLLoader.js';
import { GLTFLoader } from '../three/examples/jsm/loaders/GLTFLoader.js'; 

function main() {
    const canvas = document.querySelector("#c"); 
    const renderer = new THREE.WebGLRenderer({ canvas });
    const scene = new THREE.Scene();
    //scene.background = new THREE.Color('black');
    const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 1000);
    
    const skyloader = new THREE.CubeTextureLoader(); 
    const texture = skyloader.load(['../assets/skytexture.jpg',
                                    '../assets/skytexture.jpg',
                                    '../assets/skytexture.jpg',
                                    '../assets/skytexture.jpg',
                                    '../assets/skytexture.jpg',
                                    '../assets/skytexture.jpg'
                                ]);
    scene.background = texture;

    {
        const color = 0xFFFFFF;
        const intensity = 2; 
        const light = new THREE.DirectionalLight(color, intensity); 
        light.position.set(0, 10, 10);
        light.target.position.set(-5, 0, 0);
        scene.add(light);
        scene.add(light.target);
    }

    camera.position.set(-10,10,70); 
    camera.lookAt(0,0,0);

    const rayCast= new THREE.Raycaster(); 
    const mouse = new THREE.Vector2(); 
    mouse.x = mouse.y = -1;

    const controls = new OrbitControls(camera,canvas);
    controls.target.set(0,5,0);
    controls.update();

    //addFloor();
    const title = []; 
    const objects = [];
    const doors = [];

    {
        const gltfLoader = new GLTFLoader(); 
        const url = '../assets/things_gltf.glb';
        gltfLoader.load(url, (gltf)=> {
            const root = gltf.scene;
            root.rotation.z = -10* Math.PI/180;
            root.scale.set(6,7,2);
            root.position.x = -35;
            title.push(root);
            scene.add(root);
        });

        const Namegltf = new GLTFLoader(); 
        const nameurl = '../assets/name.glb';
        Namegltf.load(nameurl, (gltf)=> {
            const name = gltf.scene;
            name.rotation.z = -10* Math.PI/180;
            name.scale.set(3,4,1.5);
            name.position.x = -50;
            name.position.y = -10;
            objects.push(name);
            scene.add(name);
        });

        const doorGltf = new GLTFLoader();
        const doorurl = '../assets/door.glb';
        doorGltf.load(doorurl, (gltf) => {
            const door = gltf.scene;
            door.scale.set(15,16,3);
            door.position.x = -15;
            door.position.y = -20;
            door.position.z = -20;
            doors.push(door); 
            scene.add(door);
        })
    }

    renderer.render(scene, camera);

    function addFloor(){
        const planeSize = 40;
        const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
        const planeMat = new THREE.MeshPhongMaterial({color: 0xED8AE5, side:THREE.DoubleSide});
        const mesh = new THREE.Mesh(planeGeo, planeMat); 
        mesh.rotation.x = Math.PI * -.5; 
        scene.add(mesh);
    }

    function titleDrop(time) {
        time *=0.01;

        if (Start < 150){
            title.forEach((t) => {
                t.position.y = 15-time;
            })
        }

        if (50 < Start && Start < 200) {
            objects.forEach((n) => {
                n.position.x = 180-(time*4);
            })
        }

        Start ++;
        renderer.render(scene, camera);
        requestAnimationFrame(titleDrop);
    }

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width  = canvas.clientWidth  * pixelRatio | 0;
        const height = canvas.clientHeight * pixelRatio | 0;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
          renderer.setSize(width, height, false);
        }
        return needResize;
    }

    class PickHelper {
        constructor() {
          this.raycaster = new THREE.Raycaster();
          this.pickedObject = null;
          this.pickedObjectSavedColor = 0;
        }
        pick(normalizedPosition, scene, camera, time) {
            time *= 0.001;
          // restore the color if there is a picked object
          if (this.pickedObject) {
            this.pickedObject.material.emissive = this.pickedObjectSavedColor;
            this.pickedObject = undefined;
          }
    
          // cast a ray through the frustum
          this.raycaster.setFromCamera(normalizedPosition, camera);
          // get the list of objects the ray intersected
          const intersectedObjects = this.raycaster.intersectObjects(scene.children);
          
            if(intersectedObjects.length) {
            // pick the first object. It's the closest one
                this.pickedObject = intersectedObjects[0].object;
            // save its color
                this.pickedObjectSavedColor = this.pickedObject.material.emissive;
            // set its emissive color to flashing red/yellow
                const emi = ((time * 8) % 2 > 1 ? 0xFFFF00 : 0x000FFF);
                this.pickedObject.traverse((child)=>{
                    if (child instanceof THREE.Mesh) {
                        child.material = new THREE.MeshPhongMaterial({map: child.material.map, color: child.material.color, emissive: emi, side: THREE.DoubleSide});
                    }
                })
            if(Clicked == 1){
                console.log(this.pickedObject);
                if (this.pickedObject.name == "Cube"){ 
                    this.pickedObject.rotation.z = 30* Math.PI/180;
                    Clicked = 0;
                }
            }
          }
        }
      }

    
    const pickPosition = {x: 0, y: 0};
    const pickHelper = new PickHelper();
    clearPickPosition();

    function render(time) {
        time *= 0.01;
    
        if (resizeRendererToDisplaySize(renderer)) {
          const canvas = renderer.domElement;
          camera.aspect = canvas.clientWidth / canvas.clientHeight;
          camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);
        pickHelper.pick(pickPosition, scene, camera, time);

        requestAnimationFrame(render);
      }
    
      requestAnimationFrame(render);
      requestAnimationFrame(titleDrop);

      function getCanvasRelativePosition(event) {
        const rect = canvas.getBoundingClientRect();
        return {
          x: (event.clientX - rect.left) * canvas.width  / rect.width,
          y: (event.clientY - rect.top ) * canvas.height / rect.height,
        };
      }
    
      function setPickPosition(event) {
        const pos = getCanvasRelativePosition(event);
        pickPosition.x = (pos.x / canvas.width ) *  2 - 1;
        pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
      }
    
      function clearPickPosition() {
        // unlike the mouse which always has a position
        // if the user stops touching the screen we want
        // to stop picking. For now we just pick a value
        // unlikely to pick something
        pickPosition.x = -100000;
        pickPosition.y = -100000;
      }

      function onMouseClick(e) { 
        Clicked = 1;
      }

      window.addEventListener('mousemove', setPickPosition);
      window.addEventListener('mouseout', clearPickPosition);
      window.addEventListener('mouseleave', clearPickPosition);
    
      window.addEventListener('touchstart', (event) => {
        // prevent the window from scrolling
        event.preventDefault();
        setPickPosition(event.touches[0]);
      }, {passive: false});
    
      window.addEventListener('touchmove', (event) => {
        setPickPosition(event.touches[0]);
      });
      window.addEventListener('click', onMouseClick);
      window.addEventListener('touchend', clearPickPosition);
}

var Clicked = 0;
var Start = 0;
main();