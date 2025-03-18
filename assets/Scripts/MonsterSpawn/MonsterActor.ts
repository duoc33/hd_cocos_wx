import { _decorator, AudioSource, BoxCollider2D, Collider, Collider2D, Component, Contact2DType, instantiate, IPhysics2DContact, isValid, Label, Node, NodeSpace, Size, UITransform, Vec2, Vec3 } from 'cc';
import { MonsterConfig } from './MonsterMgr';
import { MapMgr } from '../Map/MapMgr';
import { EventCenter, EventName } from '../Event/EventCenter';
import { ColliderCreator, ColliderTag } from '../Collider/ColliderCreator';
import { BulletController } from '../Emmite/BulletController';
import { MonsterEffect } from '../Effects/MonsterEffect';
import { MusicController } from '../Game/MusicController';
const { ccclass, property } = _decorator;

@ccclass('MonsterActor')
export class MonsterActor extends Component {

    // public currentTarget

    static readonly monsterOverlayIntervalPixel: number = 10;

    // public fsm : MosterFSM = null;

    public config : MonsterConfig = null;

    private hptext: Label = null; // 145 145 , 30 , 6 , 最大值100000000

    //#region 状态相关的

    private collider: BoxCollider2D = null;

    private totalHp: number = 0;

    private layerHp: number = 0;

    //#endregion

    public isDeath : boolean = false;

    //#region 移动相关的

    private moveTargets : Node[] = [];

    private moveIndex : number = 0;

    private moveSpeed : number = 100;

    private currentPos : Vec3 = null;

    private currentTargetPos : Vec3 = null;

    private currentDir : Vec3 = null;

    private childrenNodes : Node[] = [];

    //#endregion

    public coinAward : number = 0;

    public MonsterEffect : MonsterEffect = null;

    public init(config :  MonsterConfig , moveSpeed : number , moveTargets : Node[] , moveIndex : number = 0 )
    {   
        this.config = config;

        this.coinAward = config.coin;

        this.moveTargets = moveTargets;

        this.moveSpeed = moveSpeed;

        this.isDeath = false;

        this.currentBeDamaged = 0;
        
        for (let index = 0; index < config.layerCount; index++) {
            const node = instantiate(config.monsterPrefab);
            this.node.addChild(node);
            this.childrenNodes.push(node);
            const up = new Vec3(0, 1, 0);
            node.setPosition(up.multiplyScalar(MonsterActor.monsterOverlayIntervalPixel * index));
        }
        
        this.InitMoveParams(moveIndex);

        this.InitCollider();

        this.InitHpText();
    }

    public OnUpdate(deltaTime: number)
    {
        this.MoveToNextTarget(deltaTime);
        this.BeDamagedCheck();
        if(!this.isDeath){
            this.MonsterEffect.OnUpdate(deltaTime);
        }
    }

    private BeDamagedCheck(): void {

        if(this.isDeath) return;

        let currentHp = this.totalHp -  this.currentBeDamaged;

        if(currentHp <= 0) 
        { 
            this.isDeath = true;
            return;
        }

        try {

            this.hptext.string = currentHp.toString();

            const count = Math.ceil(currentHp / this.layerHp);

            if (count <= 0) 
            {
                this.isDeath = true;
                return;
            }

            const node = this.childrenNodes[count - 1];

            if (node) { this.hptext.node.setParent(node); }

            for (let index = this.childrenNodes.length - 1; index > count - 1; index--) {
                if (this.childrenNodes[index]) {
                    this.childrenNodes[index].destroy();
                    this.childrenNodes.splice(index, 1);
                }
            }
        }
        catch (error) {
            console.error("在 BeDamged 方法中发生错误：", error);
        }
    }

    private InitCollider() 
    {
        this.currentBeDamaged = 0;

        this.collider = 
            ColliderCreator.SetLayerCollider(this.node,new Vec2(146,145) ,this.config.layerCount -1,
            MonsterActor.monsterOverlayIntervalPixel , ColliderTag.monster);
            
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onEnter, this);
    }

    protected onDisable(): void {
        this.collider.off(Contact2DType.BEGIN_CONTACT, this.onEnter, this);
    }

    private currentBeDamaged : number = 0;

    private onEnter(self: Collider2D, other: Collider2D, contact: IPhysics2DContact | null)
    {
        if(other.tag === ColliderTag.bullet )
        { 
            let bullet = other.getComponent(BulletController); 
            this.currentBeDamaged += bullet.bulletDamge;
            this.MonsterEffect.BeDamged();
            EventCenter.instance.emit(EventName.on_monster_be_damage , this);
            MusicController.instance.PlayAttack();
            bullet.node.destroy();
        }
    }

    private InitHpText() 
    {
        this.totalHp = this.config.TotalHp;

        this.layerHp = this.config.TotalHp / this.config.layerCount;

        this.hptext = new Node("hpText").addComponent(Label);

        this.hptext.horizontalAlign = 1;

        this.hptext.verticalAlign = 1;

        this.hptext.fontSize = 50;

        this.hptext.lineHeight = 6;

        this.hptext.isBold = true;

        this.hptext.overflow = 1;

        this.hptext.getComponent(UITransform).setContentSize(145,145);

        this.hptext.string = this.totalHp.toString();

        this.node.children[this.node.children.length - 1].addChild(this.hptext.node);
    
    }

    private InitMoveParams(moveIndex : number) 
    {
        this.moveIndex = moveIndex;
        if(this.moveIndex >= this.moveTargets.length){
            this.isDeath = true;
            return;
        }
        this.currentTargetPos = this.moveTargets[this.moveIndex].getWorldPosition().clone();
        this.currentPos = this.node.getWorldPosition().clone();
        this.currentDir = this.currentTargetPos.clone().subtract(this.currentPos).normalize();
    }

    private MoveToNextTarget(deltaTime: number) {
        if(this.isDeath || this.currentPos === null || this.currentTargetPos === null || this.currentDir === null || this.node === null) return;

        const lastDis =Vec3.distance(this.currentPos, this.currentTargetPos);
        const incrementPos: Vec3 = this.currentDir.clone().multiplyScalar(this.moveSpeed * deltaTime);
        this.currentPos.add(incrementPos);
        const currentDis = Vec3.distance(this.currentPos, this.currentTargetPos);

        if (currentDis < 10 || (lastDis < currentDis)) {
            this.node.setWorldPosition(this.currentTargetPos);
            this.moveIndex++;
            if (this.moveIndex >= this.moveTargets.length) {
                EventCenter.instance.emit(EventName.on_player_be_damage);
                this.isDeath = true;
                return;
            }
            this.currentPos = this.currentTargetPos;
            this.currentTargetPos = this.moveTargets[this.moveIndex].getWorldPosition().clone();
            this.currentDir = this.currentTargetPos.clone().subtract(this.currentPos).normalize();
        }
        else{
            this.node.setWorldPosition(this.currentPos);
        }
    }
}

