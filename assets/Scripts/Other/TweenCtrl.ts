import { _decorator, Component, instantiate, Node, Prefab, Tween, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TweenCtrl')
export class TweenCtrl extends Component {
    start() {
        let t = new Tween(this.node.getWorldPosition());
        t.delay(1).by(2, new Vec3(200, 200, 0), {
            onUpdate : (value: Vec3) => {
                this.node.setWorldPosition(value);
            },
            easing : 'linear'
        }).by(2,new Vec3(-200, -200, 0), {
            onUpdate : (value: Vec3) => {
                this.node.setWorldPosition(value);
            }
        }).set(this.node.getScale())
        .to(2, new Vec3(2, 2, 2), { onUpdate : (value: Vec3) => {
            this.node.setScale(value);
        }})
        .call(()=>{ console.log('Tween completed')} ).start();
    }

    update(deltaTime: number) 
    {

    }
}


