const canvas = document.getElementById("cnvs");

const gameState = {};

function onMouseMove(e) 
{
    gameState.pointer.x = e.pageX;
    gameState.pointer.y = e.pageY
}

function queueUpdates(numTicks) 
{
    for (let i = 0; i < numTicks; i++) 
    {
        gameState.lastTick = gameState.lastTick + gameState.tickLength;
        update(gameState.lastTick);
    }
}

function draw(tFrame) 
{
    const context = canvas.getContext('2d');

    // clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawPlatform(context)
    drawBall(context)
}

function update(tick) 
{
    const vx = (gameState.pointer.x - gameState.player.x) / 10
    gameState.player.x += vx

    const context = canvas.getContext('2d');
    const ball = gameState.ball;
    if (!(context.isPointInStroke(platform,ball.x,ball.y))) // plattf
    {
        ball.y += ball.vy/2;
        ball.x += ball.vx/2;
    }
    
}

function run(tFrame) 
{
    gameState.stopCycle = window.requestAnimationFrame(run);

    const nextTick = gameState.lastTick + gameState.tickLength;
    let numTicks = 0;

    if (tFrame > nextTick) 
    {
        const timeSinceTick = tFrame - gameState.lastTick;
        numTicks = Math.floor(timeSinceTick / gameState.tickLength);
    }
    queueUpdates(numTicks);
    draw(tFrame);
    gameState.lastRender = tFrame;
}

function stopGame(handle) 
{
    window.cancelAnimationFrame(handle);
}

let platform = new Path2D();
function drawPlatform(context) 
{
    
    const {x, y, width, height} = gameState.player;
    let xs = x - width / 2;
    let ys = y - height / 2;
    let r = 15;
    
    platform = new Path2D();
    //platform.rect(x - width / 2, y - height / 2, width, height);
    context.beginPath();        
    platform.moveTo(xs+r,ys);
    platform.lineTo(xs+width-r,ys);    
    platform.arc(xs+width-r, ys+r, r, 3/2 * Math.PI, 0);    
    platform.lineTo(xs+width,ys+height-r);
    platform.arc(xs+width-r, ys+height-r, r, 0, 1/2 * Math.PI);
    platform.lineTo(xs+r,ys+height);
    platform.arc(xs+r, ys+height-r, r, 1/2 * Math.PI, Math.PI);
    platform.lineTo(xs,ys+r);
    platform.arc(xs+r, ys+r, r, Math.PI, 3/2 * Math.PI); 
    context.lineWidth = gameState.ball.radius * 2;
    context.strokeStyle = 'red';
    context.fill(platform);
    context.stroke(platform);
    context.closePath();
    
    context.beginPath();        
    context.moveTo(xs+r,ys);
    context.lineTo(xs+width-r,ys);    
    context.arc(xs+width-r, ys+r, r, 3/2 * Math.PI, 0);    
    context.lineTo(xs+width,ys+height-r);
    context.arc(xs+width-r, ys+height-r, r, 0, 1/2 * Math.PI);
    context.lineTo(xs+r,ys+height);
    context.arc(xs+r, ys+height-r, r, 1/2 * Math.PI, Math.PI);
    context.lineTo(xs,ys+r);
    context.arc(xs+r, ys+r, r, Math.PI, 3/2 * Math.PI);       
    context.fillStyle = "#BF6730";       
    context.stroke();
    context.fill();
    context.closePath();
    
    

}

function drawBall(context) 
{
    const {x, y, radius} = gameState.ball;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    
    context.fillStyle = "#34D2AF";
    context.fill();
    context.closePath();
}

function setup() 
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.addEventListener('mousemove', onMouseMove, false);

    gameState.lastTick = performance.now();
    gameState.lastRender = gameState.lastTick;
    gameState.tickLength = 15; //ms

    const platform = {
        width: 400,
        height: 50,
    };

    gameState.player = {
        x: 100,
        y: canvas.height - platform.height / 2,
        width: platform.width,
        height: platform.height
    };
    gameState.pointer = {
        x: 0,
        y: 0,
    };
    gameState.ball = {
        x: canvas.width / 2,
        y: 0,
        radius: 25,
        vx: 0,
        vy: 5
    }
}

setup();
run();
