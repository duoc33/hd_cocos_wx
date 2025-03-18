
/**
 * 事件回调接口，用于记录回调函数以及对应的 this 指针（可选）
 */
export enum EventName
{
    game_start,
    game_over,
    on_reselcet_monster,
    on_create_tower,
    on_player_be_damage,
    on_monster_death,
    on_monster_be_damage,
}

export interface IEventCallback {
    callback: Function;
    target?: any;
}

export class EventCenter {
    // 存储事件名与对应回调函数列表的映射
    private eventMap: Map<EventName, IEventCallback[]> = new Map();
    private static _instance: EventCenter | null = null;
    private constructor() { }
    public static get instance(): EventCenter {
        if (!this._instance) {
            this._instance = new EventCenter();
        }
        return this._instance;
    }
    /**
     * 注册事件
     * @param eventName 事件名称
     * @param callback  回调函数
     * @param target    回调函数所属对象（可选）
     */
    public on(eventName: EventName, callback: Function, target?: any): void {
        if (!this.eventMap.has(eventName)) {
            this.eventMap.set(eventName, []);
        }
        const list = this.eventMap.get(eventName)!;
        // 为避免重复注册，可以根据需求做检查
        list.push({ callback, target });
    }
    /**
     * 注销事件
     * @param eventName 事件名称
     * @param callback  回调函数
     * @param target    回调函数所属对象（可选）
     */
    public off(eventName: EventName, callback: Function, target?: any): void {
        const list = this.eventMap.get(eventName);
        if (list) {
            // 从后往前遍历删除
            for (let i = list.length - 1; i >= 0; i--) {
                if (list[i].callback === callback && list[i].target === target) {
                    list.splice(i, 1);
                }
            }
            // 如果该事件没有回调，则删除该键
            if (list.length === 0) {
                this.eventMap.delete(eventName);
            }
        }
    }
    /**
     * 派发事件
     * @param eventName 事件名称
     * @param args      参数数组，传递给回调函数
     */
    public emit(eventName: EventName, ...args: any[]): void {
        const list = this.eventMap.get(eventName);
        if (list) {
            // 克隆数组，防止回调中修改原数组导致问题
            const callbacks = list.slice();
            for (const listener of callbacks) {
                listener.callback.apply(listener.target, args);
            }
        }
    }

    /**
     * 移除某个事件的所有回调
     * @param eventName 事件名称
     */
    public removeAll(eventName: EventName): void {
        if (this.eventMap.has(eventName)) {
            this.eventMap.delete(eventName);
        }
    }

    /**
     * 清空所有事件
     */
    public clearAll(): void {
        this.eventMap.clear();
    }
}


