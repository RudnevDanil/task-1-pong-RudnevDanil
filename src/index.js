const canvas = document.getElementById("cnvs");

const gs = {};
gs.elements_numb = 15;
gs.elements_k = [10, 20, 15];

function update(tick) 
{    
    const cnt = canvas.getContext('2d');
	
	// move elements
   
	for (let i = 0; i < gs.elements_numb; i++)
	{
        gs.arr[i].x += gs.arr[i].vx;
        gs.arr[i].y += gs.arr[i].vy;
        
        checkWallTouch(cnt, i);
	}
}

function checkWallTouch(cnt, i) 
{
    if(i % 3 == 0) // ball
    {
        if(gs.arr[i].x < gs.arr[i].k) // left wall
            gs.arr[i].vx *= -1;
        else if (gs.arr[i].y < gs.arr[i].k) // top wall
            gs.arr[i].vy *= -1;
        else if (gs.arr[i].x + gs.arr[i].k > canvas.width) // right wall
            gs.arr[i].vx *= -1;
        else if (gs.arr[i].y + gs.arr[i].k > canvas.height) // bottom wall
            gs.arr[i].vy *= -1;
        
    }
	else if(i % 3 == 1) // triangle
    {
        if(gs.arr[i].x < gs.arr[i].p2) // left wall
            gs.arr[i].vx *= -1;
        else if (gs.arr[i].y < gs.arr[i].p1) // top wall
            gs.arr[i].vy *= -1;
        else if (gs.arr[i].x + gs.arr[i].p2 > canvas.width) // right wall
            gs.arr[i].vx *= -1;
        else if (gs.arr[i].y + gs.arr[i].p1 > canvas.height) // bottom wall
            gs.arr[i].vy *= -1;
    }
    else // hex
    {
        if(gs.arr[i].x < gs.arr[i].k) // left wall
            gs.arr[i].vx *= -1;
        else if (gs.arr[i].y < gs.arr[i].p1) // top wall
            gs.arr[i].vy *= -1;
        else if (gs.arr[i].x + gs.arr[i].k > canvas.width) // right wall
            gs.arr[i].vx *= -1;
        else if (gs.arr[i].y + gs.arr[i].p1 > canvas.height) // bottom wall
            gs.arr[i].vy *= -1;
    }
}

function drawBall(cnt, i) 
{
	if(gs.arr[i].touched < 3)
	{
		cnt.beginPath();
		cnt.arc(gs.arr[i].x, gs.arr[i].y, gs.arr[i].k, 0, 2 * Math.PI);    
		cnt.fillStyle = gs.clr[gs.arr[i].touched];
		cnt.fill();
		cnt.closePath();
    }
}

function drawTriangle(cnt, i) 
{
	if(gs.arr[i].touched < 3)
	{
		cnt.beginPath();
		cnt.moveTo(gs.arr[i].x - gs.arr[i].p2, gs.arr[i].y + gs.arr[i].p1);
        cnt.lineTo(gs.arr[i].x, gs.arr[i].y - gs.arr[i].p1);
        cnt.lineTo(gs.arr[i].x + gs.arr[i].p2, gs.arr[i].y + gs.arr[i].p1);
        cnt.lineTo(gs.arr[i].x - gs.arr[i].p2, gs.arr[i].y + gs.arr[i].p1);        
		cnt.fillStyle = gs.clr[gs.arr[i].touched];
		cnt.fill();
		cnt.closePath();
    }
}

function drawHex(cnt, i) 
{
	if(gs.arr[i].touched < 3)
	{
		cnt.beginPath();
		cnt.moveTo(gs.arr[i].x - gs.arr[i].p2, gs.arr[i].y + gs.arr[i].p1);
        cnt.lineTo(gs.arr[i].x - gs.arr[i].k, gs.arr[i].y);
        cnt.lineTo(gs.arr[i].x - gs.arr[i].p2, gs.arr[i].y - gs.arr[i].p1);
        cnt.lineTo(gs.arr[i].x + gs.arr[i].p2, gs.arr[i].y - gs.arr[i].p1);
        cnt.lineTo(gs.arr[i].x + gs.arr[i].k, gs.arr[i].y);
        cnt.lineTo(gs.arr[i].x + gs.arr[i].p2, gs.arr[i].y + gs.arr[i].p1);
        cnt.lineTo(gs.arr[i].x - gs.arr[i].p2, gs.arr[i].y + gs.arr[i].p1);
		cnt.fillStyle = gs.clr[gs.arr[i].touched];
		cnt.fill();
		cnt.closePath();
    }
}

function setup() 
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;   
    
    gs.lastTick = performance.now();
    gs.lastRender = gs.lastTick;
    gs.tickLength = 15; //ms

    gs.base_obj_speed = 3;
	gs.arr = [];
	for (let i = 0; i < gs.elements_numb; i++)
	{
		gs.arr[i] = {
			sh: i % 3 == 0 ? 'b': (i % 3 == 1 ? 't' : 'h'),// 'b', 't', 'h' ball, triangle, hex
			x: gs.elements_k[i % 3] + Math.random() * (canvas.width - 2 * gs.elements_k[i % 3]), // center x
			y: gs.elements_k[i % 3] + Math.random() * (canvas.height - 2 * gs.elements_k[i % 3]), // center y
			k: gs.elements_k[i % 3], // r for ball, side len for triangle and hex
			touched: 0,	// amount of touching
			vx: (Math.random()-0.5) * gs.base_obj_speed,
			vy: (Math.random()-0.5) * gs.base_obj_speed,
            
            // for triangle and hex
            p1: 0, // parametr for optimization drawing 1/2 of high
            p2: 0, // parametr for optimization drawing 1/2 of side (k) 
		};
	}
    
    // init optimization params
    for (let i = 0; i < gs.elements_numb; i++)
    {
        if(i % 3 == 1) // triangle
        {
            gs.arr[i].p1 = gs.arr[i].k *0.433;
            gs.arr[i].p2 = gs.arr[i].k *0.5;            
        }
        if(i % 3 == 2) // triangle
        {
            gs.arr[i].p1 = gs.arr[i].k *0.866;
            gs.arr[i].p2 = gs.arr[i].k *0.5;            
        }        
    }
	
	gs.clr = ["green", "orange", "red"];
}

function run(tFrame) 
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

    // draw shapes
	for (let i = 0; i < gs.elements_numb; i++)
	{
        if(i % 3 == 0)
		    drawBall(cnt, i);
		else if(i % 3 == 1)
            drawTriangle(cnt, i);
		else
            drawHex(cnt, i);
	}
}

setup();
run();
