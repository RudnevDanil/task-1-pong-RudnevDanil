const canvas = document.getElementById("cnvs");

const gs = {};

function check_platform_touched(ball)
{
    // platform touched
    let {x, y} = ball;
    let plt = {
        l: gs.platform.x - gs.platform.width / 2 - ball.radius,// left
        r: gs.platform.x + gs.platform.width / 2 + ball.radius, // right
        t: gs.platform.y - gs.platform.height / 2 - ball.radius, // top
        b: gs.platform.y + gs.platform.height / 2 + ball.radius, // bottom
    };
    
    // if ball touched platform
    if   (x >= plt.l
       && x <= plt.r
       && y >= plt.t
       && y <= plt.b)       
    {
        // change ball direction
        if (ball.vx == 0)
          ball.vx = ((gs.platform.x > x)?-1:1) * ball.max_vx_speed * Math.abs((gs.platform.x - x) / (gs.platform.width / 2));
        if(ball.vy > 0)
            ball.vy = -1 * ball.vy;        
        
        return true;
    }
    else
        return false;
}

function check_wall_touched(ball)
{
    // left or right wall
    if((ball.x < ball.radius) || (ball.x > canvas.width - ball.radius)) 
        ball.vx *= -1;
    else
        // ceiling
        if(ball.y < ball.radius) 
            ball.vy *= -1;
        else
            return false;
    return true;
}

function check_block_touched(ball)
{
    let {x, y, radius: r} = ball;
    let {w: exw, h: exh} = gs.block_exs;
    
    // if ball in high part of screen
    if(y < exh * gs.block_fs.blocks_h)
    {
        x = x % exw;
        y = y % exh;        
        
        let ind = Math.floor(ball.x / exw)  + Math.floor(ball.y / exh) * gs.block_fs.blocks_w;
               
        // if block bot crashed
        if (gs.crashed[ind] < 2)
        {
            let {w, h} = gs.block;
            // make smaller if already touched once
            if (gs.crashed[ind] == 1)
            {
                w *= gs.multCoef;
                h *= gs.multCoef;            
            }
            let lrBorder = (exw - w) / 2; // left (or irght) border
            let udBorder = (exh - h) / 2; // up (or down) border        

            // if ball touched block
            if   ((x + r > lrBorder - gs.strW) 
               && (x - r < lrBorder + w + gs.strW) 
               && (y + r > udBorder - gs.strW) 
               && (y - r < udBorder + h + gs.strW))
            {
                // change ball direction
                ball.vy *= -1;

                // change platform color
                gs.clr.plt = (gs.crashed[ind] == 0) ? gs.blocks_clr[ind].strokeStyle : gs.blocks_clr[ind].fillStyle;

                if (gs.crashed[ind] == 0)
                {
                    gs.blocks_clr[ind].strokeStyle = gs.blocks_clr[ind].fillStyle; 
                }

                // crash block
                gs.crashed[ind] += 1;
                gs.score += 1;
            }
        }
    }
}

function check_win()
{
    for(let i = 0; i < gs.block_fs.blocks_h; i++)
        for(let j = 0; j < gs.block_fs.blocks_w; j++)
            if(gs.crashed[i*gs.block_fs.blocks_w + j] < 2)
                return false;
    alert("WIN  " + gs.seconds_left + "sec.  score: " + gs.score);
    return true;
}

function check_bonus_touced(cnt, ball)
{
    if(gs.bonus_active && cnt.isPointInStroke(gs.bonus2d,ball.x,ball.y))
    {
        gs.bonus_active = false;
        gs.score += 15;
    }        
}

function check_bonus_get_out()
{
    // left wall
    if(gs.bonus.x - gs.bonus.wall < 0)
    {
        gs.bonus.x = gs.bonus.wall;

        gs.bonus.vx = 3 * gs.bonus.wall;
    }
    // right wall
    else if(gs.bonus.x + 2 * gs.bonus.wall > canvas.width)
    {
        gs.bonus.x = canvas.width - 2 * gs.bonus.wall-gs.bonus.wall;
        gs.bonus.vx = -3 * gs.bonus.wall;
    }
    // random changing vx
    else
        gs.bonus.vx += Math.random() * 30 - 15;


    // check is fall down
    if(gs.bonus.y + 3 * gs.bonus.wall >= canvas.height)
        gs.bonus_active = false; 
}

function update(tick) 
{
    // move platform
    const vx = (gs.pointer.x - gs.platform.x) / 10;
    gs.platform.x += vx;
    
    // check if platform still in frame
    if(gs.platform.x > canvas.width - gs.platform.width/2)
        gs.platform.x = canvas.width - gs.platform.width/2;
    if(gs.platform.x < gs.platform.width/2)
        gs.platform.x = gs.platform.width/2;
    
    const cnt = canvas.getContext('2d');
    const ball = gs.ball;
    
    // check fail
    if(ball.y >= canvas.height - ball.radius) // floor
    {
        alert("LOSER. " + gs.seconds_left + "sec.  score: " + gs.score);
        gs.do_stop = true;
        clearTimeout(gs.timer);
    }
    else
    {        
        // check win
        if(!check_win())
        {        
            if(!check_platform_touched(ball))
                if(!check_wall_touched(ball))
                    check_block_touched(ball);

            check_bonus_touced(cnt, ball);
            
            // moving ball
            ball.y += ball.vy / gs.ball.brakes * gs.ball.speed;
            ball.x += ball.vx / gs.ball.brakes * gs.ball.speed;
            
            // moving bonus
            if(gs.bonus_active)
            {
                gs.bonus.x += gs.bonus.vx / 10;
                gs.bonus.y += gs.bonus.vy / 10;
                check_bonus_get_out()
            }
        }
    }
}

function drawBack(cnt)
{
    cnt.beginPath();
    cnt.rect(0,0,canvas.width,canvas.height);
    cnt.fillStyle = gs.clr.bkg;
    cnt.fill();
    cnt.closePath();    
}

function drawBall(cnt) 
{
    const {x, y, radius} = gs.ball;
    cnt.beginPath();
    cnt.arc(x, y, radius, 0, 2 * Math.PI);    
    cnt.fillStyle = gs.clr.ball;
    cnt.fill();
    cnt.closePath();
}

let plt_b = new Path2D();
function drawPlatform(cnt) 
{    
    const {x, y, width, height} = gs.platform;
    let xs = x - width / 2;
    let ys = y - height / 2;
    let r = 15;
    
    plt_b = new Path2D();
    cnt.beginPath();        
    plt_b.moveTo(xs+r,ys);
    plt_b.lineTo(xs+width-r,ys);    
    plt_b.arc(xs+width-r, ys+r, r, 3/2 * Math.PI, 0);    
    plt_b.lineTo(xs+width,ys+height-r);
    plt_b.arc(xs+width-r, ys+height-r, r, 0, 1/2 * Math.PI);
    plt_b.lineTo(xs+r,ys+height);
    plt_b.arc(xs+r, ys+height-r, r, 1/2 * Math.PI, Math.PI);
    plt_b.lineTo(xs,ys+r);
    plt_b.arc(xs+r, ys+r, r, Math.PI, 3/2 * Math.PI);       
    cnt.fillStyle = gs.clr.plt; 
    cnt.fill(plt_b);
    cnt.font = "22px Verdana";
    cnt.textAlign = "center";
    cnt.fillStyle = gs.clr.text
    cnt.fillText("" + gs.seconds_left + "sec.  score: " + gs.score, xs + Math.floor(width / 2), ys + Math.floor(height / 2));
    cnt.closePath();
}

function initBlocks()
{
    // blocks
    gs.blocks = [];
    gs.blocks_clr = [];
    gs.crashed = [];
    
    // field size
    gs.block_fs = { 
        blocks_w: 15,
        blocks_h: 3,        
    };
    
    // external block size
    gs.block_exs = {
        w: canvas.width / gs.block_fs.blocks_w,
        h: canvas.height * 0.07,		
    };
    
    // block size
    gs.block = {
        w: gs.block_exs.w * 0.8,
        h: gs.block_exs.h * 0.5,
        r: 3,
    };
    
    // stroke width
    gs.strW = 5;
    
    // coefficient after crash
    gs.multCoef = 0.8;
    
	for(let i = 0; i < gs.block_fs.blocks_h; i++)
    {
        for(let j = 0; j < gs.block_fs.blocks_w; j++)
        {
            gs.blocks_clr[i*gs.block_fs.blocks_w + j]  = {
                strokeStyle: gs.clr.blocks_s[Math.floor(Math.random() * gs.clr.blocks_s.length)], 
                fillStyle: gs.clr.blocks_f[Math.floor(Math.random() * gs.clr.blocks_f.length)]
            };
            
            gs.crashed[i*gs.block_fs.blocks_w + j] = 0;
        }
    }
}

function drawBlocks(cnt)
{   
    for(let i = 0; i < gs.block_fs.blocks_h; i++)
        for(let j = 0; j < gs.block_fs.blocks_w; j++)
            drawSingleBlock(cnt
                            , j * gs.block_exs.w + (gs.block_exs.w - gs.block.w)/2
                            , i * gs.block_exs.h + (gs.block_exs.h - gs.block.h)/2
                            , i * gs.block_fs.blocks_w + j);
}

function drawSingleBlock(cnt, st_x, st_y, i)
{
    
    if(gs.crashed[i] < 2)
    {
        let {w, h, r} = gs.block;
        if(gs.crashed[i] == 1)
        {
            st_x += w * (1 - gs.multCoef) / 2;
            st_y += h * (1 - gs.multCoef) / 2;            
            w *= gs.multCoef;
            h *= gs.multCoef;            
        }
        cnt.beginPath(); 
        
        gs.blocks[i] = new Path2D();               
        gs.blocks[i].moveTo(st_x + r , st_y);
        gs.blocks[i].lineTo(st_x + w - r , st_y);    
        gs.blocks[i].arc(st_x + w - r , st_y + r , r , 3/2 * Math.PI , 0);    
        gs.blocks[i].lineTo(st_x + w , st_y + h - r);
        gs.blocks[i].arc(st_x + w - r , st_y + h - r , r , 0 , 1/2 * Math.PI);
        gs.blocks[i].lineTo(st_x + r , st_y + h);
        gs.blocks[i].arc(st_x + r , st_y + h - r , r , 1/2 * Math.PI , Math.PI);
        gs.blocks[i].lineTo(st_x , st_y + r);
        gs.blocks[i].arc(st_x + r , st_y + r , r , Math.PI, 3/2 * Math.PI);  
        
        cnt.lineWidth = gs.strW;
        cnt.strokeStyle = gs.blocks_clr[i].strokeStyle;
        cnt.fillStyle = gs.blocks_clr[i].fillStyle;
        cnt.fill(gs.blocks[i]);
        cnt.stroke(gs.blocks[i]);
        cnt.closePath();
    }
}

function generate_bonus()
{
    gs.bonus2d = new Path2D();
    gs.bonus_active = false;
    gs.bonus = {
        x: 100,
        y: 300,
        wall: 15, // len of line
        vx: 5,
        vy: 5,
    };
    gs.bonus.x = Math.random()*(canvas.width - gs.bonus.wall * 3) + gs.bonus.wall;
    gs.bonus.y = gs.bonus.wall;
    gs.bonus_active = true;    
}

function drawBonus(cnt)
{
    if(gs.bonus_active)
    {
        gs.bonus2d = new Path2D();
        cnt.beginPath();
        
        let p = {x:gs.bonus.x, y: gs.bonus.y, w: gs.bonus.wall};
        gs.bonus2d.moveTo(p.x,p.y);
        gs.bonus2d.lineTo(p.x + p.w, p.y);
        gs.bonus2d.lineTo(p.x + p.w,p.y + p.w);
        gs.bonus2d.lineTo(p.x + 2 * p.w,p.y + p.w);
        gs.bonus2d.lineTo(p.x + 2 * p.w,p.y + 2 * p.w);
        gs.bonus2d.lineTo(p.x + p.w,p.y + 2 * p.w);
        gs.bonus2d.lineTo(p.x + p.w,p.y + 3 * p.w);
        gs.bonus2d.lineTo(p.x,p.y + 3 * p.w);
        gs.bonus2d.lineTo(p.x,p.y + 2 * p.w);
        gs.bonus2d.lineTo(p.x - p.w,p.y + 2 * p.w);
        gs.bonus2d.lineTo(p.x - p.w,p.y + p.w);
        gs.bonus2d.lineTo(p.x,p.y + p.w);
        gs.bonus2d.lineTo(p.x,p.y);
        
        cnt.lineWidth = 3;    
        cnt.strokeStyle = gs.clr.bonus;
        cnt.stroke(gs.bonus2d);
        cnt.closePath();
    }    
}

function timer_tictoc()
{    
    gs.seconds_left += 1;
    //if(gs.seconds_left % 15 == 0) // each 15 sec. new bonus
    if(gs.seconds_left == 1) // bonus after 1st second
        generate_bonus();
    if(gs.seconds_left % 30 == 0) // mult ball speed each 30 sec.
        gs.ball.speed *= 1.1;
    gs.timer = setTimeout(timer_tictoc, 1000);
}

function setup() 
{
    gs.do_stop = false;
    gs.timer;
    gs.seconds_left = 0;
    gs.score = 0;
    
    gs.clr = {
        bkg: "#f0e9dd",
        blocks_s: ["#aec086","#b9c5c7","#d7d2cc","#a08c7d","#b3504b"],
        blocks_f: ["#363634","#524636","#ac7330","#b19a78","#af8d8b","#664845","#34201f","#1d0f0c"],
        ball: "#34d2af",
        plt: "#bf6730",
        bonus: "#ff0000",  
        text: "#000000",
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;    
    
    canvas.addEventListener('mousemove', onMouseMove, false);

    gs.lastTick = performance.now();
    gs.lastRender = gs.lastTick;
    gs.tickLength = 15; //ms

    gs.platform = {
        x: 100,
        y: canvas.height - 50,
        width: canvas.width * 0.25,
        height: 50,
    };
    gs.pointer = {
        x: 0,
        y: 0,
    };
    gs.ball = {
        x: canvas.width / 2,
        y: 200,
        radius: 10,
        vx: 0,
        vy: 10,
        max_vx_speed: 15,
        brakes: 3,
        speed: 1,
    }
    
    initBlocks();
    gs.timer = setTimeout(timer_tictoc, 1000);

}

function run(tFrame) 
{
    if(!gs.do_stop)
    {
        gs.stopCycle = window.requestAnimationFrame(run);

        const nextTick = gs.lastTick + gs.tickLength;
        let numTicks = 0;

        if (tFrame > nextTick) 
        {
            const timeSinceTick = tFrame - gs.lastTick;
            numTicks = Math.floor(timeSinceTick / gs.tickLength);
        }
        queueUpdates(numTicks);
        draw(tFrame);
        gs.lastRender = tFrame;
    }
    else
        document.location.reload();
}

function stopGame(handle) 
{
    window.cancelAnimationFrame(handle);
}

function onMouseMove(e) 
{
    gs.pointer.x = e.pageX;
    gs.pointer.y = e.pageY
}

function queueUpdates(numTicks) 
{
    for (let i = 0; i < numTicks; i++) 
    {
        gs.lastTick = gs.lastTick + gs.tickLength;
        update(gs.lastTick);
    }
}

function draw(tFrame) 
{
    const cnt = canvas.getContext('2d');

    // clear canvas
    cnt.clearRect(0, 0, canvas.width, canvas.height);

    drawBack(cnt);
    drawPlatform(cnt);
    drawBall(cnt);
    drawBlocks(cnt);
    drawBonus(cnt);
}

setup();
run();
