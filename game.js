let safeRoad = [14895, 3317, -2.8]
let car = { x: 0, y: 0, width: 1520, height: 675 }, keys = [];
let cam = car
let mapW = 16000, mapH = 8000;
let spc = null, boost = null;

let bg = new Image();
let carPic = new Image();
bg.src = "map (4).png";
carPic.src = "carPlay.jpg";

let hit = document.createElement("canvas");
let hitctx = hit.getContext("2d");

bg.onload = function () {
    car = new comp(7, 14, "gray", 14895, 3317);
    area.start();
    hit.width = mapW;
    hit.height = mapH;
    hitctx.drawImage(bg, 0, 0, mapW, mapH);
};

let area = {
    canvas: document.createElement("canvas"),
    start: function () {
        this.canvas.width = cam.width;
        this.canvas.height = cam.height;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        setInterval(update, 20);
        window.addEventListener("keydown", function (e) {
            keys[e.keyCode] = true;
        });
        window.addEventListener("keyup", function (e) {
            keys[e.keyCode] = false;
        });
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

function comp(w, h, c, x, y) {
    this.width = w;
    this.height = h;
    this.x = x;
    this.y = y;
    this.speed = 0;
    this.move = 0;
    this.ang = -2.8;
    this.vel = 0;

    this.update = function () {
        let ctx = area.context;
        ctx.save();
        ctx.translate(this.x - cam.x, this.y - cam.y);
        ctx.rotate(this.ang);
        ctx.fillStyle = c;
        ctx.drawImage(carPic, -this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }

    this.moveIt = function () {
        let drift = spc ? 0.05 : 0.2;
        this.ang += this.move * Math.PI / 270;
        this.vel += (this.ang - this.vel) * drift;

        let nx = this.x + this.speed * Math.sin(this.vel);
        let ny = this.y - this.speed * Math.cos(this.vel);

        if (canDrive(nx, ny)) {
            if(car.speed >= 1) {
            safeRoad[0] = this.x
            safeRoad[1] = this.y
            safeRoad[2] = this.ang
            }
            this.x = Math.max(0, Math.min(nx, mapW));
            this.y = Math.max(0, Math.min(ny, mapH));
        } else {
            this.speed *= -0.2;
            this.x += -this.speed * Math.sin(this.vel);
            this.y += this.speed * Math.cos(this.vel);
        }
    }

    this.updateSpeed = function () {
        let acc = boost ? 0.06 : 0.01
        let max = boost ? 1.3 : 0.7
        let dec = 0.005;

        if (keys[38]) {
            this.speed += acc;
            //console.log(this.speed)
            if (this.speed > max) this.speed = max;
        } else if (keys[40]) {
            this.speed -= acc;
            if (this.speed < -max) this.speed = -max;
        } else {
            if (this.speed > 0) {
                this.speed -= dec;
                if (this.speed < 0) this.speed = 0;
            } else if (this.speed < 0) {
                this.speed += dec;
                if (this.speed > 0) this.speed = 0;
            }
        }
    }
}

function canDrive(x, y) {
    let px = hitctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    let l = 0.299 * px[0] + 0.587 * px[1] + 0.114 * px[2];
    return l > 190 || (px[0] > 180 && px[1] > 180 && px[2] < 120);
}

function camUpdate() {
    if (car.x - cam.x < 300) cam.x = car.x - 300
    if ((cam.x + cam.width) - car.x < 300) cam.x = car.x - cam.width + 300;
    if (car.y - cam.y < 200) cam.y = car.y - 200
    if ((cam.y + cam.height) - car.y < 200) cam.y = car.y - cam.height + 200;

    if (cam.x < 0) cam.x = 0;
    if (cam.y < 0) cam.y = 0;
    if (cam.x > mapW - cam.width) cam.x = mapW - cam.width;
    if (cam.y > mapH - cam.height) cam.y = mapH - cam.height;
}

function update() {
    area.clear();
    area.context.drawImage(bg, -cam.x, -cam.y, mapW, mapH);

    car.move = 0;
    if (keys[37]) car.move = -turnVal();
    if (keys[39]) car.move = turnVal();

    car.updateSpeed();
    car.moveIt();
    camUpdate();
    car.update();
}

function turnVal() {
    return spc ? 4 : 2;
}

function Menu() {
    car.speed = 0
}

document.addEventListener("keydown", e => {
    if (e.code === "Space") spc = true;
    if (e.code === "ShiftLeft") boost = true;
    if (e.code === "KeyR") car.x = safeRoad[0], car.y = safeRoad[1], car.ang = safeRoad[2];
    if (e.code == "Escape") Menu()
});
document.addEventListener("keyup", e => {
    if (e.code === "Space") spc = false;
    if (e.code === "ShiftLeft") boost = false;
});
