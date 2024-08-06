//board
var blockSize = 25;
var rows = 20;
var cols = 10;
var board;
var context;
var colX = blockSize *cols/2;
var colY = blockSize*-1;
var velocityX = 0;
var velocityY = 1;
var placed = 0;
const boardData = [];
var testData = false;
var currIndex = 0;
var numberOfColors = 3;
var colors = ["lime", "blue", "red", "yellow", "orange", "purple" ];
var coloumnHeight = 4;
var currPiece = [];
var intervalID;
var flashIntervalID;
var boxThickness = 1;

var boardCheckData;

var STOP = 0;
var flashing = 0;
var flashTimes = 0;

var gamePlaying = 0;
var gameDone = 0;
var totalPoints = 0;

var pointsText; 

var gamerName = "";


var testI = 20;
var testJ = 20;



 /* 
 ROWS = Y coordinate

 COLS = X coordinate
 
 
 */


window.onload = function() {
 board = document.getElementById("board");
 board.height = rows*blockSize;
 board.width = cols*blockSize;
 context = board.getContext("2d");


}

function startGame(){

    gamerName = prompt("What is Your Gamer Name?");

    initBoardData();

    document.addEventListener("keydown", changeDirectionDown);
    document.addEventListener("keyup", changeDirectionUp);
    //gamerName = prompt("What is Your Gamer Name?");


   clearInterval(intervalID);
   
    intervalID = setInterval(stateMachine, 1000/10);

}



function initBoardData(){ // Create empty array of data for board
    for(let i = 0; i<rows; i++){ // i = y coordinate
        for(let j = 0; j<cols; j++){ // j = x coordinate
            boardData [i*cols + j] = -1;
        }
    }
    makeRandomPiece();

    boardCheckData = Array.from({ length: rows }, () => Array(cols).fill(0)); // 0 means not checked yet or no connection yet & 1 means it's in a row
    // this 2d array if for marking pieces that are in a row and can be found being used in the checkForTriplets functions
    gamePlaying = 1;

    pointsText = document.querySelector("#pointstext");


}
function flash(){
        context.fillStyle="black"; // Draw black rectangle for full
        context.fillRect(0,0,board.width, board.height);
        for(let i = 0; i<rows; i++){ // Draw board if there's a piece
            for(let j = 0; j<cols; j++){
                if(boardData[i*cols + j] == -1){}
                else {

                    if(flashTimes %2 == 0){
                        context.fillStyle = "grey";
                        context.fillRect(j*blockSize, i*blockSize, blockSize, blockSize);
                        context.fillStyle = colors[boardData[i*cols + j]];
                        context.fillRect(j*blockSize+boxThickness, i*blockSize+boxThickness, blockSize-2*boxThickness, blockSize-2*boxThickness);

                    }else {
                        if(boardCheckData[i][j] == 1){
                            context.fillStyle = "grey";
                            context.fillRect(j*blockSize, i*blockSize, blockSize, blockSize);
                            context.fillStyle = "white";
                            context.fillRect(j*blockSize+boxThickness, i*blockSize+boxThickness, blockSize-2*boxThickness, blockSize-2*boxThickness);
                        } else {
                            context.fillStyle = "grey";
                            context.fillRect(j*blockSize, i*blockSize, blockSize, blockSize);
                            context.fillStyle = colors[boardData[i*cols + j]];
                            context.fillRect(j*blockSize+boxThickness, i*blockSize+boxThickness, blockSize-2*boxThickness, blockSize-2*boxThickness);
                        }
                    }
                }
            }
        }
        flashTimes++;
}


function stateMachine(){
    if(flashing){
        if(flashTimes == 0){
            flashIntervalID = setInterval(flash, 500);
            flashTimes++;
        }
        if(flashTimes >= 6){
            flashing = 0;
            flashTimes = 0;
            clearInterval(flashIntervalID);
            removeRows();

        }
    } else if (gamePlaying){
        update();
    } else if (gameDone){
        var tag = document.createElement("p");
        var text = document.createTextNode(gamerName, ": ", totalPoints);
        tag.appendChild(text);
        var element = document.getElementById("leaderBoard");
        element.appendChild(tag);
        totalPoints = 0;
        gameDone = 0;

    }

}



function update(){



    context.fillStyle="black"; // Draw black rectangle for full
    context.fillRect(0,0,board.width, board.height);
    for(let i = 0; i<rows; i++){ // Draw board if there's a piece
        for(let j = 0; j<cols; j++){
            if(boardData[i*cols + j] == -1){}
            else {
                context.fillStyle = "grey";
                context.fillRect(j*blockSize, i*blockSize, blockSize, blockSize);
                context.fillStyle = colors[boardData[i*cols + j]];
                context.fillRect(j*blockSize+boxThickness, i*blockSize+boxThickness, blockSize-2*boxThickness, blockSize-2*boxThickness);
            }
        }
    }

    let oldX = colX;
    let oldY = colY;
    if(allTheWayDown()){ // if new piece lands on where it should be placed end game
        //clearInterval(intervalID);
        gamePlaying = 0;
        gameDone = 1;
    }

    colX += velocityX*blockSize; // Change x pos based off of velocity and stop at edges
    if(colX <= 0){colX = 0;}
    if(colX >= (cols-1)*blockSize){colX = (cols-1)*blockSize;}

    colY += velocityY*blockSize; // Change y pos based off of velocity and stop at edges
    if(colY <= 0){colY = 0;}
    if(colY >= (rows-1)*blockSize){colY = (rows-1)*blockSize;}
    if(getDataAtPos(colX, colY) != -1){ // prevent going through another piece horizontally
        colX = oldX;
    }
    if(allTheWayDown()){
        setPieceAndMakeNewPiece();
    }


    drawCurrentPiece();
    startCheckForTriplets();

    if(flashing){} else {removeRows();}
    
    //removeRows();


}

function changeDirectionDown(e) {
    if (e.code == "ArrowDown"){
        velocityY = 2;
    }
    else if (e.code == "ArrowLeft"){
        velocityX = -1;
    }
    else if (e.code == "ArrowRight"){
        velocityX = 1;
    }
}
function changeDirectionUp(e) {
    if (e.code == "ArrowDown"){
        velocityY = 1;
    }
    else if (e.code == "ArrowLeft"){
        velocityX = 0;
    }
    else if (e.code == "ArrowRight"){
        velocityX = 0;
    }
    else if (e.code == "ArrowUp"){
        let temp = currPiece[0];
        for(let i = 0; i<coloumnHeight-1; i++){
            currPiece[i] = currPiece[i+1];
        }
        currPiece[coloumnHeight-1] = temp;

    }

}

function getDataAtPos(X, Y){
        return boardData[(Y/blockSize)*cols + (X/blockSize)];
}

function putDataAtPos(data, X, Y){
     boardData[(Y/blockSize)*cols + (X/blockSize)] = data;
}

function allTheWayDown(){
    currIndex = (colY / blockSize)*cols + (colX/blockSize);
    let indexOfBottomLeftMost = cols*(rows-1);
    let indexOfBottomRightMost = cols*rows-1;
    if( (indexOfBottomLeftMost <= currIndex) && (currIndex <= indexOfBottomRightMost) ){ // if position of downward most piece is at last row
        return true;
    }
    if(getDataAtPos(colX, colY+blockSize) != -1){
        return true;
    }
}

function setPieceAndMakeNewPiece(){
    for(let i = 0; i<coloumnHeight; i++){
        putDataAtPos(currPiece[i], colX, colY -(i*blockSize));
    }
    colX = blockSize *cols/2;
    colY = -blockSize;
    makeRandomPiece();
}

function drawCurrentPiece(){
    for(let i = 0; i<coloumnHeight; i++){
        context.fillStyle = "grey";  
        context.fillRect(colX, colY-(i*blockSize), blockSize, blockSize);
        context.fillStyle = colors[currPiece[i]];  
        context.fillRect(colX+boxThickness, colY-(i*blockSize)+boxThickness, blockSize-2*boxThickness, blockSize-2*boxThickness);
    }
}

function makeRandomPiece(){
    for(let i = 0; i<coloumnHeight; i++){
        currPiece[i] = Math.floor(Math.random() * numberOfColors);
    }
}

function startCheckForTriplets(){


    for(let i = rows-1; i>=0; i--){
        for(let j = cols-1; j>=0; j--){
            let currColor = boardData[i*cols + j]
            if(currColor!= -1){checkForTriplets(i, j, currColor);}
        }
    }

    let anyToFlash = 0;
    for(let i = 0; i<rows; i++){
        for(let j = 0; j<cols; j++){
            if(boardCheckData[i][j] == 1){
                anyToFlash = 1;
                //break;
            }
        }
    }

    if(anyToFlash){
        flashing = 1;
    }

}

function checkForTriplets(Y, X, color){
    let directionVectors = [
        [1,0],
        [1,1],
        [0,1],
        [-1,1],
        [-1, 0],
        [-1,-1],
        [0, -1],
        [1, -1]
    ];

    let origY = Y;
    let origX = X;

    for(let d = 0; d<8; d++){
        Y = origY + directionVectors[d][0];
        X = origX + directionVectors[d][1];
        if(withinBounds(X, Y)){ // if spot in direction d is within the box
            if(boardData[Y*cols + X] == color){ // if 2nd piece is same color begin checking that direction forever
                // the reason we don't do both of these checks in same if statement is so that we don't try to accesss out of bounds of boardData
                Y+= directionVectors[d][0];
                X+= directionVectors[d][1];
                if(withinBounds(X, Y)){
                    if(boardData[Y*cols + X] == color){ // if 3rd piece is same color mark as a 3 or more connection
                        let Xtriplet = X;
                        let Ytriplet = Y;

                        boardCheckData[Ytriplet][Xtriplet] = 1; // marking first 3 pieces as in a row
                        Ytriplet-= directionVectors[d][0];
                        Xtriplet-= directionVectors[d][1];
                        
                        boardCheckData[Ytriplet][Xtriplet] = 1;
                        Ytriplet-= directionVectors[d][0];
                        Xtriplet-= directionVectors[d][1];


                        boardCheckData[Ytriplet][Xtriplet] = 1;
                        
                        


                        let sameColorFlag = 1; // check forever in that direction and mark if appropriate
                        while (sameColorFlag){
                            Y+= directionVectors[d][0];
                            X+= directionVectors[d][1];
                            if(withinBounds(X, Y)){
                                if(boardData[Y*cols + X] == color){
                                    boardCheckData[Y][X] = 1
                                }else {sameColorFlag = 0;}
                            } else{sameColorFlag = 0;}
                        }
                    }
                }
                
            }
        }
    }
}

function withinBounds(X, Y){
    if((Y < rows && Y >= 0 && X < cols && X >= 0)){return true;}
    return false;

}

function removeRows(){



    let points = 0;




    for(let j = cols-1; j>=0; j--){
        let tempWholeColoumn = []; // create temporary data storage for the entire coloumn on canvas
        let indexTempWholeColoumn = rows-1;
        for(let j = 0; j<rows; j++){
            tempWholeColoumn[j] = -1;
        }
        let i = rows-1;
        while(i >=0){ // go up that coloumn on canvas and if it's marked ignore it, if it isn't add it to temp data storage for entire coloumn on canvas
            if(boardCheckData[i][j] == 1){
                i--;
                points +=10;
            } else{
                tempWholeColoumn[indexTempWholeColoumn] = boardData[i*cols+j];
                indexTempWholeColoumn--;
                i--;
            }
        }

        for(let i=rows-1; i>=0; i--){
            boardData[i*cols + j] = tempWholeColoumn[i];
        }
    }
    boardCheckData = Array.from({ length: rows }, () => Array(cols).fill(0)); // 0 means not checked yet or no connection yet & 1 means it's in a row
    totalPoints += points;

    pointsText.textContent = totalPoints;
}

function printBoard(){
     for(let i = 0; i<rows; i++){
        console.log(boardCheckData[i]);
     }
    }