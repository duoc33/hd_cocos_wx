import { _decorator, Color, Component, CurveRange, Graphics, Line, MotionStreak, Node, NodeSpace, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BulletLine')
export class BulletLine extends Component {

    // private line: Graphics = null;

    // private positions: Vec3[] = [];

    // private currentDir: Vec3 = null;
    // start() {
    //     this.currentDir = this.node.up.clone();
    //     this.line = this.getComponentInChildren(Graphics);
    //     this.CreatePoints(5,200);
    // }
    motionStreak : MotionStreak = null;
    protected start(): void {
        this.motionStreak = this.getComponent(MotionStreak);
        // this.motionStreak.points
        // this.motionStreak.points.push();
    }

    protected update(dt: number): void {
        this.node.translate(new Vec3(0,1,0).multiplyScalar(dt * 100) , NodeSpace.LOCAL);
    }

    // private CreatePoints(sampleCount : number , length : number){
    //     let origin = new Vec3();
    //     const splitLenght = length / sampleCount ;
    //     for (let index = 0; index < sampleCount; index++) {
    //         origin.add(this.currentDir.clone().multiplyScalar(splitLenght * index));
    //         this.line.lineTo(origin.x,origin.y);
    //     }
    //     // this.line.moveTo(this.node.getPosition().x,this.node.getPosition());
    //     this.line.stroke();
    //     this.line.fill();
    // }
}


