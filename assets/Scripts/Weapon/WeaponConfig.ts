import { _decorator, Component, Enum, Node } from 'cc';
const { ccclass, property } = _decorator;
// 要想序列化进面板，必须有default值，否则不会显示，而且需要份文件名。

export enum WeaponType 
{
    AK,
    Uzi
}

@ccclass('WeaponConfig')
export class WeaponConfig 
{
    @property({displayName :'等级' ,min : 1, max : 4})
    level : number = 1;
    @property({type : Enum(WeaponType) , displayName : '武器类型'})
    type : WeaponType = WeaponType.AK;
    @property({displayName : '攻击范围'})
    attackRange : number = 500;
    @property({displayName : '子弹伤害'})
    bulletDamge : number = 10;
}

