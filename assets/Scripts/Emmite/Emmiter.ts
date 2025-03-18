import { _decorator, Component, EventMouse, game, Input, input, instantiate, isValid, JsonAsset, math, MobilityMode, Node, NodeSpace, Prefab, Quat, Tween, Vec2, Vec3 } from 'cc';
import { EmitterConfig, EmitterParam } from './EmmiterConfig';
import { BulletController } from './BulletController';
import { WeaponActor } from '../Weapon/WeaponActor';
const { ccclass, property } = _decorator;

@ccclass('Emmiter')
export class Emmiter extends Component {

    @property({type : Node, displayName : '子弹父节点'})
    bulletParent : Node = null;

    @property({type: Prefab, displayName:"子弹预制体", visible: true})
    public bulletPrefab : Prefab = null;
    @property({type: Node, displayName:"点目标", visible: true})
    public pointTarget : Node = null;

    @property({type: EmitterConfig, visible: true})
    config : EmitterConfig = null;

    bulletDamge : number = 1;

    fireTime : number= 0.0;
    loopTime : number=  Number.MAX_VALUE;
    loop : number = 0;
    index : number = 0;
    count : number = 0;
    param : EmitterParam = null;
    running : boolean = false;

    time : number = 0;

    // private targetPos : Vec3 = null;

    private fireTween : Tween = null;

    private PlayFireTween(){
        if(this.fireTween.running) return;
        this.node.setScale(new Vec3(0.8, 0.8, 1));
        this.fireTween.start();   
    }

    protected start(): void {
        this.Stop();

        this.fireTween = new Tween();
        this.fireTween.target(this.node.scale).to(0.2, new Vec3(1, 1, 1), {
            onUpdate: (value) => {
                if((!isValid(this.node,true)) || this.node === null) return;
                this.node.setScale(value);
            }
        });


        this.loop = -1; // 永远循环 -1
        this.loopTime = 0;
        this.ResetData();
        this.running = true;
        this.time = 0;
    }
    
    public Fire(pointTarget : Node , bulletDamge : number) : void
    {
        this.bulletDamge = bulletDamge;
        this.pointTarget = pointTarget;
        // this.loop = this.config.loop;
        // this.loop = -1; // 永远循环 -1
        // this.loopTime = 0;
        // this.ResetData();
        // this.running = true;
        // this.time = 0;
    }

    public Stop() : void
    {
        this.loopTime = Number.MAX_VALUE;
        this.running = false;
    }

    private ResetData() : void
    {
        this.param = this.config.startParam;
        if (this.config.paramList.length === 0) this.Stop();
        this.index = 0;
        this.count = 0;
        this.fireTime = 0;
    }
    

    private lookAtTarget(): void {
        if (this.pointTarget && isValid(this.pointTarget,true) ) {

            // this.node.up

            const targetPos = this.pointTarget.getWorldPosition();  // 获取目标位置
            const currentPos = this.node.getWorldPosition();  // 获取当前节点位置

            // 计算方向向量
            const direction = new Vec3();
            Vec3.subtract(direction, targetPos, currentPos);

            // 计算旋转角度（核心数学计算）
            const angle = Math.atan2(-direction.x, direction.y) * 180 / Math.PI;

            // 应用旋转（2D 方式）
            this.node.angle = angle;
        }  // 让当前节点的 Y 轴指向目标位置（2D 实现）
    }

    private LaunchBullet() : void
    {
        if (this.bulletPrefab) {
            if(this.pointTarget && isValid(this.pointTarget,true))
            {
                this.PlayFireTween();
                let obj = instantiate(this.bulletPrefab);
                obj.setParent(this.bulletParent);
                let bullet = obj.addComponent(BulletController);
                bullet.init( this.bulletDamge,this.config, this.param, this.node, null, this.pointTarget.getWorldPosition().toVec2());
            }
        }
    }

    public OnUpdate(deltaTime : number) : void
    {
        this.time += deltaTime;

        if ((!this.running) || this.time < this.loopTime) return;

        if (this.time >= this.fireTime) this.lookAtTarget();
        
        while (this.time >= this.fireTime)
        {
            this.LaunchBullet();
            this.fireTime = this.time + this.param.interval;
            this.count++;
            if (this.count >= this.config.paramList[this.index].bulletAmount)
            {
                this.index++;
                this.count = 0;
                if (this.index >= this.config.paramList.length)
                {
                    // 打完一轮
                    if (this.loop < 0 || this.loop > 1)
                    {
                        this.loop--;
                        this.loopTime =this.time + this.config.loopInterval;
                        this.ResetData();
                    }
                    else
                    {
                        this.loop = 0;
                        this.Stop();
                    }
                    break;
                }
            }
            this.param = this.add(this.param, this.config.paramList[this.index]);
        }
    }

    private add(a: EmitterParam, b: EmitterParam): EmitterParam {
        return new EmitterParam(
            a.bulletAmount + b.bulletAmount,
            a.offset.clone().add(b.offset),
            a.interval + b.interval,
            a.linearVelocity + b.linearVelocity,
            a.angularVelocity + b.angularVelocity,
            a.angular + b.angular
        );
    }
}


