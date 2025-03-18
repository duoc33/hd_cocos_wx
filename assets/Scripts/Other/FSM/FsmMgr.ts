import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/** 打断优先级 */
export enum E_FsmInterruptPriority {
    Always,
    Self,
    Force,
    Death,
    Never = Number.MAX_SAFE_INTEGER,
}

/** 抽象的有限状态机 */
export abstract class ActorFSM<T extends Component> {
    private _interruptPriorityType : E_FsmInterruptPriority = E_FsmInterruptPriority.Always;

    constructor(interruptPriority : E_FsmInterruptPriority = E_FsmInterruptPriority.Always) 
    {
        this._interruptPriorityType = interruptPriority;
    }
    
    get interruptPriorityType(): E_FsmInterruptPriority {
        return this._interruptPriorityType;
    }
    set interruptPriorityType(value: E_FsmInterruptPriority) {
        this._interruptPriorityType = value;
    }

    abstract start(mgr: FsmMgr<T>): void;

    abstract update(mgr: FsmMgr<T>, deltaTime: number): boolean;

    abstract onDestroy(mgr: FsmMgr<T>) : void;
}
/** 抽象的行为指令 */
export abstract class ActorOrder<T extends Component> {
    /** 返回 true 表示本次指令执行完毕 */
    abstract update(mgr: FsmMgr<T>): boolean;

    /** 指令销毁时调用 */
    abstract onDestroy(mgr: FsmMgr<T>): void ;
}


@ccclass('FsmMgr')
export class FsmMgr<T extends Component> extends Component {
    /** 当前 FSM 状态（仅用于调试显示） */
    @property({ readonly: true })
    state: string = "";

    protected _fsm: ActorFSM<T> | null = null;
    /** 存储行为指令的队列 */
    protected orders: ActorOrder<T>[] = [];
    /** 获取或设置当前 FSM */
    get FSM(): ActorFSM<T> | null {
        return this._fsm;
    }
    set FSM(value: ActorFSM<T> | null) {
        this.changeFSM(value);
    }

    /**
    * 尝试切换 FSM
    * @param value 新的 FSM
    * @param interruptPriority 优先级，默认 Always
    */
    changeFSM(value: ActorFSM<T>, interruptPriority: E_FsmInterruptPriority = E_FsmInterruptPriority.Always): boolean {
        if (this._fsm == null || this._fsm.interruptPriorityType <= interruptPriority) {
            if (this._fsm) {
                this._fsm.onDestroy(this);
            }
            this._fsm = value;
            this._fsm.start(this);
            return true;
        }
        return false;
    }
    /** 添加行为指令 */
    addOrder(order: ActorOrder<T>): void {
        this.orders.push(order);
        if (this.orders.length === 1 && this._fsm == null) {
            this.updateOrder();
        }
    }
    setOrder(order: ActorOrder<T>): void {
        this.orders = [];
        this.orders.push(order);
        if (this._fsm == null || this._fsm.interruptPriorityType <= E_FsmInterruptPriority.Self) {
            this.removeCurFsm();
            this.updateOrder();
        }
    }
    /** 移除当前 FSM */
    private removeCurFsm(): void {
        if (this._fsm) {
            this._fsm.onDestroy(this);
            this._fsm = null;
        }
    }
    /** 内部更新指令，如果指令执行完毕则切换下一个 */
    private updateOrder(): void {
        if (this.orders.length > 0 && this.orders[0].update(this)) {
            this.nextOrder();
        }
    }
    /** 移除队列中已执行完毕的指令 */
    private nextOrder(): void {
        if (this.orders.length === 0) return;
        const order = this.orders.shift();
        if (order) {
            order.onDestroy(this);
        }
        if (this._fsm == null) {
            this.updateOrder();
        }
    }

    update(deltaTime: number) {
        if (this._fsm == null) {
            this.updateOrder();
        }

        if (this._fsm && this._fsm.update(this, deltaTime)) {
            this.removeCurFsm();
        }

        if (this._fsm) {
            // 利用构造函数名作为状态标识
            this.state = this._fsm.constructor.name;
        }
    }

    protected onDestroy(): void {
        this.clear();
    }
    /** 清理 FSM 以及所有指令 */
    private clear(): void {
        this.removeCurFsm();
        while (this.orders.length > 0) {
            const order = this.orders.shift();
            if (order) {
                order.onDestroy(this);
            }
        }
        this.orders = [];
    }
}


