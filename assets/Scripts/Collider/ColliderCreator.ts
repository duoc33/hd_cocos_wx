import { _decorator, BoxCollider2D, Collider2D, Component, ERigidBody2DType, Node, RigidBody, RigidBody2D, Size, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

export enum ColliderTag
{
    slot = 0,
    tower = 1,
    monster = 2,
    bullet = 3,
    any = 4
}

export class ColliderCreator{
    public static SetLayerCollider(node : Node , baseSize : Vec2 , layer: number ,interval : number , tag : ColliderTag = ColliderTag.slot) : BoxCollider2D
    {
        // 172 171
        let collider = node.getComponent(BoxCollider2D);
        if(!collider)
        { 
            collider =node.addComponent(BoxCollider2D);
        }
        
        collider.size =new Size(baseSize.x, baseSize.y + layer * interval);

        collider.offset = new Vec2(0, layer * interval / 2);

        collider.tag = tag;

        collider.apply();

        return collider;
    }
}


