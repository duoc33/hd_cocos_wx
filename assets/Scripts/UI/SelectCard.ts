import { _decorator, Button, Color, Component, Node, RichText, Tween, Vec3 } from 'cc';
import { Status } from './Status';
import { EventCenter, EventName } from '../Event/EventCenter';
import { WeaponType } from '../Weapon/WeaponConfig';
import { MonsterActor } from '../MonsterSpawn/MonsterActor';
import { MapMgr } from '../Map/MapMgr';
const { ccclass, property } = _decorator;

@ccclass('SelectCard')
export class SelectCard extends Component {

    

    @property({type: Status})
    public status : Status = null;

    @property
    public AkPrice : number = 30;
    @property
    public UziPrice : number = 35;

    @property({type: Node})
    public AKCard : Node = null;
    @property({type: Node})
    public UziCard : Node = null;

    private AKCardText : RichText = null;
    private UziCardText : RichText = null;

    @property({type : Node})
    public TeachHand : Node = null;
    @property({type : Node})
    public TargetNode : Node = null;
    @property
    public TeachDuration : number = 1;
    private TeachTween : Tween = null;
    protected start(): void {
        this.AKCardText = this.AKCard.getComponentInChildren(RichText);
        this.UziCardText = this.UziCard.getComponentInChildren(RichText);
        
        this.AKCardText.string = this.AkPrice.toString();
        this.UziCardText.string = this.UziPrice.toString();

        this.onCoinsValueChanged(this.status.initCoins);
        
        EventCenter.instance.on(EventName.on_monster_death, this.onCoinsAdd, this);

        const startPos = this.AKCard.getWorldPosition();
        const endPos = this.TargetNode.getWorldPosition();
        this.TeachHand.setWorldPosition(startPos);
        this.TeachTween = new Tween();
        this.TeachTween.target(this.TeachHand.worldPosition)
        .to(this.TeachDuration, endPos , {
            onStart : ()=>{
                this.TeachHand.setWorldPosition(startPos);
            },
            onUpdate : (value)=>{
                this.TeachHand.setWorldPosition(value);
            },
            onComplete : ()=>{  
                this.TeachHand.setWorldPosition(startPos);
            }
        }).repeat(4).call(()=>{
            this.TeachHand.active = false;
        }).start();
    }
    protected onDestroy(): void {
        this.TeachTween.destroySelf();
        EventCenter.instance.off(EventName.on_monster_death, this.onCoinsAdd, this);
    }

    public Buy(weaponType: WeaponType) : boolean
    {
        if(weaponType === WeaponType.AK)
        { 
            return this.BuyAK();
        }
        else if(weaponType === WeaponType.Uzi)
        { 
            return this.BuyUzi();
        }
        return false;
    }

    private BuyAK(): boolean{
        if(this.status.SubCoins(this.AkPrice))
        { 
            this.onCoinsValueChanged(this.status.Coins);
            return true;
        }
        return false;
    }

    private BuyUzi() : boolean {
        if(this.status.SubCoins(this.UziPrice))
        { 
            this.onCoinsValueChanged(this.status.Coins);
            return true;
        }
        return false;
    }

    private onCoinsAdd(coins: number , monster : MonsterActor) 
    {
        this.status.AddCoins(coins);
        this.onCoinsValueChanged(this.status.Coins);
    }

    private onCoinsValueChanged(coins: number) {
        if (coins >= this.AkPrice) {
            this.AKCardText.fontColor = Color.WHITE;
        }
        else {
            this.AKCardText.fontColor = Color.RED;
        }
        if (coins >= this.UziPrice) {
            this.UziCardText.fontColor = Color.WHITE;
        }
        else {
            this.UziCardText.fontColor = Color.RED;
        }
    }

}


