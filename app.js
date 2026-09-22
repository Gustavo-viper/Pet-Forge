import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js";

const sceneEl = document.querySelector("#scene");
const loading = document.querySelector("#loading");
const messageEl = document.querySelector("#message");

const state = { coins:100, hunger:80, happy:80, energy:80, clean:80 };

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1730);
scene.fog = new THREE.Fog(0x0d1730, 8, 18);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(5.2, 3.8, 6.5);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
sceneEl.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0,1.2,0);
controls.enablePan = false;
controls.minDistance = 4;
controls.maxDistance = 9;
controls.minPolarAngle = 0.65;
controls.maxPolarAngle = 1.45;

scene.add(new THREE.HemisphereLight(0x9fc5ff,0x1c233d,2.2));
const key = new THREE.DirectionalLight(0xffffff,3);
key.position.set(4,7,5); key.castShadow=true; scene.add(key);
const rim = new THREE.PointLight(0x4f8cff,10,10); rim.position.set(-4,3,-3); scene.add(rim);

function mat(color, rough=.7){return new THREE.MeshStandardMaterial({color,roughness:rough});}
function box(w,h,d,color,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
function sphere(r,color,x,y,z){const m=new THREE.Mesh(new THREE.SphereGeometry(r,32,24),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
function cyl(r,h,color,x,y,z){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}

const floor=box(12,.25,12,0x1b2946,0,-.15,0);
const rug=cyl(3.3,.05,0x304c78,0,.02,0);
const back=box(12,5,.2,0x111d35,0,2.5,-3.2);
const leftWall=box(.2,5,6,0x152541,-6,2.5,0);
box(2.4,.3,1.4,0x344d72,-3,.15,-1.8);
box(2.4,.3,1.4,0x344d72,3,.15,-1.8);
const bed=box(2.4,.5,1.5,0x5b82c4,-3,.45,-1.8);
box(2.1,.25,1.2,0x8eb8ff,-3,.78,-1.8);
box(1.2,.5,.4,0x253d66,-3,1.05,-2.25);

const pet=new THREE.Group(); scene.add(pet); pet.position.y=.2;
const body=sphere(1.05,0xd7e8ff,0,1.1,0);
body.scale.set(1,1.05,.85); pet.add(body);
const belly=sphere(.72,0xf7fbff,0,.98,.78); belly.scale.set(1,.95,.3); pet.add(belly);
const head=sphere(.95,0xe8f3ff,0,2.15,.05); head.scale.set(1.02,.95,.9); pet.add(head);
function ear(x,z,rot){const e=sphere(.34,0xe8f3ff,x,3.05,z);e.scale.set(.65,1.7,.55);e.rotation.z=rot;pet.add(e);const inner=sphere(.18,0xffa9c6,x,3.06,z+.27);inner.scale.set(.6,1.5,.2);inner.rotation.z=rot;pet.add(inner);}
ear(-.42,.02,-.18);ear(.42,.02,.18);
const eye1=sphere(.105,0x16233e,-.3,2.3,.83);const eye2=sphere(.105,0x16233e,.3,2.3,.83);pet.add(eye1,eye2);
const nose=sphere(.09,0xff83ad,0,2.05,.91);pet.add(nose);
const mouth=sphere(.12,0x8c3b63,0,1.91,.89);mouth.scale.set(1,.35,.2);pet.add(mouth);
const foot1=sphere(.3,0xc6dcf7,-.5,.35,.35);const foot2=sphere(.3,0xc6dcf7,.5,.35,.35);pet.add(foot1,foot2);
const tail=sphere(.38,0xe8f3ff,0,1.15,-.85);pet.add(tail);

const foodGroup=new THREE.Group();scene.add(foodGroup);foodGroup.position.set(2.3,1.0,.7);
const foodMesh=sphere(.22,0xff8b3d,0,0,0);
const stem=cyl(.035,.25,0x4f9e54,0,.23,0);foodGroup.add(foodMesh,stem);

function resize(){const w=sceneEl.clientWidth,h=sceneEl.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);}
window.addEventListener("resize",resize);resize();loading.remove();

function say(text){messageEl.textContent=text;clearTimeout(say.timer);say.timer=setTimeout(()=>messageEl.textContent="🐰 Estou pronto para brincar!",3000);}
function clamp(v){return Math.max(0,Math.min(100,v));}
function updateHUD(){
  document.querySelector("#coins").textContent=state.coins;
  for(const [id,val] of [["hunger",state.hunger],["happy",state.happy],["energy",state.energy],["clean",state.clean]]){
    document.querySelector("#"+id+"Bar").style.width=val+"%";
    document.querySelector("#"+id+"Text").textContent=Math.round(val)+"%";
  }
}
function action(type){
  if(type==="feed"){state.hunger=clamp(state.hunger+14);state.coins+=2;foodGroup.visible=false;say("Hmmm, que delícia! 🥕");animateEat();}
  if(type==="play"){state.happy=clamp(state.happy+12);state.energy=clamp(state.energy-7);state.coins+=3;say("Vamos brincar! 🎾");animateJump();}
  if(type==="sleep"){state.energy=clamp(state.energy+18);state.hunger=clamp(state.hunger-4);say("Zzz... que soninho 😴");animateSleep();}
  if(type==="bath"){state.clean=clamp(state.clean+22);state.happy=clamp(state.happy+3);say("Agora estou limpinho! 🛁");}
  if(type==="pet"){state.happy=clamp(state.happy+8);say("Aaaah, carinho! ❤️");animateHappy();}
  updateHUD();
}
document.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>action(b.dataset.action)));
document.querySelectorAll("[data-food]").forEach(b=>b.addEventListener("click",()=>{foodGroup.visible=true;foodMesh.material.color.set(0xff8b3d);action("feed");}));

function animateEat(){const start=performance.now();const tick=()=>{const t=(performance.now()-start)/650;if(t>=1){pet.scale.set(1,1,1);return}pet.scale.y=1+Math.sin(t*Math.PI*4)*.04;mouth.scale.y=.35+Math.sin(t*Math.PI)*.7;requestAnimationFrame(tick)};tick();}
function animateJump(){const start=performance.now();const tick=()=>{const t=(performance.now()-start)/700;if(t>=1){pet.position.y=.2;return}pet.position.y=.2+Math.sin(t*Math.PI)*.65;requestAnimationFrame(tick)};tick();}
function animateSleep(){const start=performance.now();const tick=()=>{const t=(performance.now()-start)/900;if(t>=1){pet.rotation.z=0;return}pet.rotation.z=Math.sin(t*Math.PI)*.12;requestAnimationFrame(tick)};tick();}
function animateHappy(){const start=performance.now();const tick=()=>{const t=(performance.now()-start)/600;if(t>=1){pet.rotation.y=0;return}pet.rotation.y=Math.sin(t*Math.PI*4)*.12;requestAnimationFrame(tick)};tick();}

let last=0;
function loop(time){
  requestAnimationFrame(loop);
  const dt=(time-last)/1000;last=time;
  pet.rotation.y=Math.sin(time*.001)*.04;
  tail.rotation.y=Math.sin(time*.003)*.5;
  if(foodGroup.visible)foodGroup.rotation.y+=dt;
  renderer.render(scene,camera);
}
loop(0);
updateHUD();
