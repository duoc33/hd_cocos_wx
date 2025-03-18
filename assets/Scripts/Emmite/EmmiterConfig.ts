import { _decorator, Enum, Tween, TweenEasing, Vec3 } from "cc";

const { ccclass, property } = _decorator;

export enum E_BulletTargetType {
    DirectionTarget = 0, // 方向目标
    PointTarget = 1, // 点目标
    UnitTarget = 2, // 单位目标
    NoTarget = 3, // 无目标
}

export enum E_BulletTrackType {
    Line = 0, // 直线
    Parabola = 1, // 抛物线
    Ellipse = 2, // 椭圆
    Hold = 3, // 保持原位
}

export enum E_BulletColliderType {
    Circle = 0, // 圆
    Laser = 1, // 激光
}

@ccclass('TweenEffectParam')
export class TweenEffectParam
{
    @property
    delay: number = 0; // 延迟时间
    @property
    duration: number = 0; // 持续时间
    @property
    easingType : TweenEasing = 'linear';
}

@ccclass('EmitterParam')
export class EmitterParam {
    @property({displayName: '发射数量'})
    bulletAmount: number; // 发射数量
    @property({displayName: '位置偏移'})
    offset: Vec3; // 位置偏移
    @property({displayName: '发射间隔'})
    interval: number; // 发射间隔
    @property({displayName: '线速度'})
    linearVelocity: number; // 线速度
    @property({displayName: '角速度'})
    angularVelocity: number; // 角速度
    @property({displayName: '发射角度'})
    angular: number; // 发射角度
    constructor(
        bulletAmount: number = 0,
        offset: Vec3 = new Vec3(0, 0, 0),
        interval: number = 0,
        linearVelocity: number = 0,
        angularVelocity: number = 0,
        angular: number = 0
    ) {
        this.bulletAmount = bulletAmount;
        this.offset = offset;
        this.interval = interval;
        this.linearVelocity = linearVelocity;
        this.angularVelocity = angularVelocity;
        this.angular = angular;
    }
}

@ccclass('EmitterConfig')
export class EmitterConfig  {

    @property({
        displayName: '生命周期（秒）',
        tooltip: '子弹存在时间',
        min: 0.5
    })
    public lifeCycle: number = 1;
    @property({type : Enum(E_BulletColliderType) , displayName : '碰撞类型'})
    public bulletType: E_BulletColliderType = E_BulletColliderType.Circle;
    @property({type : Enum(E_BulletTargetType), displayName : '目标类型'})
    public targetType: E_BulletTargetType = E_BulletTargetType.NoTarget;
    @property({type : Enum(E_BulletTrackType) , displayName : '路径类型'})
    public trackType: E_BulletTrackType = E_BulletTrackType.Hold;
    @property({
        displayName: '循环次数',
        tooltip: '-1 表示无限循环',
        min: -1
    })
    public loop: number = 1;
    @property({
        displayName: '循环间隔',
        tooltip: '每次循环间隔时间（秒）',
        min: 0
    })
    public loopInterval: number = 0;
    @property({
        type: EmitterParam,
        displayName: '初始参数',
        tooltip: '发射器的初始参数配置'
    })
    
    public startParam: EmitterParam = new EmitterParam();
    @property({
        type: [EmitterParam],
        displayName: '变化参数',
        tooltip: '随时间变化的参数序列'
    })
    public paramList: EmitterParam[] = []; // 变化参数
    @property({
        displayName: '抛物线弧度',
        tooltip: '抛物线轨迹的弧度系数',
    })
    public parabolicRadian: number = 0.15; // 抛物线弧度
    @property({
        displayName: '椭圆短半轴',
        tooltip: '椭圆轨迹的短半轴长度',
        min: 0
    })
    public ellipseShortHalf: number = 0; // 椭圆短半长
}



