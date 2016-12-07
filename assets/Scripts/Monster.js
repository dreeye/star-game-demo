const Ground = require('Ground');

cc.Class({
    extends: cc.Component,

    properties: {

        jumpDuration: {
            default: 0,
            displayName: "跳跃完成时间",
            tooltip: "跳跃一次所用的时间", 
        }, 
        jumpHeight: {
            default: 0,
            displayName: "跳跃高度",
            tooltip: "", 
        }, 
        acc: {
            default: 0,
            displayName: "加速度",
            tooltip: "", 
        }, 
        jumpAudio: {
            default: null,
            url: cc.AudioClip,
            displayName: "跳跃声音",
            tooltip: "嘟嘟嘟", 
        },
        groundNode: {
            default: null,
            type: Ground,
            displayName: "地面Node",
            tooltip: "继承ground,获得地面的高度", 
        },
        
        // 移动方向
        _accLeft : false,
        _accRight : false,
        // 移动速度
        _speed : 0,
        // 左右边界position
        _limitLeft : 0,
        _limitRight : 0,


    },


    init: function () {
        // 监听keyBoard
        this.keyBoard();
        // 边界
        this._limitLeft = -this.node.parent.width/2 + 30;
        this._limitRight = this.node.parent.width/2 - 30;
        
    },
    updateMonster: function (dt) {
        //根据方向实时更新速度与移动距离
        // 按住方向键accLeft或accRight总为true，speed会不断累加，速度越来越快
        if(this._accLeft){
            this._speed -= this.acc * dt;

        } 
        else if(this._accRight) {
            this._speed += this.acc * dt;
        }

        // 累加移动
        this.node.x += this._speed * dt;

        // 不让怪物出边界
        if (this.node.x >= this._limitRight) {
            this.node.x = this._limitRight;
            this._speed = 0;

        }else if (this.node.x <= this._limitLeft){
            this.node.x = this._limitLeft;
            this._speed = 0;
        }
    },
 
    startGo: function () {
        // 让怪物移动到地面上
        this.node.y = this.groundNode.groundY();
        cc.log(this.node.y);
        // 开始跳跃
        this.node.runAction(this.jumpAction());
    },

    // 跳跃逻辑
    jumpAction: function() {
        // 跳跃上升
        var jumpUp = cc.moveBy(this.jumpDuration, cc.p(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        var jumpDown = cc.moveBy(this.jumpDuration, cc.p(0, -this.jumpHeight)).easing(cc.easeCubicActionOut());
        // return cc.repeatForever(cc.sequence(squash, stretch, jumpUp, scaleBack, jumpDown, callback));
        // 添加一个回调函数，用于在动作结束时调用我们定义的其他方法
        var callback = cc.callFunc(this.jumpSound, this);
        return cc.repeatForever(cc.sequence(jumpUp, jumpDown, callback));

    },

    // 调用声音引擎播放声音
    jumpSound: function () {
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },
    // 获取怪物的中心坐标，锚点在脚下，所以y轴需要加上一半height才能到中心
     getCenterPos: function () {
        var centerPos = cc.p(this.node.x, this.node.y + this.node.height/2);
        return centerPos;
    },

    // 键盘和触摸控制 
    keyBoard: function () {
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            // set a flag when key pressed
            onKeyPressed: function(keyCode, event) {
                switch(keyCode) {
                    case cc.KEY.a:
                    case cc.KEY.left:
                        self._accLeft = true;
                        self._accRight = false;
                        break;
                    case cc.KEY.d:
                    case cc.KEY.right:
                        self._accLeft = false;
                        self._accRight = true;
                        break;
                }
            },
            // unset a flag when key released
            onKeyReleased: function(keyCode, event) {
                switch(keyCode) {
                    case cc.KEY.a:
                    case cc.KEY.left:
                        self._accLeft = false;
                        break;
                    case cc.KEY.d:
                    case cc.KEY.right:
                        self._accRight = false;
                        break;
                }
            }
        }, self.node);
        // touch input
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function(touch, event) {
                var touchLoc = touch.getLocation();
                if (touchLoc.x >= cc.winSize.width/2) {
                    self._accLeft = false;
                    self._accRight = true;
                } else {
                    self._accLeft = true;
                    self._accRight = false;
                }
                // don't capture the event
                return true;
            },
            onTouchEnded: function(touch, event) {
                self._accLeft = false;
                self._accRight = false;
            }
        }, self.node);

    },  
    

});
