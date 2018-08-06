var w = window.innerWidth, h = window.innerHeight;
var nodes = 5;
var VerticalAltTriPointStage = (function () {
    function VerticalAltTriPointStage() {
        this.canvas = document.createElement('canvas');
        this.vatp = new LinkedVATP();
        this.animator = new Animator();
        this.initCanvas();
    }
    VerticalAltTriPointStage.prototype.initCanvas = function () {
        this.canvas.width = w;
        this.canvas.height = h;
        this.context = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    };
    VerticalAltTriPointStage.prototype.render = function () {
        this.context.fillStyle = '#212121';
        this.context.fillRect(0, 0, w, h);
        this.vatp.draw(this.context);
    };
    VerticalAltTriPointStage.prototype.handleTap = function () {
        var _this = this;
        this.canvas.onmousedown = function () {
            _this.vatp.startUpdating(function () {
                _this.animator.start(function () {
                    _this.render();
                    _this.vatp.update(function () {
                        _this.animator.stop();
                        _this.render();
                    });
                });
            });
        };
    };
    VerticalAltTriPointStage.init = function () {
        var stage = new VerticalAltTriPointStage();
        stage.render();
        stage.handleTap();
    };
    return VerticalAltTriPointStage;
})();
var State = (function () {
    function State() {
        this.scale = 0;
        this.prevScale = 0;
        this.dir = 0;
    }
    State.prototype.update = function (cb) {
        this.scale += this.dir * 0.05;
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir;
            this.dir = 0;
            this.prevScale = this.scale;
            cb();
        }
    };
    State.prototype.startUpdating = function (cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale;
            cb();
        }
    };
    return State;
})();
var Animator = (function () {
    function Animator() {
        this.animated = false;
    }
    Animator.prototype.start = function (cb) {
        if (!this.animated) {
            this.animated = true;
            this.interval = setInterval(function () {
                cb();
            }, 50);
        }
    };
    Animator.prototype.stop = function () {
        if (this.animated) {
            this.animated = false;
            clearInterval(this.interval);
        }
    };
    return Animator;
})();
var VATPNode = (function () {
    function VATPNode(i) {
        this.i = i;
        this.state = new State();
        this.addNeighbor();
    }
    VATPNode.prototype.addNeighbor = function () {
        if (this.i < nodes - 1) {
            this.next = new VATPNode(this.i + 1);
            this.next.prev = this;
        }
    };
    VATPNode.prototype.draw = function (context) {
        var hGap = h / nodes;
        var size = hGap / 3;
        var factor = (1 - 2 * (this.i % 2));
        var sc1 = Math.min(0.5, this.state.scale) * 2;
        var sc2 = Math.min(0.5, Math.max(0, this.state.scale - 0.5)) * 2;
        context.fillStyle = 'white';
        context.strokeStyle = 'white';
        context.lineWidth = hGap / 15;
        context.lineCap = 'round';
        context.save();
        context.translate(w / 2 - hGap / 2 * factor, hGap * this.i + hGap / 2);
        context.beginPath();
        context.arc(hGap * factor * sc2, hGap * sc2, size / 2, 0, 2 * Math.PI);
        context.fill();
        context.beginPath();
        context.moveTo(hGap * factor * sc2, hGap * sc2);
        context.lineTo(hGap * factor * sc1, hGap * sc1);
        context.stroke();
        context.restore();
        if (this.next) {
            this.next.draw(context);
        }
    };
    VATPNode.prototype.update = function (cb) {
        this.state.update(cb);
    };
    VATPNode.prototype.startUpdating = function (cb) {
        this.state.startUpdating(cb);
    };
    VATPNode.prototype.getNext = function (dir, cb) {
        var curr = this.prev;
        if (dir == 1) {
            curr = this.next;
        }
        if (curr) {
            return curr;
        }
        cb();
        return this;
    };
    return VATPNode;
})();
var LinkedVATP = (function () {
    function LinkedVATP() {
        this.curr = new VATPNode(0);
        this.dir = 1;
    }
    LinkedVATP.prototype.draw = function (context) {
        this.curr.draw(context);
    };
    LinkedVATP.prototype.update = function (cb) {
        var _this = this;
        this.curr.update(function () {
            _this.curr = _this.curr.getNext(_this.dir, function () {
                _this.dir *= -1;
            });
            cb();
        });
    };
    LinkedVATP.prototype.startUpdating = function (cb) {
        this.curr.startUpdating(cb);
    };
    return LinkedVATP;
})();
