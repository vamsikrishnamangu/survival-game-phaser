import MainScene from "./MainScene.js";

const config={
    width:512, 
    height:512,
    backgroundColor:'#999999',
    type:Phaser.AUTO, //canvas to webGL
    parent:"survival-game", // id of div element
    scene:[MainScene], // specifiying main scene
    scale:{
        zoom:2,
    },
    physics:{
        default:"matter",
        arcade:{
            debug:true,
            gravity:{
                y:1000
            }
        },
        matter:{
            debug:false,
            gravity:{
                y:0 //assigning value falls 
            }
        }
    },
    plugins:{
        scene:[
            {
                plugin:PhaserMatterCollisionPlugin.default, // set default to remove error for addOnCollideStart()
                key:'matterCollision',
                mapping:'matterCollision'
            }
        ]
    }
}

new Phaser.Game(config); // new phaser instance