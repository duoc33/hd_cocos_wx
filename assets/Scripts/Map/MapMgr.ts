import { _decorator, Component, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MapMgr')
export class MapMgr extends Component {

    @property({type: Node, visible: true})
    pathParent : Node = null;
    @property({type: Node, visible: true})
    slotParent : Node = null;
    public get pathList() : Node[] 
    {
        return this.pathParent.children;
    }

    protected start(): void {
        
    }

    public get slotList() : Node[] 
    {
        return this.slotParent.children;
    }

}


