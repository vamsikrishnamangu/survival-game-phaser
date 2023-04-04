import Enemy from "./Enemy.js";
import Player from "./Player.js";
import Resource from "./Resource.js";

export default class extends Phaser.Scene{
    constructor(){
        super("MainScene");
        this.enemies=[];
    }
    preload(){
        Player.preload(this);
        Resource.preload(this);
        Enemy.preload(this);
        this.load.image('tiles','assets/images/RPG Nature Tileset.png'); // loading tile image
        this.load.tilemapTiledJSON('map','assets/images/map.json'); // loading map.json file
        
    }
    create(){
        const map=this.make.tilemap({key:'map'});
        this.map=map; 
        const tileset = map.addTilesetImage('RPG Nature Tileset','tiles',32,32,0,0);
        const layer1 = map.createLayer('Tile Layer 1',tileset,0,0);  //with only grass and boundary restriction
        const layer2 = map.createLayer('Tile Layer 2',tileset,0,0); // with other additional places

        layer1.setCollisionByProperty({collides:true}); 
        this.matter.world.convertTilemapLayer(layer1);
        this.map.getObjectLayer('Resources').objects.forEach(resource=>new Resource({scene:this,resource})); // importing resource item
        this.map.getObjectLayer('Enemies').objects.forEach(enemy=>this.enemies.push(new Enemy({scene:this,enemy}))); // importing enemy item
        //let bush = new Phaser.Physics.Matter.Sprite(this.matter.world,150,150,'resources','bush'); // importing bush
        this.player=new Player({scene:this,x:200,y:200,texture:'female',frame:'townsfolk_f_idle_1'});
        //let testPlayer = new Player({scene:this,x:100,y:100,texture:'female',frame:'townsfolk_f_idle_1'}); // specifiying x,y as zero and first frame we can find in female_atlas.json file
        this.player.inputKeys=this.input.keyboard.addKeys({
            up:Phaser.Input.Keyboard.KeyCodes.UP,  //assigning keys up down left right
            down:Phaser.Input.Keyboard.KeyCodes.DOWN,
            left:Phaser.Input.Keyboard.KeyCodes.LEFT,
            right:Phaser.Input.Keyboard.KeyCodes.RIGHT,
        })
        let camera = this.cameras.main;
        camera.zoom = 1; // camera zooming on player
        camera.startFollow(this.player);
        camera.setLerp(0.1,0.1); // to have smoother camera start and end movement
        camera.setBounds(0,0,this.game.config.width,this.game.config.height); // setting boundary to the game environment
    }

    update(){
        this.player.update();
        this.enemies.forEach(enemy => enemy.update());
    }
}