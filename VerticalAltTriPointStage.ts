const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
class VerticalAltTriPointStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    vatp : LinkedVATP = new LinkedVATP()
    animator : Animator = new Animator()

    constructor() {
        this.initCanvas()
    }

    private initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.vatp.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.vatp.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.vatp.update(() => {
                        this.animator.stop()
                    })
                })
            })
        }
    }

    static init() {
        const stage : VerticalAltTriPointStage = new VerticalAltTriPointStage()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    prevScale : number = 0
    dir : number = 0

    update(cb : Function) {
        this.scale += this.dir * 0.05
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    interval : number
    animated : boolean = false

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                cb()
            }, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class VATPNode {
    prev : VATPNode
    next : VATPNode
    state : State = new State()
    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new VATPNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        const hGap = h / nodes
        const size = hGap/3
        const factor = (1 - 2 * (this.i % 2))
        const sc1 = Math.min(0.5, this.state.scale) * 2
        const sc2 = Math.min(0.5, Math.max(0, this.state.scale - 0.5)) * 2
        context.fillStyle = 'white'
        context.strokeStyle = 'white'
        context.lineWidth = hGap/15
        context.lineCap = 'round'
        context.save()
        context.translate(w/2 - hGap/2 * factor, hGap * this.i + hGap/2)
        context.beginPath()
        context.arc(hGap * factor * sc2, hGap * sc2, size/2, 0, 2 * Math.PI)
        context.fill()
        context.beginPath()
        context.moveTo(hGap * factor * sc2, hGap * sc2)
        context.lineTo(hGap * factor * sc1, hGap * sc1)
        context.stroke()
        context.restore()
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : VATPNode {
        var curr : VATPNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedVATP {
    curr : VATPNode = new VATPNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
