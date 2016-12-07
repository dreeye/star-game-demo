cc.Class({
    extends: cc.Component,

    properties: {
        radius: {
            default: 0,
            displayName: "得分距离",
            tooltip: "星星和怪物之间小于此距离，视为获得星星", 
        }, 
        getStarAudio: {
            default: null,
            url: cc.AudioClip,
            displayName: "得分距离",
            tooltip: "星星和怪物之间小于此距离，视为获得星星", 
        }, 
        //game组件
        _gameNode : null,
        // 地面的Y轴坐标
        _groundY : null,
        // 怪物跳跃高度
        _monsterJumpHeight : null,
        // 星星随机出现的X坐标
        _starX : null, 
        // 星星随机出现的Y坐标
        _starY : null,
    },

    // Game组件中生成Star节点后调用的初始化函数，同时把Game组件实例也传递过来让Star调用
    init: function (gameNode) {
        this._gameNode = gameNode;
    },


    // 随机生成一个星星的位置
    starPosition: function () {
        this._groundY = this._gameNode.groundNode.groundY();
        this._monsterJumpHeight = this._gameNode.monsterNode.jumpHeight;
        //使用小于1的随机数（含负数），用来限制屏幕宽度 
        this._starX = cc.randomMinus1To1() * this._gameNode.node.width/2;
        // 星星必须出现在地面以上，groundY是基准，然后加上小于怪物跳跃的高度即可，但因为星星锚点在中心，故另外加点高度 
        this._starY = this._groundY + this._monsterJumpHeight * cc.random0To1() + 30;

        /*cc.log('randomMinus1To1=' + cc.randomMinus1To1());
        cc.log('starY=' + this._starY);
        cc.log('groundY=' + this._monsterJumpHeight);
        cc.log('jump height=' + this._monsterJumpHeight);*/
        return cc.p(this._starX, this._starY);
    },

    // 星星与怪物的距离
    starToMonsterDistance: function () {
        // 根据两点位置计算两点之间距离
        var dist = cc.pDistance(this.node.position, this._gameNode.monsterNode.getCenterPos());
        return dist;
    },

    // called every frame, uncomment this function to activate update callback
    updateStar: function (dt) {
        //cc.log(this.starToMonsterDistance());
        // 怪物碰到星星，销毁星星（放入对象池）并从新生成星星
        if(this.starToMonsterDistance() < this.radius){
            this.destroyStar();
            this._gameNode.newStar();
        }
    },
    destroyStar: function () {
        this._gameNode._starPool.put(this.node);
        cc.audioEngine.playEffect(this.getStarAudio, false);
    },
});
