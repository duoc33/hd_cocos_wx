import { _decorator, BoxCollider2D, Collider2D, Component, Contact2DType, floatToHalf, IPhysics2DContact, math, Node, Quat, Vec2, Vec3 } from 'cc';
import { E_BulletTargetType, E_BulletTrackType, EmitterConfig, EmitterParam } from './EmmiterConfig';
import { ColliderTag } from '../Collider/ColliderCreator';
import { MosterActor } from '../MonsterSpawn/MosterActor';
const { ccclass, property } = _decorator;

@ccclass('BulletController')
export class BulletController extends Component {
    public config : EmitterConfig ;
    public param : EmitterParam ;
    public linearVelocity : number ;
    public angularVelocity : number ;
    public target : Node ;
    public lifeCycle : number ;
    public TargetPoint : Vec2 ;

    public angle : number;
    private readonly queue: BulletFSM[] = [];
    DEG_TO_RAD : number = Math.PI / 180;

    // private collider : BoxCollider2D = null;

    public bulletDamge : number = 1;

    public init(
        bulletDamge: number,
        config: EmitterConfig,
        param: EmitterParam,
        parent: Node,
        target: Node,
        targetPoint: Vec2
    ) {
        this.config = config;
        this.param = param;
        this.target = target;
        this.TargetPoint = targetPoint;
        this.lifeCycle = config.lifeCycle;

        this.angle = parent.angle + param.angular;
        this.node.angle = this.angle;

        this.bulletDamge = bulletDamge;
        this.node.getComponent(BoxCollider2D).tag = ColliderTag.bullet;

        // this.initBoxCollider();


        this.node.setWorldPosition(parent.worldPosition);
        let offsetResult = new Vec3();
        Vec3.transformQuat(offsetResult, param.offset , this.node.getWorldRotation());
        this.node.setWorldPosition(this.node.worldPosition.add(offsetResult.multiplyScalar(100))); // 时间，距离和Unity不太一样。

        this.linearVelocity = param.linearVelocity * 100; // 更改了倍数
        this.angularVelocity = param.angularVelocity ;

        switch (config.targetType)
        {
            case E_BulletTargetType.DirectionTarget:
                {
                    // console.log("0");
                    let fsm = new BulletMoveDirectionTargetFsm();
                    this.enqueue(fsm);
                }
                break;
            case E_BulletTargetType.UnitTarget:
                {
                    console.log("1");
                    let fsm = new BulletMoveUnitTargetFsm();
                    this.enqueue(fsm);
                }
                break;
            case E_BulletTargetType.PointTarget:
                {
                    switch (config.trackType)
                    {
                        case E_BulletTrackType.Line :
                            {
                                // console.log("2");
                                let fsm = new BulletMovePointTargetFsm();
                                this.enqueue(fsm);
                            }
                        break;
                        case E_BulletTrackType.Parabola :
                        {
                                console.log("3");
                                var fsm = new BulletParabolaMovePointTargetFsm();
                                let start = this.node.getWorldPosition();
                                start.set(start.x, start.y, 0);
                                let end = targetPoint;
                                let sub = end.subtract(start.toVec2());
                                let max = sub.length() * config.parabolicRadian;
                                fsm.Init(start, end.toVec3(), max);

                                this.enqueue(fsm);
                        }
                        break;
                        case E_BulletTrackType.Ellipse :
                        {
                            console.log("4");
                            let fsm = new BulletEllipseMovePointTargetFsm();
                            let start = this.node.getWorldPosition();
                            let end = targetPoint;
                            const shortHalf = 0.5;
                            fsm.Init(start.toVec2(), end, config.ellipseShortHalf, shortHalf, param.angular <= 0);

                            this.enqueue(fsm);
                        }
                        break;
                    }
                }
                break;
            default:
                break;
        }
    }

    update(deltaTime: number) {
        if (this.queue.length === 0) {
            this.node.destroy();
            return;
        }

        const currentFSM = this.queue[0];
        if (currentFSM.update(this, deltaTime)) {
            this.queue.shift();
        }

        this.lifeCycle -= deltaTime;
        if (this.lifeCycle <= 0) {
            this.node.destroy();
        }
    }

    // 入队
    public enqueue(item: BulletFSM) {
        this.queue.push(item);
    }

    // 出队
    public dequeue(): BulletFSM | undefined {
        return this.queue.shift(); // 先进先出
    }

    // 获取队列长度
    public size(): number {
        return this.queue.length;
    }

    // 检查队列是否为空
    public isEmpty(): boolean {
        return this.queue.length === 0;
    }
}

export abstract class BulletFSM
{
    public abstract update(bullet : BulletController , dt: number): boolean;
}

export class BulletMoveDirectionTargetFsm extends BulletFSM {

    public update(bullet: BulletController, dt: number): boolean {
        bullet.angle += bullet.angularVelocity * dt;
        // bullet.node.angle = bullet.angle;
        bullet.node.setWorldRotationFromEuler(0,0,bullet.angle);

        let position = bullet.node.getWorldPosition();
        position.add(bullet.node.up.multiplyScalar(bullet.linearVelocity * dt));
        bullet.node.setWorldPosition(position);
        return false;
    }
}

export class BulletMoveUnitTargetFsm extends BulletFSM {

    public update(bullet: BulletController, dt: number): boolean {
        const target = bullet.target;
        const transform = bullet.node;

        if (target) {
            const targetPoint = target.getWorldPosition().clone();
            const selfPos = transform.getWorldPosition().clone();
            const sub = targetPoint.subtract(selfPos);
            const deltaV = bullet.linearVelocity * dt;

            let up = transform.up.clone();
            const ad = Math.abs(bullet.angularVelocity) * dt;
            const _angle = math.toDegree(up.toVec2().signAngle(sub.toVec2()));

            // Check reach
            const inRange = sub.lengthSqr() <= deltaV * deltaV;
            const inAngle = Math.abs(_angle) <= ad;
            if (inRange && inAngle) {
                transform.setWorldPosition(targetPoint);
                return false;
            }

            bullet.angle += math.lerp(0, _angle, ad / Math.abs(_angle));
            transform.setRotationFromEuler(0,0,bullet.angle);

            let newWorldPos = transform.getWorldPosition().clone().add(up.multiplyScalar(deltaV));
            transform.setWorldPosition(newWorldPos);
            return false;
        } else {
            let up = transform.up.clone();
            let position = transform.worldPosition.clone().add(up.multiplyScalar(bullet.linearVelocity * dt));
            transform.setWorldPosition(position);
        }
        return false;
    }
}

export class BulletMovePointTargetFsm extends BulletFSM {
    public update(bullet: BulletController, dt: number): boolean {

        const targetPoint = bullet.TargetPoint.toVec3().clone();
        let node = bullet.node;
        const selfPos = node.getWorldPosition().clone();
        // 计算方向向量
        const sub = targetPoint.clone().subtract(selfPos).toVec2();

        let up = node.up.clone().toVec2();
        const angle = up.clone().signAngle(sub);
        // 计算本帧最大移动距离
        const deltaV = bullet.linearVelocity * dt;
        const ad = Math.abs(bullet.angularVelocity) * dt;

        const inRange = sub.lengthSqr() <= deltaV * deltaV;
        const inAngle = Math.abs(angle) <= ad;
        if (inRange && inAngle) {
            node.setWorldPosition(targetPoint);
            return true;
        }

        const deltaAngle =math.lerp(0 , angle ,(ad / Math.abs(angle || 1)))  ;
        bullet.angle += deltaAngle;
        node.setWorldRotationFromEuler(0,0,bullet.angle);
        // node.angle += bullet.angle;
        const newValue = node.getWorldPosition().clone().add(up.multiplyScalar(deltaV).toVec3());
        node.setWorldPosition(newValue);
        return false;
    }
}

export class BulletEllipseMovePointTargetFsm extends BulletFSM
{
    private center : Vec2;
    private a : number;
    private b : number;
    private x : number;
    private l : number;
    private dir : number;
    private rotation : Quat;

    public Init(start : Vec2, end : Vec2,  shortHalf : number, shortHalfRate : number = 0, isRight:boolean = true): void
    {
        let sub = end.subtract(start);
        this.center = start.add(sub.multiplyScalar(0.5));
        this.a = sub.length() * 0.5;
        this.b = shortHalf !== 0 ? shortHalf : this.a * shortHalfRate;
        this.l = Math.PI * (1.5 * (this.a + this.b) - Math.sqrt(this.a * this.b));
        this.dir = isRight ? 1 : -1;
        this.x = 0;

        this.rotation = new Quat();
        let from = new Vec3(1, 0, 0);
        let to = sub.normalize().multiplyScalar(-1).toVec3();
        Quat.rotationTo(this.rotation, from, to);
    }

    public update(bullet: BulletController, dt: number): boolean
    {
        // 累加行进距离
        this.x += bullet.linearVelocity * dt;
        // Clamp x 在 [0, l] 之间
        this.x = math.clamp(this.x, 0, this.l);
        // 根据当前进度计算角度（单位：度）
        let angle = (this.x / this.l) * 360 * this.dir;
        // 转换为弧度
        let rad = angle * (Math.PI / 180);
        // 计算椭圆上的点（未做旋转前）
        let p : Vec3 = new Vec2(Math.cos(rad) * this.a, Math.sin(rad) * this.b).toVec3();

        Vec3.transformQuat(p ,  p , this.rotation) ;

        bullet.node.setWorldPosition(this.center.clone().add(p.toVec2()).toVec3());

        // bullet.node.right.set(p);
        let rotationTo = new Quat();
        Quat.rotationTo(rotationTo, bullet.node.right, p.normalize());
        bullet.node.setWorldRotation(rotationTo);

        // 返回是否已运动至终点
        return this.x >= this.l;
    }

}

export class BulletParabolaMovePointTargetFsm extends BulletFSM
{
    private a : number;
    private b : number;
    private startZ : number;
    private start : Vec2;
    private sub : Vec2;
    private mag : number;
    private x : number;

    public Init(start : Vec3 , end : Vec3, max : number) : void
    {
        this.start = start.toVec2();
        this.sub = end.toVec2().subtract(start.toVec2());
        this.mag = this.sub.length();
        this.startZ = start.z;
        this.x = 0;
        let res = this.Calc2D5(new Vec2(0, this.startZ), new Vec2(this.mag, end.z), max);
        if (res[0])
        {
            this.a = res[1].x;
            this.b = res[1].y;
        }
    }

    public update(bullet: BulletController, dt: number): boolean {

        this.x += bullet.linearVelocity * dt;
        this.x = math.clamp(this.x, 0, this.mag);
        let h = this.a * this.x * this.x + this.b * this.x + this.startZ;
        let xy = this.sub.multiplyScalar(this.x / this.mag) ;
        xy.y += h * 0.5;
        // bullet.node.up.set(xy.x, xy.y, 0);
        let rotationTo = new Quat();
        Quat.rotationTo(rotationTo, bullet.node.up, xy.normalize().toVec3());
        bullet.node.setWorldRotation(rotationTo);

        bullet.node.setWorldPosition(this.start.add(xy).toVec3());
        return this.x >= this.mag;
    }

    public Calc2D5(start : Vec2, end : Vec2, max : number) : [boolean, Vec2]
    {
        let result = Vec2.ZERO;

        let _m = max - start.y;
        let _x = end.x - start.x;
        let _y = end.y - start.y;

        if (_x === 0)
        {
            return [true, result];
        }

        if (_m === 0)
        {
            return [_y === 0 , result];
        }
        let e1 = 2 * _m / _x;
        let e2a = 1 - _y / _m;
        if (e2a < 0)
        {
            return [false , result];
        }

        let e2 = Math.sqrt(e2a * _x * _x);
        let e3 = -(_x * _x) / (2 * _m);
        let sign = _m >= 0 ? -1 : 1;
        let b = e1 + sign * e2 / e3;
        let a = -(b * b) / (4 * _m);

        result = new Vec2(a, b);
        return [true , result];
    }

}
