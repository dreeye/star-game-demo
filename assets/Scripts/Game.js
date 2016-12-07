//加载脚本并在properties type里指定，即可调用这些组件的方法
const Monster = require('Monster');
const Ground = require('Ground');
//const Star = require('Star');

cc.Class({
    extends: cc.Component,

    properties: {
        btnPlayNode: {
            default: null,
            type: cc.Node,
            displayName: "btnPlay",
            tooltip: "继承btnPlay，使它可以点击后消失", 
        }, 
        starMaxDuration: {
            default: 3,
            displayName: "捕获星星的最大时限",
            tooltip: "捕获星星的最大时限", 
        }, 
        // 下面两个type是定义他们的组件，只能把有相应组件的Node放进来才行，没有这些组件的Node拖不进来
        monsterNode: {
            default: null,
            type: Monster,
            displayName: "monster",
            tooltip: "继承monster,让怪物运动", 
        }, 
        groundNode: {
            default: null,
            type: Ground,
            displayName: "ground",
            tooltip: "继承ground", 
        }, 
        starPrefab: {
            default: null,
            type: cc.Prefab,
            displayName: "starPrefab",
            tooltip: "", 
        }, 
        // 初始化的星星节点
        _newStar : null,
        // star的组件
        _starNode : null,
        // star组件对象池
        _starPool : null,
        // 计时器
        _timer : 0,
        // 游戏是否开始，用来阻止场景加载后立刻计时
        _isRunning : false, 
    },

    onLoad: function () {
        // init方法代替onload和start
        this.groundNode.init();
        this.monsterNode.init();
        
        this._starPool = new cc.NodePool('Star');
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        // 没有点击开始游戏，就不执行下面的代码
        if(!this._isRunning) return;

        this.monsterNode.updateMonster(dt);
        if (this._starNode != null) {
            this._starNode.updateStar(dt);
        }
        // 超时游戏结束
        if(this._timer > this.starMaxDuration) {
            this.gameOver();
        }
        else
        {
            this._timer += dt;
        }
        
        
    },

    // 点击btnPlay后会调用这个方法
    startGame: function () {
        this._isRunning = true;
        // btnPlay按钮消失
        this.btnPlayNode.active = false;   
        // 怪物开始移动
        this.monsterNode.startGo();
        // 出现星星
        this.newStar();
    },

    newStar: function() {
        // 初始化starPrefab
        if (this._starPool.size()>0) {
            //cc.log('StarPool size='+this._starPool.size());
            this._newStar = this._starPool.get(this);
        } else {
            this._newStar = cc.instantiate(this.starPrefab);
        }
        // 将新增的节点添加到 Canvas 节点下面
        this.node.addChild(this._newStar);
        // 调用Star组件内方法，并把Game组件作为参数传入Star组件，注意，调用prefab方法不需要require('Star')
        this._starNode = this._newStar.getComponent('Star');
        this._starNode.init(this);
        this._timer = 0;
        // 随机出现星星
        this._newStar.setPosition(this._starNode.starPosition());
    }, 

    gameOver: function() {
        // 停止并且移除所有正在运行的动作列表。
        this.monsterNode.node.stopAllActions();
        this.monsterNode.enabled = false;
        this.btnPlayNode.active = true;   
        this._isRunning = false;
        this._newStar.destroy();
    },
});
