import { _decorator, Component, EventTouch, isValid, Node, Tween, Vec3 } from 'cc';
import { TouchEventCmpt } from './TouchEventCmpt';
import { WeaponActor } from '../Weapon/WeaponActor';
import { EventCenter, EventName } from './EventCenter';
import { InputCheck } from '../Game/InputCheck';
import { ColliderTag } from '../Collider/ColliderCreator';
import { WeaponType } from '../Weapon/WeaponConfig';
const { ccclass, property } = _decorator;

@ccclass('TouchTowerEvent')
export class TouchTowerEvent extends TouchEventCmpt {
    private holdParent : Node = null;
    private oldParent : Node = null;
    private actor : WeaponActor = null;
    private currentType : WeaponType ;
    private currentLevel : number;
    protected start(): void {
        this.holdParent = InputCheck.instance.node;
        this.actor = this.node.getComponent(WeaponActor);
        this.currentLevel = this.actor.GetLevel();
        this.currentType = this.actor.GetType();
        this.oldParent = this.node.parent;

        this.touchTween = new Tween();
        this.touchTween.target(this.node.scale).to(0.2,new Vec3(0.8,0.8,1),{
            onUpdate : (value)=>{
                if(this.node ===null || (!isValid(this.node,true))) return;
                this.node.setScale(value);
            }
        }).to(0.2,new Vec3(1,1,1),{
            onUpdate : (value)=>{
                if(this.node ===null || (!isValid(this.node,true))) return;
                this.node.setScale(value);
            }
        }).union();
    }


    private touchTween : Tween = null;

    protected onTouchStart(event: any): void {
        this.node.setScale(new Vec3(1,1,1));
        this.touchTween.start();
        const touch: EventTouch = event as EventTouch;
        const pos = touch.getUILocation().toVec3();
        this.actor.SetStop(true);
        this.actor.node.setParent(this.holdParent);
        this.actor.node.setWorldPosition(pos);
    }

    protected onDestroy(): void {
        this.touchTween.destroySelf();
    }
    
    protected onTouchMove(event: any): void {
        const touch: EventTouch = event as EventTouch;
        const pos = touch.getUILocation().toVec3();
        this.actor.node.setWorldPosition(pos);
    }

    //这个位置也改一改
    protected onTouchEnd(event: any): void {
        const touch: EventTouch = event as EventTouch;
        const pos = touch.getUILocation();

        let colliders = InputCheck.instance.Get(pos,ColliderTag.slot);
        let slot : Node = null;

        if(colliders && colliders.length > 0){
            slot = colliders[0].node;
        }
        
        if(!slot) {
            this.actor.node.setParent(this.oldParent);
            this.actor.node.setPosition(Vec3.ZERO);
            this.actor.getComponent(WeaponActor).PlayScaleTween();
            this.actor.SetStop(false);
            return;
        }
        
        if(slot.children && slot.children.length > 0){
            let other = slot.children[0].getComponent(WeaponActor);
            const otype = other.GetType();
            const olevel = other.GetLevel();
            if (otype === this.currentType && olevel === this.currentLevel && (this.currentLevel + 1) <= 4) {
                other.isDestroy = true;
                this.actor.isDestroy = true;
                EventCenter.instance.emit(EventName.on_create_tower,
                    slot,
                    this.currentType,
                    (this.currentLevel + 1),
                );
            }
            else {
                this.actor.node.setParent(this.oldParent);
                this.actor.node.setPosition(Vec3.ZERO);
                this.actor.getComponent(WeaponActor).PlayScaleTween();
                this.actor.SetStop(false);
                return;
            }
        }
        else{
            this.oldParent = slot;
            this.actor.node.setParent(slot);
            this.actor.getComponent(WeaponActor).PlayScaleTween();
            this.actor.SetStop(false);
            this.actor.node.setPosition(Vec3.ZERO);
        }
    }
}


