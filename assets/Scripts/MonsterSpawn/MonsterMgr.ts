import { _decorator, Component, game, instantiate, isValid, Material, Node, Prefab, UITransform, Vec3 } from 'cc';
import { MapMgr } from '../Map/MapMgr';
import { EventCenter, EventName } from '../Event/EventCenter';
import { MonsterActor } from './MonsterActor';
import { MonsterEffect } from '../Effects/MonsterEffect';
import { MusicController } from '../Game/MusicController';
const { ccclass, property } = _decorator;

@ccclass('MonsterConfig')
export class MonsterConfig 
{
    @property
    public coin : number = 5;

    @property({type: Prefab})
    public brokenPs : Prefab = null;

    @property({
        type: Prefab,
        visible: true,
    })
    monsterPrefab: Prefab = null;

    @property
    generateCount : number = 1;

    @property
    layerCount : number = 1;

    @property
    TotalHp : number = 100;
}
@ccclass('WaveConfig')
export class WaveConfig 
{
    @property({
        type: [MonsterConfig],
        visible: true,
    })
    monsters : MonsterConfig[] = [];

    public constructor()
    {
        this.Init();
    }

    public SetCurrentCount(value : number){
        this.currentCount = value;
    }
    public SetMonsterIndex(value : number){
        this.currentMonsterIndex = value;
    }

    private timer : number = 0;
    
    private currentMonsterIndex : number = 0;

    private currentCount : number = 0;
    
    public GetCurrentMonsterConfig( dt:number , moveSpeed : number  ,spawnInterval : number) : {isNextWave : boolean , config: MonsterConfig}
    {
        if(this.currentMonsterIndex >= this.monsters.length) return {isNextWave : true , config : null };
        
        this.timer += dt;

        const dis = this.timer * moveSpeed

        if(dis >= spawnInterval)
        {
            this.timer = 0;
            const config = this.monsters[this.currentMonsterIndex];
            const generateCount = config.generateCount;
            this.currentCount++;
            if(generateCount <= this.currentCount) 
            {
                this.currentMonsterIndex++;
                this.currentCount = 0;
            }
            return { isNextWave : false , config : config  } ;
        }
        return { isNextWave : false , config : null  } ;
    }

    public Init()
    {
        this.timer = 0;
        this.currentMonsterIndex = 0;
        this.currentCount = 0;
    }
}

@ccclass('MonsterMgr')
export class MonsterMgr extends Component {
    @property
    initTimes : number = 30;

    @property({type : Material})
    beDamgedEffect : Material = null;
    @property
    durationDamage : number = 1.5;
    @property 
    startValueDamage : number = 0.2;
    @property 
    endValueDamage:number = 1;

    @property
    onMoveChangeScaleWeight : number = 0.8;
    @property
    onMoveChangeScaleWeightTime : number = 1;


    @property
    intervalUnit:number = 146;

    @property
    waveInterval : number = 584; // 波次间隔时间
    @property
    spawnInterval : number = 146; // 怪物间隔距离像素
    @property
    moveSpeed : number = 100;
    @property({
        type: [WaveConfig],
        visible: true,
    })
    public waveConfigs : WaveConfig[] = [];

    private currentWaveConfig : WaveConfig = null;

    private waveIndex : number = 0;

    private waveEnd : boolean = false;

    private monsterNodes : MonsterActor[] = [];

    private moveTargets : Node[] = [];

    public Init(initPos : Vec3 , moveTargets : Node[])
    {
        this.isStop = true;
        this.initPos = initPos;
        this.moveTargets = moveTargets;
        this.waveIndex = 0;
        this.waveEnd = false;
        for (let index = 0; index < this.monsterNodes.length; index++) {
            let monster = this.monsterNodes[index].node;
            monster.destroy();
        }
        this.monsterNodes = [];

        for (const element of this.waveConfigs) {
            element.Init();
        }

        this.waveInterval =  this.waveInterval * this.intervalUnit;
        this.spawnInterval = this.spawnInterval * this.intervalUnit;


        this.elaspeTimeSpwan();
        this.isStop = false;
    }
    
    private elaspeTimeSpwan() {

        let remainTime = this.initTimes;
        const delta = 0.02;
        remainTime -= delta;
        while (remainTime >= 0) {

            this.WaveCheckAndSpawn(delta, this.spawnInterval, this.waveInterval);

            for (const monster of this.monsterNodes) {
                monster.OnUpdate(delta);
            }

            remainTime -= delta;
        }
        this.autoSort();
    }
    private isStop : boolean = false;

    public OnUpdate(dt: number): MonsterActor[] {
        if(this.isStop) return;
        
        this.checkMonsterContainer();

        this.WaveCheckAndSpawn(dt,this.spawnInterval,this.waveInterval);

        for(const monster of this.monsterNodes)
        {
            monster.OnUpdate(dt);
        }
        return this.monsterNodes;
    }

    public IsPlayerWin() : boolean
    {
        return (this.monsterNodes === null || this.monsterNodes.length === 0) && this.waveEnd;
    }

    // 集中销毁
    private checkMonsterContainer()
    {
        for (let i = this.monsterNodes.length - 1; i >= 0; i--) {
            let monster = this.monsterNodes[i];
            if (monster.isDeath) {
                this.creatDeathPS(monster.config.brokenPs,monster.node.getWorldPosition());
                MusicController.instance.PlayDeath();
                EventCenter.instance.emit(EventName.on_monster_death, monster.coinAward ,monster.node);
                monster.node.destroy();
                this.monsterNodes[i] = null;
                this.monsterNodes.splice(i, 1);
            }
        }
        this.autoSort();
    }
    private autoSort() {
        this.node.children.sort((a, b) => b.position.y - a.position.y);
    }
    private creatDeathPS(prefab : Prefab , pos : Vec3){
        let node = instantiate(prefab);
        node.setParent(this.node);
        node.setWorldPosition(pos);
    }

    private timer : number = 0;
    
    private WaveCheckAndSpawn(dt : number , spawnInterval : number , waveInterval : number)
    {
        if(this.waveIndex<0 ||this.waveIndex >= this.waveConfigs.length)
        { 
            // this.waveEnd = true;
            this.waveIndex = this.waveConfigs.length - 1; // 循环最后一波
            this.currentWaveConfig = this.waveConfigs[this.waveIndex];
            this.currentWaveConfig.Init();
            // return;
        }

        this.currentWaveConfig = this.waveConfigs[this.waveIndex];

        const info = this.currentWaveConfig.GetCurrentMonsterConfig(dt, this.moveSpeed , spawnInterval);

        // console.log(info.isNextWave);
        if (!info.isNextWave) {
            if (info.config) {
                this.Spawn(info.config,this.initPos);
            }
        }
        else {
            this.timer += dt;
            const dis = this.timer * this.moveSpeed;
            if (dis >= waveInterval) {
                this.timer = 0;
                this.waveIndex++;
            }
        }
        this.waveEnd = false;
    }

    private initPos : Vec3 = null;

    private Spawn(monsterConfig : MonsterConfig , initPos : Vec3  ,moveIndex : number = 0 )
    {
        if (!monsterConfig) return;
        let monster = new Node("Monster");
        this.node.insertChild(monster , 0);
        monster.setWorldPosition(initPos);
        let actor = monster.addComponent(MonsterActor);
        actor.init(monsterConfig , this.moveSpeed , this.moveTargets , moveIndex);
        let me = monster.addComponent(MonsterEffect);
        me.initMoveChangeScaleTween(this.onMoveChangeScaleWeight,this.onMoveChangeScaleWeightTime);
        me.initDamgeEffect(this.beDamgedEffect,this.startValueDamage,this.endValueDamage,this.durationDamage);
        actor.MonsterEffect = me;
        this.monsterNodes.push(actor);
    }

}





