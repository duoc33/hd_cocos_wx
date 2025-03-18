import { _decorator, Enum, EventTouch, instantiate, Prefab , Node, Button, input, Input, AudioSource } from 'cc';
import { TouchEventCmpt } from './TouchEventCmpt';
import { SelectCard } from '../UI/SelectCard';
import { WeaponType } from '../Weapon/WeaponConfig';
import { EventCenter, EventName } from './EventCenter';
import { InputCheck } from '../Game/InputCheck';
import { ColliderTag } from '../Collider/ColliderCreator';
import { WeaponActor } from '../Weapon/WeaponActor';
const { ccclass, property } = _decorator;

@ccclass('TouchCardEvent')
export class TouchCardEvent extends TouchEventCmpt {

    @property({type : Node})
    public cardSampleNode : Node = null;

    @property({type : Enum(WeaponType)})
    public type : WeaponType = WeaponType.AK;

    @property({type : SelectCard})
    private card : SelectCard = null;

    protected onTouchStart(event: any): void {
        this.getComponent(AudioSource).play();
    }

    protected onTouchMove(event: any): void {
        const touch : EventTouch = event as EventTouch;
        const pos = touch.getUILocation().toVec3();
        this.cardSampleNode.setWorldPosition(pos);
        if (!this.cardSampleNode.active) { this.cardSampleNode.active = true; }
    }

    protected onTouchCancel(event: any): void {
        this.cardSampleNode.active = false;
        const touch : EventTouch = event as EventTouch;
        const pos = touch.getUILocation().toVec3();
        let colliders = InputCheck.instance.Get(pos.toVec2(), ColliderTag.slot);
        if (colliders[0] && colliders[0].node) {
            let slot = colliders[0].node;
            if (slot.children && slot.children.length > 0) {
                for (let element of slot.children) {

                    let actor = element.getComponent(WeaponActor);

                    const atype = actor.GetType();

                    const alevel = actor.GetLevel();

                    if (atype === this.type && alevel === 1) {
                        if(this.card.Buy(this.type)){
                            EventCenter.instance.emit(EventName.on_create_tower,
                                slot,
                                this.type,
                                2,
                            );
                            actor.isDestroy = true;
                            return;
                        }
                    }
                }

            }
            else {
                if(this.card.Buy(this.type)){
                    EventCenter.instance.emit(EventName.on_create_tower,
                        slot,
                        this.type,
                        1,
                    );
                }
                
            }
        }
        
    }

    protected onDestroy(): void {
        
    }
}


