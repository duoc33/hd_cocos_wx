import { _decorator, AudioClip, AudioSource, Component, instantiate, isValid, Node, Prefab } from 'cc';
import { Emmiter } from '../Emmite/Emmiter';
const { ccclass, property } = _decorator;

@ccclass('MusicController')
export class MusicController extends Component {
    static instance : MusicController = null;

    @property({type : Prefab})
    public monster_death : Prefab;
    @property({type : Prefab})
    public monster_attack : Prefab;

    protected onLoad(): void {
        MusicController.instance = this;
    }

    protected start(): void {
        this.audio = this.getComponent(AudioSource);
    }


    private sfxNodes : AudioSource[] = [];
    private audio : AudioSource = null;

    private check(){
        if((!this.audio.playing)){
            this.audio.play();
        }
        if(this.sfxNodes === null || this.sfxNodes.length === 0) return;
        for (let index = this.sfxNodes.length-1; index >=0 ; index--) {
            let ad = this.sfxNodes[index];
            if(!ad.playing){
                ad.node.destroy();
                this.sfxNodes.splice(index,1);
            }
        }
    }
    public PlayDeath(){
        this.create(this.monster_death);
    }

    public PlayAttack(){
        this.create(this.monster_attack);
    }

    private clear(){
        for (let element of this.sfxNodes) {
            if(element && isValid(element,true)){
                element.node.destroy();
            }
        }
    }

    private create(m : Prefab){
        let node = instantiate(m);
        node.setParent(this.node);
        this.sfxNodes.push(node.getComponent(AudioSource));
    }

    private

    protected update(dt: number): void {
        this.check();
    }   
    protected onDestroy(): void {
        this.clear();
    }
}


