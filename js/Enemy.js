import MatterEntity from "./MatterEntity.js";

export default class Enemy extends MatterEntity{

    static preload(scene){
        scene.load.atlas('enemies','assets/images/enemies.png','assets/images/enemies_atlas.json');
        scene.load.animation('enemies_anim','assets/images/enemies_anim.json');
        scene.load.audio('forestguardian','assets/audio/bear.mp3');
        scene.load.audio('gnollbrute','assets/audio/wolf.mp3');
        scene.load.audio('ent','assets/audio/ent.mp3');
    }
    constructor(data){
        let {scene,enemy}=data;
        let drops = JSON.parse(enemy.properties.find(p=>p.name=='drops').value);
        let health= enemy.properties.find(p=>p.name=='health').value;
        super({scene,x:enemy.x,y:enemy.y,texture:'enemies',frame:`${enemy.name}_idle_1`,drops,health,name:enemy.name});

        /**To create circle around enemies acts as boundary to make them detect objects when it is near to it */
        const {Body,Bodies} = Phaser.Physics.Matter.Matter;
        var enemyCollider = Bodies.circle(this.x,this.y,12,{isSensor:false,label:'enemyCollider'}); //green color acts a circular collider
        var enemySensor = Bodies.circle(this.x,this.y,60,{isSensor:true,label:'enemySensor'}); // blue acts as a circular sensor
        const compoundBody = Body.create({
            parts:[enemyCollider,enemySensor],
            frictionAir:0.35,
        });
        this.setExistingBody(compoundBody);
        this.setFixedRotation();
        this.scene.matterCollision.addOnCollideStart({
            objectA:[enemySensor],
            callback:other=>{if(other.gameObjectB && other.gameObjectB.name =='player') this.attacking=other.gameObjectB;},
            context:this.scene,
        });
    }

    attack=(target)=>{
        if(target.dead || this.dead){
            clearInterval(this.attackTimer); //clearing attack timer 
            return;
        }
        target.hit(); // otherwise we hit avatar
    }

    update(){
        if(this.dead)return; // if dead then just returns
        if(this.attacking){ // else attacking position should be changed
            let direction = this.attacking.position.subtract(this.position); // changing the vector for distance
            if(direction.length()>24){  //chaning position
                let v = direction.normalize();
                this.setVelocityX(direction.x);
                this.setVelocityY(direction.y); 
                if(this.attackTimer){
                    clearInterval(this.attackTimer); 
                    this.attackTimer=null; //after clearing time we are setting back to null
                }
            }else{
                if(this.attackTimer == null){
                    this.attackTimer =setInterval(this.attack,500,this.attacking); //checks every 1/2 second and sends this.attacking
                }
            }
        }
        this.setFlipX(this.velocity.x < 0); // flip enemy direction according w.r.t avatar
        /** Animation part of enemies */
        if(Math.abs(this.velocity.x)>0.1 || Math.abs(this.velocity.y)>0.1){
            this.anims.play(`${this.name}_walk`,true) //updating walk
        }else{
            this.anims.play(`${this.name}_idle`,true) //updating idle
        }
    }
}