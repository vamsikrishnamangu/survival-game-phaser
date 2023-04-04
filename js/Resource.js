import MatterEntity from "./MatterEntity.js";

export default class Resource extends MatterEntity {
    static preload(scene){
        scene.load.atlas('resources','assets/images/resources.png','assets/images/resources_atlas.json')
        scene.load.audio('tree','assets/audio/tree.mp3'); // importing audio for rock bush and tree
        scene.load.audio('rock','assets/audio/rock.mp3');
        scene.load.audio('bush','assets/audio/bush.mp3');
        scene.load.audio('pickup','assets/audio/pickup.mp3');
    }

    constructor(data){
        let {scene,resource} = data;
        //super(scene.matter.world,resource.x,resource.y,'resources',resource.type);
        let drops = JSON.parse(resource.properties.find(p=>p.name=='drops').value);
        //let name = resource.properties.find(p=>p.name==='type').value;
        let depth = resource.properties.find(p=>p.name=='depth'); // don't specify .value for depth
        //let depth = resource.properties.find(p=>p.name === 'depth').value;
        //console.log(depth);
        super({scene,x:resource.x,y:resource.y,texture:'resources',frame:resource.type,drops,depth,health:5,name:resource.name});
        console.log(resource.name);
        let yOrigin = resource.properties.find(p=>p.name == 'yOrigin').value;
        /* the below lines are added in MatterEntity*/
        // this.sound=this.scene.sound.add(this.name); // add sound to the respected resource
        // this.x += this.width/2;
        // this.y -= this.height/2;
        this.y = this.y + this.height * (yOrigin - 0.5);
        const {Bodies} = Phaser.Physics.Matter.Matter;
        var circleCollider = Bodies.circle(this.x,this.y,20,{isSensor:false,label:'collider'}); // radius for resources
        this.setExistingBody(circleCollider);
        this.setStatic(true); //making resource to static
        this.setOrigin(0.5,yOrigin);
        this.setDepth(100);
    }

}