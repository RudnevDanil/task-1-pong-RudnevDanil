const canvas = document.getElementById("cnvs");

const gameState = {};
let do_stop = false;

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
    drawBlocks(context)
}

function check_platform_touched(context, ball)
{
    // platform touched
    if ((context.isPointInStroke(platf_border,ball.x,ball.y))) 
    {
        // ball inside platform
        if((Math.abs(ball.x - gameState.platform.x) < gameState.platform.width / 2 - ball.radius) && (ball.y > gameState.platform.y - gameState.platform.height / 2))
            ball.x -= gameState.platform.x - ball.x;

        ball.vx = -1 * ball.max_vx_speed * (gameState.platform.x - ball.x) / (gameState.platform.width/2+ball.radius);
        ball.vy = -1 * ball.vy; 
        
        return true;
    }
    else
        return false;
}

function check_wall_touched(context, ball)
{
    if((ball.x < ball.radius) || (ball.x > canvas.width - ball.radius)) // left or right wall
        ball.vx *= -1;
    else
        if(ball.y < ball.radius) // ceiling
            ball.vy *= -1;
        else
            return false;
    return true;
}

function check_block_touched(context, ball)
{
    for(let i = 0; i < gameState.block_field_size.blocks_h; i++)
    {
        for(let j = 0; j < gameState.block_field_size.blocks_w; j++)
        {
            if(context.isPointInStroke(blocks[i * gameState.block_field_size.blocks_w + j],ball.x,ball.y))
            {
                curent_ind = i * gameState.block_field_size.blocks_w + j;
                blocks_colour[curent_ind].fillStyle = "blue";
                let dist_to_horizontal = Math.min(Math.abs(blocks_positions[curent_ind].x - ball.x), Math.abs(blocks_positions[curent_ind].x + gameState.block.w - ball.x));
                let dist_to_vertical = Math.min(Math.abs(blocks_positions[curent_ind].y - ball.y), Math.abs(blocks_positions[curent_ind].y + gameState.block.w - ball.y));
                if(dist_to_horizontal < dist_to_vertical)
                    ball.vy *= -1;
                else            
                    ball.vx *= -1;
                
                /*let dist_from_centers = {by_x: Math.abs(blocks_positions[curent_ind].x + gameState.block.w - ball.x), 
                                         by_y: Math.abs(blocks_positions[curent_ind].y + gameState.block.h - ball.y)};
                let dist_to_the_border = {by_x: gameState.block.w/2 - dist_from_centers.by_x, 
                                          by_y: gameState.block.h/2 - dist_from_centers.by_y};
                if(dist_to_the_border.by_x < 0 || (Math.abs(dist_to_the_border.by_x) > Math.abs(dist_to_the_border.by_y)))
                {
                   // from left or right
                   ball.vx *= -1;
                }
                if(dist_to_the_border.by_y < 0 || (Math.abs(dist_to_the_border.by_y) > Math.abs(dist_to_the_border.by_x)))
                {
                   // from top or bottom
                    ball.vy *= -1;
                }*/
                return;
            }
        }
    }
    
}

function update(tick) 
{
    // move platform
    const vx = (gameState.pointer.x - gameState.platform.x) / 10
    gameState.platform.x += vx
    
    // check if platform still in frame
    if(gameState.platform.x > canvas.width - gameState.platform.width/2)
        gameState.platform.x = canvas.width - gameState.platform.width/2;
    if(gameState.platform.x < gameState.platform.width/2)
        gameState.platform.x = gameState.platform.width/2;
    
    const context = canvas.getContext('2d');
    const ball = gameState.ball;
    
    // check fail
    if(ball.y >= canvas.height - ball.radius) // floor
    {
        alert("LOSER");
        do_stop = true;
    }
    else
    {         
        
        if(!check_platform_touched(context, ball))
            if(!check_wall_touched(context, ball))
                check_block_touched(context, ball);
        
        // moving
        ball.y += ball.vy/2;
        ball.x += ball.vx/2;
    }
}

function run(tFrame) 
{
    if(!do_stop)
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
    else
        document.location.reload();
}

function stopGame(handle) 
{
    window.cancelAnimationFrame(handle);
}

let platf_border = new Path2D();
function drawPlatform(context) 
{
    
    const {x, y, width, height} = gameState.platform;
    let xs = x - width / 2;
    let ys = y - height / 2;
    let r = 15;
    
	
    platf_border = new Path2D();
    context.beginPath();        
    platf_border.moveTo(xs+r,ys);
    platf_border.lineTo(xs+width-r,ys);    
    platf_border.arc(xs+width-r, ys+r, r, 3/2 * Math.PI, 0);    
    platf_border.lineTo(xs+width,ys+height-r);
    platf_border.arc(xs+width-r, ys+height-r, r, 0, 1/2 * Math.PI);
    platf_border.lineTo(xs+r,ys+height);
    platf_border.arc(xs+r, ys+height-r, r, 1/2 * Math.PI, Math.PI);
    platf_border.lineTo(xs,ys+r);
    platf_border.arc(xs+r, ys+r, r, Math.PI, 3/2 * Math.PI); 
    context.lineWidth = gameState.ball.radius * 2;
    context.strokeStyle = 'red';
    context.fill(platf_border);
    context.stroke(platf_border);
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
    context.fillStyle = gameState.platform.color;       
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

function randColor() 
{
    var r = Math.floor(Math.random() * (256)),
        g = Math.floor(Math.random() * (256)),
        b = Math.floor(Math.random() * (256));
    return '#' + r.toString(16) + g.toString(16) + b.toString(16);
}

function drawSingleBlock(context, st_x, st_y, i)
{
	let w = gameState.block.w, h = gameState.block.h, r = gameState.block.r;
    blocks[i] = new Path2D();
	context.beginPath();        
    blocks[i].moveTo(st_x + r , st_y);
    blocks[i].lineTo(st_x + w - r , st_y);    
    blocks[i].arc(st_x + w - r , st_y + r , r , 3/2 * Math.PI , 0);    
    blocks[i].lineTo(st_x + w , st_y + h - r);
    blocks[i].arc(st_x + w - r , st_y + h - r , r , 0 , 1/2 * Math.PI);
    blocks[i].lineTo(st_x + r , st_y + h);
    blocks[i].arc(st_x + r , st_y + h - r , r , 1/2 * Math.PI , Math.PI);
    blocks[i].lineTo(st_x , st_y + r);
    blocks[i].arc(st_x + r , st_y + r , r , Math.PI, 3/2 * Math.PI);
    context.lineWidth = 5;
	
    context.strokeStyle = blocks_colour[i].strokeStyle;
	context.fillStyle = blocks_colour[i].fillStyle;
    context.fill(blocks[i]);
    context.stroke(blocks[i]);
    context.closePath();
}

let blocks = [];
let blocks_colour = [];
let blocks_crached = [];
let blocks_positions = [];

function initBlocks()
{
    gameState.block_field_size = {
        blocks_w: 15,
        blocks_h: 3,        
    }
    gameState.block_external_size = {
        w: canvas.width / gameState.block_field_size.blocks_w,
        h: canvas.height * 0.07,		
    };
    gameState.block = {
        w: gameState.block_external_size.w * 0.8,
        h: gameState.block_external_size.h * 0.5,
        r: 3,
    };      
    blocks_colour = {
		strokeStyle: randColor(),
		fillStyle: randColor()
	};
    
	for(let i = 0; i < gameState.block_field_size.blocks_h; i++)
    {
        for(let j = 0; j < gameState.block_field_size.blocks_w; j++)
        {
            blocks_colour[i*gameState.block_field_size.blocks_w + j]  = {strokeStyle: randColor(), fillStyle: randColor()};
            blocks_crached[i*gameState.block_field_size.blocks_w + j] = 0;
            blocks_positions[i*gameState.block_field_size.blocks_w + j] = {
                x: j * gameState.block_external_size.w + (gameState.block_external_size.w - gameState.block.w)/2, 
                y: i * gameState.block_external_size.h + (gameState.block_external_size.h - gameState.block.h)/2,
            };
        }
    }
}

function drawBlocks(context)
{   
    for(let i = 0; i < gameState.block_field_size.blocks_h; i++)
    {
        for(let j = 0; j < gameState.block_field_size.blocks_w; j++)
        {
            drawSingleBlock(context
                            , j * gameState.block_external_size.w + (gameState.block_external_size.w - gameState.block.w)/2
                            , i * gameState.block_external_size.h + (gameState.block_external_size.h - gameState.block.h)/2
                            , i * gameState.block_field_size.blocks_w + j);
        }
    }
}

function setup() 
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.addEventListener('mousemove', onMouseMove, false);

    gameState.lastTick = performance.now();
    gameState.lastRender = gameState.lastTick;
    gameState.tickLength = 15; //ms

    gameState.platform = {
        x: 100,
        y: canvas.height - 50,
        width: canvas.width * 0.25,
        height: 50,
        color: "#BF6730",
    };
    gameState.pointer = {
        x: 0,
        y: 0,
    };
    gameState.ball = {
        x: canvas.width / 2,
        y: 200,
        radius: 10,
        vx: 0,
        vy: 10,
        max_vx_speed: 10,
    }
    
    initBlocks();
}

setup();
run();
