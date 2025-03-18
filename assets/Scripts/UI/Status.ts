import { _decorator, Color, Component, Label, Node, Sprite, Tween, Vec3 } from 'cc';
import { EventCenter, EventName } from '../Event/EventCenter';
const { ccclass, property } = _decorator;

@ccclass('Status')
export class Status extends Component {
    @property({type : Node})
    damageTip : Node = null;

    @property
    public initCoins : number = 50;
    @property
    public intiLife : number = 5;

    @property({type : Label})
    public lifeLabel : Label = null;
    @property({type : Label})
    public coinsLabel : Label = null;

    private coins : number = 0;
    private life : number = 0;

    get Coins(): number {
        return this.coins;
    }

    private damageTweenDuration:number = 0.3;
    private damageTween : Tween = null;
    protected start(): void {
        this.coins = this.initCoins;
        this.life = this.intiLife;
        this.coinsLabel.string = this.coins.toString();
        this.lifeLabel.string = this.life.toString();
        
        this.damageTween = new Tween();
        this.damageTween.target(this.damageTip.getComponent(Sprite)).
        to(this.damageTweenDuration ,{color :new Color(255,0,0,255) }).
        to(this.damageTweenDuration ,{color :new Color(255,0,0,0) }).union(); 

        EventCenter.instance.on(EventName.on_player_be_damage, this.SubLife, this);
    }
    protected onDestroy(): void {
        EventCenter.instance.off(EventName.on_player_be_damage, this.SubLife, this);
    }

    private SubLife()
    {
        console.log(this.life);
        this.damageTween.start();
        this.life -= 1;
        
        if(this.life <= 0)
        {
            this.life = 0;
            this.lifeLabel.string = this.life.toString();
            EventCenter.instance.emit(EventName.game_over);
            return;
        }
        this.lifeLabel.string = this.life.toString();
    }

    public AddCoins(add : number)
    {
        this.coins += add;
        this.coinsLabel.string = this.coins.toString();
    }

    public SubCoins(sub : number) : boolean
    {
        if(this.coins >= sub)
        { 
            this.coins -= sub;
            this.coinsLabel.string = this.coins.toString();
            return true;
        }
        return false;
    }

}


