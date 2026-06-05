const SIZE = 6;

const COLORS = [
'red',
'blue',
'green',
'yellow',
'purple'
];

let board = [];
let score = 0;
let multiplier = 1;
let spawnRate = 2000;
let gameRunning = true;

const grid = document.getElementById("grid");

function init(){

    board = Array(SIZE)
    .fill()
    .map(()=>Array(SIZE).fill(null));

    render();

    for(let i=0;i<5;i++){
        spawnBlock();
    }

    startSpawner();
}

function render(){

    grid.innerHTML='';

    for(let r=0;r<SIZE;r++){

        for(let c=0;c<SIZE;c++){

            const cell=document.createElement('div');
            cell.className='cell';

            if(board[r][c]){
                cell.classList.add(board[r][c]);
            }

            cell.onclick=()=>handleClick(r,c);

            grid.appendChild(cell);
        }
    }

    document.getElementById('score').textContent=score;
    document.getElementById('multiplier').textContent=multiplier;
}

function emptyCells(){

    let cells=[];

    for(let r=0;r<SIZE;r++){
        for(let c=0;c<SIZE;c++){

            if(!board[r][c]){
                cells.push([r,c]);
            }
        }
    }

    return cells;
}

function spawnBlock(){

    let empties = emptyCells();

    if(empties.length===0){

        gameOver();
        return;
    }

    let [r,c] = empties[
        Math.floor(Math.random()*empties.length)
    ];

    board[r][c] =
        COLORS[Math.floor(Math.random()*COLORS.length)];

    render();
}

function getNeighbors(r,c){

    return [
        [r-1,c],
        [r+1,c],
        [r,c-1],
        [r,c+1]
    ].filter(([nr,nc]) =>
        nr>=0 &&
        nr<SIZE &&
        nc>=0 &&
        nc<SIZE
    );
}

function handleClick(r,c){

    if(!gameRunning) return;

    if(board[r][c]) return;

    let groups={};

    getNeighbors(r,c).forEach(([nr,nc])=>{

        let color = board[nr][nc];

        if(color){

            if(!groups[color]){
                groups[color]=[];
            }

            groups[color].push([nr,nc]);
        }
    });

    let bestColor=null;
    let max=0;

    for(let color in groups){

        if(groups[color].length>max){
            max=groups[color].length;
            bestColor=color;
        }
    }

    if(max>=2){

        groups[bestColor].forEach(([nr,nc])=>{
            board[nr][nc]=null;
        });

        let gained=max*10*multiplier;

        score+=gained;
        multiplier++;

    }else{

        multiplier=1;
    }

    render();
}

function gameOver(){

    gameRunning=false;

    document.getElementById("gameover")
    .textContent=
    "GAME OVER • Score: " + score;
}

function startSpawner(){

    const loop=()=>{

        if(!gameRunning) return;

        spawnBlock();

        spawnRate*=0.97;

        if(spawnRate<450){
            spawnRate=450;
        }

        setTimeout(loop,spawnRate);

    };

    setTimeout(loop,spawnRate);
}

init();