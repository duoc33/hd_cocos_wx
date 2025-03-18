import { _decorator, Component, EventMouse, EventTouch, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TouchEventCmpt')
export abstract class TouchEventCmpt extends Component {
    protected onEnable(): void 
    {
        
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart,this);    
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove,this);    
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd,this);    
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel,this);    
    }

    protected onTouchStart(event : any){}

    protected onTouchMove(event : any){}
    
    protected onTouchEnd(event : any){}

    protected onTouchCancel(event : any){}
    
    protected onDisable(): void {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart,this);
        this.node.off(Node.EventType.TOUCH_START, this.onTouchMove,this);
        this.node.off(Node.EventType.TOUCH_START, this.onTouchEnd,this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel,this);    
    }
}


