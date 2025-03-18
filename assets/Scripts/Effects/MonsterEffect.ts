import { _decorator, Component, ITweenOption, Material, math, Sprite, Tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MonsterEffect')
export class MonsterEffect extends Component {

    //#region Move Tween
    
    onMoveChangeScaleWeight : number = 0.8;
    onMoveChangeScaleWeightTime : number = 1;
    private moveTween : Tween | null = null;
    private moveOption: ITweenOption = null;
    private targetScale:Vec3 = null;
    public initMoveChangeScaleTween(onMoveChangeScaleWeight : number , onMoveChangeScaleWeightTime : number){
        this.onMoveChangeScaleWeight = onMoveChangeScaleWeight;
        this.onMoveChangeScaleWeightTime = onMoveChangeScaleWeightTime; 
        this.moveTween = new Tween();
        this.moveOption = {
            onUpdate : (value)=>{
                if(this.node){
                    this.node.setScale(value);
                }
            }
        };
        const scale = this.node.scale.clone().multiplyScalar(this.onMoveChangeScaleWeight);
        this.targetScale = scale;
        this.moveTween.target(this.node.scale).to(this.onMoveChangeScaleWeightTime , this.targetScale,this.moveOption).
            to(this.onMoveChangeScaleWeightTime,Vec3.ONE,this.moveOption).union().repeatForever().start();
    }

    private destroyMoveTween(){
        this.moveTween.stop();
        this.moveTween.destroySelf();
    }
    //#endregion

    //#region BeDamaged Tween
    private shareMat : Material = null;
    private duration: number = 2;
    private startValue : number = 0.2;
    private endValue : number = 1;
    private _time: number = 0;

    public initDamgeEffect(flashmaterial : Material ,startValue : number ,endValue : number, duration : number){
        this.duration = duration;
        this.startValue = startValue;
        this.endValue = endValue;
        this.shareMat = new Material();
        this.shareMat.copy(flashmaterial);
        for (let element of this.node.children) {
            const sprite = element.getComponent(Sprite);
            if (sprite) {
                sprite.customMaterial = this.shareMat;
            }
        }
        const scale = this.node.scale.clone().multiplyScalar(this.onMoveChangeScaleWeight);
        this.targetScale = scale;
        this.shakeTween = new Tween();
        this.shakeTween.target(this.node.scale).to(0.2 , this.targetScale,this.moveOption).
            to(0.2,Vec3.ONE,this.moveOption).union().repeat(3);
    }
    private shakeTween : Tween = null;

    
    public BeDamged(){
        this._time = 0;
        this.shareMat.setProperty("u_rate",this.startValue);
        this.shakeTween.start();
    }

    private onUpdateBeDamaged(dt : number){
        if (this._time < this.duration) {
            this._time += dt;
            const value = math.lerp(this.startValue,this.endValue,this._time / this.duration);
            this.shareMat.setProperty("u_rate", value);
        }
    }
    private destroyEffect(){
        this.shareMat.destroy();
    }

    //#endregion

    public OnUpdate(dt: number): void {
        this.onUpdateBeDamaged(dt);
    }

    protected onDestroy(): void {
        this.destroyMoveTween();
        this.destroyEffect();
    }
}


