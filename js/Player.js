import MatterEntity from "./MatterEntity.js";

export default class Player extends MatterEntity{
    constructor(data){
        let {scene,x,y,texture,frame}=data;
        super({...data,health:12,drops:[],name:'player'});
        this.touching = [];
        this.setScale(1.25)
        // weapon 
        this.spriteWeapon = new Phaser.GameObjects.Sprite(this.scene,0,0,'items',162); 
        // shield
        this.spriteShield = new Phaser.GameObjects.Sprite(this.scene,0,0,'items',96);
        // hat
        // this.spriteHat = new Phaser.GameObjects.Sprite(this.scene,0,0,'items',113);
        // shoes
        // this.spriteShoes = new Phaser.GameObjects.Sprite(this.scene,0,0,'items',131);
        // scaling size of shield
        this.spriteShield.setScale(0.8);
        this.spriteShield.setOrigin(1.2,0.65);
        this.scene.add.existing(this.spriteShield);

        // scaling size of Shoes
        // this.spriteShoes.setScale(0.5);
        // this.spriteShoes.setOrigin(0.6,0);
        // this.scene.add.existing(this.spriteShoes);
        // this.spriteShoes.setDepth(10);

        // scaling size of Hat
        // this.spriteHat.setScale(0.7);
        // this.spriteHat.setOrigin(0.5,0.75);
        // this.scene.add.existing(this.spriteHat);
        // this.spriteHat.setDepth(10); // adding depth makes the accessories first 

        // scaling size of weapon
        this.spriteWeapon.setScale(0.9);
        this.spriteWeapon.setOrigin(0.25,0.75); //position of weapon in avatar hand
        this.scene.add.existing(this.spriteWeapon);
        /**To create circle around avatar acts as boundary to make them detect objects when it is near to it */
        const {Body,Bodies} = Phaser.Physics.Matter.Matter;
        var playerCollider = Bodies.circle(this.x,this.y,12,{isSensor:false,label:'playerCollider'}); //green color acts a circular collider
        var playerSensor = Bodies.circle(this.x,this.y,24,{isSensor:true,label:'playerSensor'}); // blue acts as a circular sensor
        const compoundBody = Body.create({
            parts:[playerCollider,playerSensor],
            frictionAir:0.35,
        });
        this.setExistingBody(compoundBody);
        this.setFixedRotation();
        this.CreateMiningCollisions(playerSensor);
        this.CreatePickupCollisions(playerCollider);
        // flipping person with respect to mouse movement
        this.scene.input.on('pointermove',pointer=>{if(!this.dead)this.setFlipX(pointer.worldX < this.x)});
    }

    static preload(scene){
        scene.load.atlas('female','assets/images/female.png','assets/images/female_atlas.json'); //images, json file load
        scene.load.animation('female','assets/images/female_anim.json'); //animation json file load
        scene.load.spritesheet('items','assets/images/items.png',{frameWidth:32, frameHeight:32}); //loading items like sword,shield etc..,
        scene.load.audio('player','assets/audio/player.mp3'); // adding sound to player death
       // scene.load.plugin('rexalphamaskimageplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexalphamaskimageplugin.min.js', true);

    }
    /** Specified in matter entity */
    // get velocity(){
    //     return this.body.velocity;
    // }

    onDeath=()=>{
        this.anims.stop();
        this.setTexture('items',0); //getting skeleton on death
        this.setOrigin(0.5);
        this.spriteWeapon.destroy();
    }; // death for avatar


    update(){
        if(this.dead) return;
        this.anims.play('female_walk',true) //updating walk
        const speed=2.5;
        let playerVelocity = new Phaser.Math.Vector2(); //2 dimensional vector

        if(this.inputKeys.left.isDown){   // if left arrow is pressed then it moves left
            playerVelocity.x=-1;
        }else if(this.inputKeys.right.isDown){ // if Right arrow is pressed then it moves right
            playerVelocity.x=1;
        }
        if(this.inputKeys.up.isDown){   // if up arrow is pressed then it moves up
            playerVelocity.y=-1;
        }else if(this.inputKeys.down.isDown){ // if down arrow is pressed then it moves down
            playerVelocity.y=1;
        }
        
        playerVelocity.normalize(); //fixes diagonal speed problem normalize velocity vecotr before we scale it
        playerVelocity.scale(speed);

        this.setVelocity(playerVelocity.x,playerVelocity.y)

        if(Math.abs(this.velocity.x)>0.1 || Math.abs(this.velocity.y)>0.1){
            this.anims.play('female_walk',true) //updating walk
        }else{
            this.anims.play('female_idle',true) //updating idle
        }
        //setting weapon position to the position of player
        this.spriteWeapon.setPosition(this.x,this.y); 
        //calling weapon rotate
        this.weaponRotate();

        // setting shield position to the position of player
        this.spriteShield.setPosition(this.x,this.y);

        // setting Hat position to the position of player
        // this.spriteHat.setPosition(this.x,this.y);

        // setting Shoes position to the position of player
        // this.spriteShoes.setPosition(this.x,this.y);


    }
    
    weaponRotate(){
        // we use mouse to strike
        let pointer = this.scene.input.activePointer;
        // setting motion of weapon on click
        if(pointer.isDown){
            this.weaponRotation += 6;
        }else{
            this.weaponRotation = 0;
        }
        // making arc rotation not circular
        if(this.weaponRotation > 100){
            this.whackStuff();
            this.weaponRotation=0;
        }
        // flipping weapon w.r.t mouse pointer
        if(this.flipX){
            this.spriteWeapon.setAngle(-this.weaponRotation - 90);
            // this.spriteHat.setAngle(2);
            // this.spriteShoes.setAngle(2);
            this.spriteShield.setAngle(180);
        }else{
            this.spriteWeapon.setAngle(this.weaponRotation);
            // this.spriteHat.setAngle(-5);
            // this.spriteShoes.setAngle(-2);
            this.spriteShield.setAngle();
        }
    }

    CreateMiningCollisions(playerSensor){
        this.scene.matterCollision.addOnCollideStart ({
            objectA:[playerSensor],
            callback: other=>{
                if(other.bodyB.isSensor)return; // Resources have collision not sensor
                this.touching.push(other.gameObjectB); // detects nearby object in sensor range
                console.log(this.touching.length,other.gameObjectB.name);
            },
            context: this.scene,
        });

        this.scene.matterCollision.addOnCollideEnd({
            objectA:[playerSensor],
            callback:other =>{
                this.touching = this.touching.filter(gameObject => gameObject != other.gameObjectB);// sesnor end
                console.log(this.touching.length);
            },
            context:this.scene,
        })
    }
    CreatePickupCollisions(playerCollider){
        this.scene.matterCollision.addOnCollideStart ({
            objectA:[playerCollider],
            callback: other=>{
                if(other.gameObjectB && other.gameObjectB.pickup) other.gameObjectB.pickup();  // picking up
            },
            context: this.scene,
        });

        this.scene.matterCollision.addOnCollideActive({ // we dont need end collider
            objectA:[playerCollider],
            callback:other =>{
                if(other.gameObjectB && other.gameObjectB.pickup) other.gameObjectB.pickup();
            },
            context:this.scene,
        })
    }

    whackStuff(){
        this.touching = this.touching.filter(gameObject =>gameObject && gameObject.hit && !gameObject.dead);
        this.touching.forEach(gameObject =>{
            gameObject.hit(); // hit method
            if (gameObject.dead) gameObject.destroy(); //dead property
        })
    }
}