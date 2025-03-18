import { _decorator , AudioClip, AudioSource, Component, instantiate, math, Node, Prefab, Vec2, Vec3 } from 'cc';
import { WeaponActor } from './WeaponActor';
import { ColliderCreator, ColliderTag } from '../Collider/ColliderCreator';
import { Emmiter } from '../Emmite/Emmiter';
import { WeaponConfig, WeaponType } from './WeaponConfig';
import { MonsterActor } from '../MonsterSpawn/MonsterActor';
import { EventCenter, EventName } from '../Event/EventCenter';
import { InputCheck } from '../Game/InputCheck';
import { TouchTowerEvent } from '../Event/TouchTowerEvent';
const { ccclass, property } = _decorator;

@ccclass('WeaponCreator')
export class WeaponCreator extends Component {

    static LevelInterval : number = 20;

    @property({ type: [WeaponConfig] , visible: true})
    public akConfig: WeaponConfig[] = [];

    @property({ type: [WeaponConfig] , visible: true })
    public uziConfig: WeaponConfig[] = [];

    @property({type : Node})
    public bulletParent: Node = null;

    @property({type : Prefab})
    public AKWeapon: Prefab = null;
    
    @property({type : [Prefab]})
    public AKEmmiter: Prefab[] = [];

    @property({type : Prefab})
    public UziWeapon: Prefab = null;
    
    @property({type : [Prefab]})
    public UziEmmiter: Prefab[] = [];

    private weapons : WeaponActor[] = [];

    protected start(): void {
        EventCenter.instance.on(EventName.on_create_tower, this.onCreate, this);
    }

    private onCreate(slot:Node , type:WeaponType , level:number)
    {
        this.createWeapon(type, level, slot);
    }

    protected onDestroy(): void {
        EventCenter.instance.off(EventName.on_create_tower, this.onCreate, this);
    }

    public OnUpdate(deltaTime : number , monsters : MonsterActor[])
    {
        for (let index = this.weapons.length - 1; index >=0; index--) {
            if(this.weapons[index].isDestroy)
            { 
                this.weapons[index].node.destroy();
                this.weapons.splice(index,1);
            }
        }
        for (const weapon of this.weapons) {
            weapon.Fire(monsters,deltaTime);
        }
    }

    public createWeapon(type : WeaponType , level : number , parent : Node)
    {
        level = math.clamp(level, 1, 4);
        let weaponActor : WeaponActor = null;
        switch(type) 
        {
            case WeaponType.AK:
                weaponActor = this.createAK(this.akConfig[level-1], parent);
                break;
            case WeaponType.Uzi:
                weaponActor = this.createUzi(this.uziConfig[level-1], parent);
                break;
            default:
                break;
        }
        if(weaponActor)
        { 
            this.weapons.push(weaponActor);
            this.getComponent(AudioSource).play();
        }
    }
    
    private createAK(config : WeaponConfig , parent : Node) : WeaponActor
    {
        let akWeapon = instantiate(this.AKWeapon);
        parent.addChild(akWeapon);
        this.SetLevel(akWeapon,config.level);
        ColliderCreator.SetLayerCollider(akWeapon,new Vec2(172,171) , config.level - 1 , WeaponCreator.LevelInterval , ColliderTag.tower);

        const up = new Vec3(0, 1, 0);
        let emmiter = instantiate(this.AKEmmiter[config.level-1]);
        emmiter.getComponent(Emmiter).bulletParent = this.bulletParent;
        akWeapon.addChild(emmiter);
        emmiter.setPosition(up.multiplyScalar((config.level-1) * WeaponCreator.LevelInterval));

        let weaponActor =  akWeapon.addComponent(WeaponActor);
        weaponActor.Init(config);
        akWeapon.addComponent(TouchTowerEvent);
        return weaponActor;
    }

    private createUzi(config : WeaponConfig , parent : Node) : WeaponActor
    {
        let uziWeapon = instantiate(this.UziWeapon);
        parent.addChild(uziWeapon);
        this.SetLevel(uziWeapon,config.level);
        ColliderCreator.SetLayerCollider(uziWeapon,new Vec2(172,171) , config.level - 1 , WeaponCreator.LevelInterval , ColliderTag.tower);

        const up = new Vec3(0, 1, 0);
        let emmiter = instantiate(this.UziEmmiter[config.level - 1]);
        uziWeapon.addChild(emmiter);
        emmiter.setPosition(up.multiplyScalar((config.level-1) * WeaponCreator.LevelInterval));
        emmiter.getComponent(Emmiter).bulletParent = this.bulletParent;
    
        let weaponActor =  uziWeapon.addComponent(WeaponActor);
        weaponActor.Init(config);
        uziWeapon.addComponent(TouchTowerEvent);
        return weaponActor;
    }

    private SetLevel(weapon : Node , level : number)
    {
        let bodyParent = weapon.getChildByName("Body");
        
        const currentLevel = bodyParent.children.length;
        
        if (currentLevel >= level) {
            return;
        }
        
        let childTemplate = bodyParent.children[0];
        
        for (let i = currentLevel; i < level; i++) {
            let child = instantiate(childTemplate);
            bodyParent.addChild(child);
            const up = new Vec3(0, 1, 0);
            child.setPosition(up.multiplyScalar(i * WeaponCreator.LevelInterval));
        }
    }

}


