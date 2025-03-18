import { _decorator, BoxCollider2D, Component, EventTouch, Input, input, PhysicsSystem2D, Vec2 } from 'cc';
import { ColliderTag } from '../Collider/ColliderCreator';
import { EventCenter, EventName } from '../Event/EventCenter';
import { MonsterActor } from '../MonsterSpawn/MonsterActor';
const { ccclass, property } = _decorator;

export interface ICanInputCheck 
{
    onEnter(): void;
    onMove(): void;
    onExit(): void;
}

@ccclass('InputCheck')
export class InputCheck extends Component {
    static instance: InputCheck = null;

    protected onLoad(): void {
        InputCheck.instance = this;
    }
    protected start(): void {
        input.on(Input.EventType.TOUCH_START, this.onDown, this);
        // input.on(Input.EventType.TOUCH_MOVE, this.onMoveOrHold, this);
        // input.on(Input.EventType.TOUCH_CANCEL, this.onUp, this);
    }
    //不灵敏，考虑直接个monster给Touch
    onDown(event : any)
    {
        const touch: EventTouch = event as EventTouch;
        const pos = touch.getUILocation();

        let colliders = this.Get(pos, ColliderTag.monster);
        if(colliders && colliders.length > 0){
            let monster = colliders[0].getComponent(MonsterActor);
            EventCenter.instance.emit(EventName.on_reselcet_monster , monster);
        }
    }
    // onMoveOrHold(event : any){}
    // onUp(event : any){}

    public Get(pos : Vec2 , tag : ColliderTag = ColliderTag.any) : BoxCollider2D[] 
    {
        let colliders = PhysicsSystem2D.instance.testPoint(pos) as BoxCollider2D[];
        if(tag === ColliderTag.any)
        { 
            return colliders;
        }
        let result : BoxCollider2D[] = [];
        for(let collider of colliders)
        {
            if(collider.tag === tag)
            { 
                result.push(collider);
            }
        }
        return result;
    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_START, this.onDown, this);
    }

}


