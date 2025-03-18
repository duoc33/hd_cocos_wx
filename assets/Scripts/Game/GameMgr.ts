
// @ts-nocheck
import { _decorator, Camera, Collider2D, Component, EventMouse, EventTouch, Input, input, instantiate, IPhysics2DContact, PhysicsSystem2D, Prefab, resources , Node, UITransform, game } from 'cc';
import { MonsterMgr } from '../MonsterSpawn/MonsterMgr';
import { TouchEventCmpt } from '../Event/TouchEventCmpt';
import { WeaponCreator } from '../Weapon/WeaponCreator';
import { MapMgr } from '../Map/MapMgr';
import { WeaponType } from '../Weapon/WeaponConfig';
import { MonsterActor } from '../MonsterSpawn/MonsterActor';
import { InputCheck } from './InputCheck';
import { ColliderTag } from '../Collider/ColliderCreator';
import { EventCenter, EventName } from '../Event/EventCenter';
const { ccclass, property } = _decorator;

@ccclass('GameMgr')
export class GameMgr extends Component {
    @property({type : Node})
    tipTimeOut : Node = null;

    @property({displayName : "试玩时间"})
    time : number = 30;

    @property({type : Camera})
    camera : Camera = null;
    @property({type : MonsterMgr})
    monsterMgr : MonsterMgr = null;
    @property({type : WeaponCreator})
    weaponCretor : WeaponCreator = null;
    @property({type : MapMgr})
    mapMgr : MapMgr = null;

    static instance: GameMgr = null;
    private timer : number = 0;
    private isStop : boolean = false;
    private monsters:MonsterActor[] = null;
    protected onLoad(): void {
        GameMgr.instance = this;
        this.timer = 0;
        this.isStop = true;
    }
    protected start(): void {
        PhysicsSystem2D.instance.enable = true;
        this.monsterMgr.Init(this.mapMgr.pathList[0].getWorldPosition(),this.mapMgr.pathList);
        this.isStop = false;
        EventCenter.instance.on(EventName.game_over,this.gameOver,this);
    }

    private gameOver(){
        this.isStop = true;
        this.tipTimeOut.active = true;
        // wx.notifyMiniProgramPlayableStatus({
        //     isEnd: true
        // });
    }
    
    update(dt: number) {
        if (this.isStop) return;
        this.timer += dt;
        if(this.timer >= this.time){
            console.log("Time End");
            // EventCenter.instance.emit(EventName.game_over);
            // return;
        }
        // console.log(this.timer);
        this.monsters = this.monsterMgr.OnUpdate(dt);
        this.weaponCretor.OnUpdate(dt,this.monsters);
    }

    protected onDestroy(): void {
        EventCenter.instance.off(EventName.game_over,this.gameOver,this);
    }
}


