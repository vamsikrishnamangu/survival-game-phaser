export default class DropItem extends Phaser.Physics.Matter.Sprite{
    constructor(data){
        let {scene,x,y,frame} = data;
        super(scene.matter.world,x,y,'items',frame);
        this.scene.add.existing(this);
        const {Bodies} = Phaser.Physics.Matter.Matter;
        var circleCollider = Bodies.circle(this.x, this.y,10,{isSensor:false, label:'collider'});// sensor false as it is collider
        this.setExistingBody(circleCollider);
        this.setFrictionAir(1); // to avoid flying
        this.setScale(0.5) // to reduce size of the object
        this.sound = this.scene.sound.add('pickup'); // creating sound on picking up drops
    }

    pickup = () =>{
        this.destroy();
        this.sound.play();
        return true;
    }
}