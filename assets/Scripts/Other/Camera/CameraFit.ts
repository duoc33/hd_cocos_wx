import { _decorator, Camera, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraFit')
export class CameraFit extends Component {
    start() {
        const camera = this.node.getComponent(Camera);
    }

    update(deltaTime: number) {
        
    }
}


