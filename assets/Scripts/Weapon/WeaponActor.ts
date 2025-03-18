import { _decorator, Component, isValid, Tween, Vec3 } from 'cc';
import { Emmiter } from '../Emmite/Emmiter';
import { WeaponConfig, WeaponType } from './WeaponConfig';
import { MonsterActor } from '../MonsterSpawn/MonsterActor';
import { EventCenter, EventName } from '../Event/EventCenter';
const { ccclass, property } = _decorator;

@ccclass('WeaponActor')
export class WeaponActor extends Component {

    public GetType(): WeaponType {
        return this.weaponConfig.type;
    }

    public GetLevel(): number {
        return this.weaponConfig.level;
    }

    public SetStop(stop: boolean) {
        this.isStop = stop;
    }

    private isStop: boolean = false;

    public isDestroy: boolean = false;

    private weaponConfig: WeaponConfig = null;

    private emmiter: Emmiter = null;

    @property({ type: MonsterActor, visible: true })
    private currentTarget: MonsterActor = null;

    public attackRange: number = 0;

    private bulletDamge: number = 0;
    private scaleTween : Tween = null;
    // private fireTween : Tween = null;
    protected onLoad(): void {
        this.scaleTween = new Tween();
        this.node.setScale(new Vec3(0.5,0.5,1));
        this.scaleTween.target(this.node.scale).to(0.3,new Vec3(1,1,1),{
            onUpdate : (value)=>{
                if((!isValid(this.node,true)) || this.node === null) return;
                this.node.setScale(value);
            }
        }).start();

        // this.fireTween = new Tween();
        // this.fireTween.target(this.node.scale).to(0.2, new Vec3(1, 1, 1), {
        //     onUpdate: (value) => {
        //         if((!isValid(this.node,true)) || this.node === null) return;
        //         this.node.setScale(value);
        //     }
        // });

        EventCenter.instance.on(EventName.on_reselcet_monster, this.onReSelecteTarget, this);
    }
    // public PlayFireTween(){
    //     if(this.fireTween.running) return;
    //     this.node.setScale(new Vec3(0.8, 0.8, 1));
    //     this.fireTween.start();   
    // }

    public PlayScaleTween(){
        this.node.setScale(new Vec3(0.5,0.5,1));
        this.scaleTween.start();
    }

    protected onDestroy(): void {
        // this.fireTween.destroySelf();
        this.scaleTween.destroySelf();
        EventCenter.instance.off(EventName.on_reselcet_monster, this.onReSelecteTarget, this);
    }

    
    public Init(config: WeaponConfig) {
        this.weaponConfig = config;

        this.isDestroy = false;

        this.isStop = false;

        this.attackRange = this.weaponConfig.attackRange * this.weaponConfig.attackRange;

        this.bulletDamge = this.weaponConfig.bulletDamge;

        this.emmiter = this.node.getComponentInChildren(Emmiter);
    }
    // 这个位置有问题 , 明天来看看.
    public Fire(monsters: MonsterActor[], deltaTime: number) {
        if (this.isStop) return;

        let reSelected = true;

        if (this.checkCurrentStatus(this.currentTarget)) {
            reSelected = false;
        }

        if (reSelected) {
            if (this.findNearestNode(monsters)) {
                this.emmiter.Fire(this.currentTarget.node, this.bulletDamge);
            }
        }

        if(this.isReselectedByEvent){
            this.isReselectedByEvent = false;
            this.currentTarget = this.reselectedMonster;
            this.emmiter.Fire(this.currentTarget.node, this.bulletDamge);
        }

        this.emmiter.OnUpdate(deltaTime);
    }

    private isReselectedByEvent: boolean = false;

    private reselectedMonster: MonsterActor | null = null;

    private onReSelecteTarget(monster: MonsterActor) {
        if(this.checkCurrentStatus(monster)){
            // console.log("on_reselcet_monster");
            this.isReselectedByEvent = true;
            this.reselectedMonster = monster;
        }
    }

    // 找到最近节点
    private findNearestNode(monsters: MonsterActor[]): boolean {
        let minSqrDistance = Number.MAX_VALUE;
        let nearestTarget: MonsterActor | null = null;
        if (monsters && monsters.length > 0) {
            for (const monster of monsters) {
                // 检查怪物是否有效且未死亡
                if (!monster || monster.isDeath) continue;

                // 获取双方的世界坐标
                const monsterPos = new Vec3();
                monster.node.getWorldPosition(monsterPos);
                const selfPos = new Vec3();
                this.node.getWorldPosition(selfPos);

                // 计算平方距离
                const sqrDistance = Vec3.squaredDistance(monsterPos, selfPos);

                // 更新最近目标和最小距离
                if (sqrDistance < minSqrDistance) {
                    minSqrDistance = sqrDistance;
                    nearestTarget = monster;
                }
            }
        }

        // 判断是否在攻击范围内（假设 attackRange 是实际距离）
        if (nearestTarget && minSqrDistance <= this.attackRange) {
            this.currentTarget = nearestTarget;
            return true;
        }

        this.currentTarget = null;
        return false;
    }

    private checkCurrentStatus(monster: MonsterActor): boolean {
        if (monster && (!monster.isDeath)
            && (Vec3.squaredDistance(monster.node.getWorldPosition(), this.node.getWorldPosition()) <= this.attackRange)
        ) {
            return true;
        }
        return false;
    }
}


