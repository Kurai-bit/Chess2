import "../css/chess_style.scss";
import $ from "jquery";


const letters = "abcdefgh";
const piecesNameArray = ["rb","nb","bb","kb","qb","r","n","b","k","q","pb","p"];
const matrix={
    "a8":"rb","b8":"nb","c8":"bb","d8":"qb","e8":"kb","f8":"bb","g8":"nb","h8":"rb",
    "a7":"pb","b7":"pb","c7":"pb","d7":"pb","e7":"pb","f7":"pb","g7":"pb","h7":"pb",
    "a6":"e","b6":"e","c6":"e","d6":"e","e6":"e","f6":"e","g6":"e","h6":"e",
    "a5":"e","b5":"e","c5":"e","d5":"e","e5":"e","f5":"e","g5":"e","h5":"e",
    "a4":"e","b4":"e","c4":"e","d4":"a","e4":"e","f4":"e","g4":"e","h4":"e",
    "a3":"e","b3":"e","c3":"e","d3":"e","e3":"e","f3":"e","g3":"e","h3":"e",
    "a2":"p","b2":"p","c2":"p","d2":"p","e2":"p","f2":"p","g2":"p","h2":"p",
    "a1":"r","b1":"n","c1":"b","d1":"q","e1":"k","f1":"b","g1":"n","h1":"r",
};
let game = Object.assign({},matrix);
let cell = Object.keys(game);

let turn = "white";
let isGameOn = true;
let pieceNameLength;
let draggableBeat;

let from;
let to;
let pieceType;

$("body").append("<div class='containerButtons' ></div>")
$(".containerButtons").append("<input type='email' id='email' class='input' placeholder='your@email.here'>")
$(".containerButtons").append("<button class='startGame'>Start Game</button>");
$(".startGame").bind("click",()=>{
    if ($("#email").val() !== ""){
        if (isGameOn){
            isGameOn = !isGameOn;
            user();
            $(".containerButtons").append("<button class='loadLast'>Load Last</button>");
            $(".loadLast").bind("click",()=>{
                ajaxGet();

            });

            $(".input").css("display","none");
            $(".containerButtons").css('display', 'flex');
            $(".containerButtons").css('flex-direction',' row');
            if (localStorage.getItem("gameMap") && localStorage.getItem("gameStat")){
                game = JSON.parse(localStorage.getItem("gameMap"));
                turn = localStorage.getItem("gameStat");
            }
            else {
                game = Object.assign({},matrix);
                turn = "white";
            }
            generateGame();
        }
        else{
            game = Object.assign({},matrix);
            turn = "white"
            localStorage.setItem("gameStat", turn);
            localStorage.setItem("gameMap", JSON.stringify(game));
            placeThePieces();
        }
        $(".potential").toggleClass("potential");
        $(".beat").toggleClass("beat");
        $(".piece-ready").toggleClass("piece-ready");
        $("body .startGame").removeAttr("style");
    }else {
        alert("Write your email");
    }
});


function createTable(){

    const main = document.createElement("div");
    main.setAttribute("class","main");
    document.body.appendChild(main);

    let l ;
    let color;
    let colorCheck = true;
    for (let i = 8; i >= 1;i--){
        for (l of letters){
          const child = document.createElement("div");
          child.setAttribute("id", l+i);
          colorCheck ? color = "white-box" : color = "black-box",colorCheck = !colorCheck;
          child.setAttribute("class","chess-box "+color);
          main.appendChild(child);

        }
        colorCheck = !colorCheck;
    }
}

function placeThePieces(){
    if (localStorage.getItem("gameMap") && localStorage.getItem("gameStat")){
        game = JSON.parse(localStorage.getItem("gameMap"));
        turn = localStorage.getItem("gameStat");
    }
    let dele = $(".chess-box img");
    for (let i of dele){
        $(i).remove();
    }

    for (let i =0; i<piecesNameArray.length;i++){
        let location;
        let dark;
        if(piecesNameArray[i].length === 2){
            location = "Negru";
            dark = "";
        }
        else {
            location = "Alb"
            dark = "l";
        }
        let piecesName = piecesNameArray[i];
        piecesName = document.createElement("img");
        piecesName.setAttribute("src", "../src/img/"+location+"/Chess_"+piecesNameArray[i]+dark+"t45.svg");
        piecesName.classList.add("piesa");
        piecesName.setAttribute("draggable","true");
        piecesName.addEventListener('dragstart', DragStart);
        for (let j of cell) {
            if (game[j] === piecesNameArray[i]){
                document.getElementById(j).appendChild(piecesName.cloneNode());
            }
        }
    }
    $(".potential").toggleClass("potential");
    $(".beat").toggleClass("beat");
    dragNDrop();

}
function moveFrom(arg){
    let aa;
    if(this === undefined){
        aa = arg;
    }else {
        aa = this;
    }
    if (turn === "white" && game[aa.parentElement.id].length === 1 && (game[aa.parentElement.id] !== "e")){
        $(".piece-ready").toggleClass("piece-ready")
        aa.parentElement.classList.toggle("piece-ready");
        from = aa.parentElement.id;
        pieceType = game[from];
        console.log(pieceType);
        console.log("from "+from);
        potentialMoveLight();
        potentialBeatPiecesLight();
    }
    else if (turn === "black" && game[aa.parentElement.id].length === 2 && (game[aa.parentElement.id] !== "e")){
        $(".piece-ready").toggleClass("piece-ready");
        aa.parentElement.classList.toggle("piece-ready");
        from = aa.parentElement.id;
        pieceType = game[from];
        console.log(pieceType);
        console.log("from "+from);
        potentialMoveDark();
        potentialBeatPiecesDark();
    }
    if(turn === "white" && game[aa.parentElement.id].length === 2 && pieceType.length === 1){
        if (pieceType !== undefined) {
            to=aa.parentElement.id;
            if($(`#${to}`).hasClass("beat")){
                game[aa.parentElement.id] = game[from];
                game[from] = "e";
                if (turn ==="white"){
                    turn = "black";
                }
                else{
                    turn = "white"
                }
            }
            else {
                console.log("fuck you")
            }
            localStorage.setItem("gameMap", JSON.stringify(game));
            localStorage.setItem("gameStat", turn);
            placeThePieces();
            ajaxPost();
        }
    }
    else if(turn === "black" && game[aa.parentElement.id].length === 1 && pieceType.length === 2){
        if (pieceType !== undefined) {
            to=aa.parentElement.id;
            if($(`#${to}`).hasClass("beat")){
                game[aa.parentElement.id] = game[from];
                game[from] = "e";
                if (turn ==="white"){
                    turn = "black";
                }
                else{
                    turn = "white"
                }
            }
            else {
                console.log("fuck you")
            }
            localStorage.setItem("gameMap", JSON.stringify(game));
            localStorage.setItem("gameStat", turn);
            placeThePieces();
            ajaxPost();
        }
    }

}
function moveFromDrag(arg){
    if(turn === "white" && game[arg.parentElement.id].length === 2 && pieceType.length === 1){
        if (pieceType !== undefined) {
            to=arg.parentElement.id;
            if($(`#${to}`).hasClass("beat")){
                game[arg.parentElement.id] = game[from];
                game[from] = "e";
                if (turn ==="white"){
                    turn = "black";
                }
                else{
                    turn = "white"
                }
            }
            else {
                console.log("fuck you")
            }
            localStorage.setItem("gameMap", JSON.stringify(game));
            localStorage.setItem("gameStat", turn);
            placeThePieces();
            ajaxPost();
        }
    }
    else if(turn === "black" && game[arg.parentElement.id].length === 1 && pieceType.length === 2){
        if (pieceType !== undefined) {
            to=arg.parentElement.id;
            if($(`#${to}`).hasClass("beat")){
                game[arg.parentElement.id] = game[from];
                game[from] = "e";
                if (turn ==="white"){
                    turn = "black";
                }
                else{
                    turn = "white"
                }
            }
            else {
                console.log("fuck you")
            }
            localStorage.setItem("gameMap", JSON.stringify(game));
            localStorage.setItem("gameStat", turn);
            placeThePieces();
            ajaxPost();
        }
    }
}

function moveTo(arg){
    let aa;
    if(this === undefined){
        aa = arg;
    }else {
        aa = this;
    }
    to = aa.id;
    if($(`#${to}`).hasClass("potential")){
        if (turn ==="white"){
            turn = "black";
        }
        else{
            turn = "white"
        }
        console.log("to "+to);
        game[to] = game[from];
        game[from] = "e";
        console.log("from "+from);
        localStorage.setItem("gameMap", JSON.stringify(game));
        localStorage.setItem("gameStat", turn);
        placeThePieces();
        ajaxPost();

    }
}


function searchFreeBoxes(){
    $(document).on('click','.chess-box:empty',moveTo);

}
function searchPieces(){
    $(document).on('click','.chess-box img', moveFrom);
}

function event(){
    searchPieces()
    searchFreeBoxes()
}
let posMove = [];
function potentialMoveLight(){
    if (turn ==="white"){
        pieceNameLength = 1;
    }
    else{
        pieceNameLength = 2;
    }
    $(".potential").toggleClass("potential");
    posMove = [];
    if( pieceType === "p"){
        if(matrix[from] === game[from]){
            for(let i = +from[1]+1; i<+from[1]+3;i++){
                if(game[`${from[0]}${i}`] === "e"){
                    $(`#${from[0]}${i}`).toggleClass("potential");
                    posMove.push(`#${from[0]}${i}`);
                }

            }
        }

        else{
            for(let i = +from[1]+1; i<+from[1]+2;i++){
                if(game[`${from[0]}${i}`] === "e"){
                    $(`#${from[0]}${i}`).toggleClass("potential");
                    posMove.push(`#${from[0]}${i}`);
                }
            }
        }
    }
    console.log(posMove)
    if(pieceType === "b"){
        piecesVector(1, 1,1, 1);
        piecesVector(1, -1,1, -1);
        piecesVector(-1, 1,-1, 1);
        piecesVector(-1, -1,-1, -1);
    }
    if(pieceType === "r"){
        piecesVector(1, 0, 1, 0);
        piecesVector(-1,0,-1,0);
        piecesVector(0,1,0,1);
        piecesVector(0,-1,0,-1);
    }
    if(pieceType === "q"){
        piecesVector(1, 1,1, 1);
        piecesVector(1, -1,1, -1);
        piecesVector(-1, 1,-1, 1);
        piecesVector(-1, -1,-1, -1);
        piecesVector(1, 0, 1, 0);
        piecesVector(-1,0,-1,0);
        piecesVector(0,1,0,1);
        piecesVector(0,-1,0,-1);
    }
    if (pieceType === "n"){
        knightVector(2,1);
        knightVector(2,-1);
        knightVector(1,2);
        knightVector(-1,2);

        knightVector(-2,1);
        knightVector(-2,-1);
        knightVector(1,-2);
        knightVector(-1,-2);
    }
    if (pieceType === "k"){
        king(1,0,0,0);
        king(-1,0,0,0);
        king(0,1,0,0);
        king(0,-1,0,0);
        king(1,1,0,0);
        king(1,-1,0,0);
        king(-1,1,0,0);
        king(-1,-1,0,0);
    }
}
function king(figure,letter,figureVector,letterVector){
    let asciiOfIdString = from[0].charCodeAt(0);
    let i = figure;
    let ci = figureVector;
    let l = letter;
    let li = letterVector;
    let contor=0;
    while(contor<3){
        if (game[`${String.fromCharCode((asciiOfIdString + l))}${+from[1] + i}`] === "e") {
            $(`#${String.fromCharCode((asciiOfIdString + l))}${+from[1] + i}`).toggleClass("potential");
            posMove.push(`#${String.fromCharCode((asciiOfIdString + l))}${+from[1] + i}`);
        }else {
            if(`${String.fromCharCode((asciiOfIdString + l))}`!== "`" && `${String.fromCharCode((asciiOfIdString + l))}`!== "i" && game[`${String.fromCharCode((asciiOfIdString + l))}${+from[1] + i}`] !== undefined) {
                if (game[`${String.fromCharCode((asciiOfIdString + l))}${+from[1] + i}`].length !== pieceNameLength){
                    $(`#${String.fromCharCode((asciiOfIdString + l))}${+from[1] + i}`).toggleClass("beat");
                }
            }

            break;
        }
        i += ci;
        l += li;
        contor += 1;
    }
}

function knightVector(figure, letter){
    let asciiOfIdString = from[0].charCodeAt(0);
    let i = figure;
    let l = letter;
    // posMove = [];
    if(game[`${String.fromCharCode((asciiOfIdString + l))}${+from[1] + i}`] === "e") {
        $(`#${String.fromCharCode((asciiOfIdString + l))}${+from[1] + i}`).toggleClass("potential");
        posMove.push(`#${String.fromCharCode((asciiOfIdString + l))}${+from[1] + i}`);
    }else {
        if(`${String.fromCharCode((asciiOfIdString + l))}`!== "`" && `${String.fromCharCode((asciiOfIdString + l))}`!== "i" && game[`${String.fromCharCode((asciiOfIdString + l))}${+from[1] + i}`] !== undefined) {
            if (game[`${String.fromCharCode((asciiOfIdString + l))}${+from[1] + i}`].length !== pieceNameLength){
                $(`#${String.fromCharCode((asciiOfIdString + l))}${+from[1] + i}`).toggleClass("beat");
            }
        }
    }
    console.log(posMove)
}

function potentialMoveDark(){
    if (turn ==="white"){
        pieceNameLength = 1;
    }
    else{
        pieceNameLength = 2;
    }
    $(".potential").toggleClass("potential");
    if( pieceType === "pb"){
        if(matrix[from] === game[from]){
            for(let i = +from[1]-1; i>+from[1]-3;i--){
                if(game[`${from[0]}${i}`] === "e"){
                    $(`#${from[0]}${i}`).toggleClass("potential");
                    posMove.push(`#${from[0]}${i}`);
                }
            }
        }
        else{
            for(let i = +from[1]-1; i>+from[1]-2;i--){
                if(game[`${from[0]}${i}`] === "e"){
                    $(`#${from[0]}${i}`).toggleClass("potential");
                    posMove.push(`#${from[0]}${i}`);
                }
            }
        }
    }
    if(pieceType === "bb"){
        piecesVector(1, 1,1, 1);
        piecesVector(1, -1,1, -1);
        piecesVector(-1, 1,-1, 1);
        piecesVector(-1, -1,-1, -1);
    }
    if(pieceType === "rb"){
        piecesVector(1, 0, 1, 0);
        piecesVector(-1,0,-1,0);
        piecesVector(0,1,0,1);
        piecesVector(0,-1,0,-1);
    }
    if(pieceType === "qb"){
        piecesVector(1, 1,1, 1);
        piecesVector(1, -1,1, -1);
        piecesVector(-1, 1,-1, 1);
        piecesVector(-1, -1,-1, -1);
        piecesVector(1, 0, 1, 0);
        piecesVector(-1,0,-1,0);
        piecesVector(0,1,0,1);
        piecesVector(0,-1,0,-1);
    }
    if (pieceType === "nb"){
        knightVector(2,1);
        knightVector(2,-1);
        knightVector(1,2);
        knightVector(-1,2);

        knightVector(-2,1);
        knightVector(-2,-1);
        knightVector(1,-2);
        knightVector(-1,-2);
    }
    if (pieceType === "kb"){
        king(1, -1,0,1);
        king(-1, -1,0,1);
        king(0, -1,0,1);
        king(0, 1,0,0);
        king(1, 0,0,0);
        king(-1, 0,0,0);
    }

}
function piecesVector(figure,letter,figureVector,letterVector){
    let asciiOfIdString = from[0].charCodeAt(0);
    let i = figure;
    let ci = figureVector;
    let l = letter;
    let li = letterVector;
    let contor=0;

    while(contor<8){
        if (game[`${String.fromCharCode((asciiOfIdString + l))}${+from[1] + i}`] === "e") {
            $(`#${String.fromCharCode((asciiOfIdString + l))}${+from[1] + i}`).toggleClass("potential");
            posMove.push(`#${String.fromCharCode((asciiOfIdString + l))}${+from[1] + i}`);
            posMove.push(`#${String.fromCharCode((asciiOfIdString + l))}${+from[1] + i}`);
        }else {
            if(`${String.fromCharCode((asciiOfIdString + l))}`!== "`" && `${String.fromCharCode((asciiOfIdString + l))}`!== "i" && game[`${String.fromCharCode((asciiOfIdString + l))}${+from[1] + i}`] !== undefined) {
                if (game[`${String.fromCharCode((asciiOfIdString + l))}${+from[1] + i}`].length !== pieceNameLength){
                    $(`#${String.fromCharCode((asciiOfIdString + l))}${+from[1] + i}`).toggleClass("beat");

                }
            }
            break;
        }
        i += ci;
        l += li;
        contor += 1;
    }
}



function potentialBeatPiecesLight(){
    if (pieceType === "p"){
        let asciiOfIdString = from[0].charCodeAt(0);
        if(`${String.fromCharCode((asciiOfIdString-1))}`!== "`" ){
            if($(`#${String.fromCharCode((asciiOfIdString-1))}${from[1]+1}`)!==null && game[`${String.fromCharCode((asciiOfIdString-1))}${+from[1]+1}`].length === 2){
                $(`#${String.fromCharCode((asciiOfIdString-1))}${+from[1]+1}`).toggleClass("beat");
            }
        }
        if(`${String.fromCharCode((asciiOfIdString+1))}`!== "i" ){
            if($(`#${String.fromCharCode((asciiOfIdString+1))}${from[1]+1}`)!==null && game[`${String.fromCharCode((asciiOfIdString+1))}${+from[1]+1}`].length === 2  ){
                $(`#${String.fromCharCode((asciiOfIdString+1))}${+from[1]+1}`).toggleClass("beat");
            }
        }
    }
}
function potentialBeatPiecesDark(){
    if (pieceType === "pb"){
        let asciiOfIdString = from[0].charCodeAt(0);
        if(`${String.fromCharCode((asciiOfIdString-1))}`!== "`" ){
            if($(`#${String.fromCharCode((asciiOfIdString-1))}${from[1]-1}`)!==null && game[`${String.fromCharCode((asciiOfIdString-1))}${+from[1]-1}`].length === 1 && game[`${String.fromCharCode((asciiOfIdString-1))}${+from[1]-1}`] !== "e"){
                $(`#${String.fromCharCode((asciiOfIdString-1))}${+from[1]-1}`).toggleClass("beat");
            }
        }
        if(`${String.fromCharCode((asciiOfIdString+1))}`!== "i" ){
            if($(`#${String.fromCharCode((asciiOfIdString+1))}${from[1]-1}`)!==null && game[`${String.fromCharCode((asciiOfIdString+1))}${+from[1]-1}`].length === 1  && game[`${String.fromCharCode((asciiOfIdString+1))}${+from[1]-1}`] !== "e"){
                $(`#${String.fromCharCode((asciiOfIdString+1))}${+from[1]-1}`).toggleClass("beat");
            }
        }

    }
}
function DragStart(){
    console.log("askjdlkajdlk: " + this.id);
    moveTo.bind(this);
}

function dragNDrop(){
    $(document).on("dragstart",".chess-box img",moveFrom)
    $(document).on("dragend",".chess-box img",function (e){
        e.preventDefault();
        moveFromDrag(draggableBeat);
        console.log("end")
    });
    $(document).on("dragenter",".chess-box:empty",function (e){
        e.preventDefault();
    });
    $(document).on("dragenter",".chess-box img",function (e){
        e.preventDefault();
        draggableBeat = this;

    });
    $(document).on("dragover",".chess-box img",function (e){
        e.preventDefault();
    });
    $(document).on("dragover",".chess-box:empty",function (e){
        e.preventDefault();
    });
    $(document).on("drop",".chess-box", moveTo);
}


function user(){
    $.ajax({
        method: "POST",
        url: "https://vlad-matei.thrive-dev.bitstoneint.com/wp-json/chess-api/v1/user",
        data: {
            "email": $("#email").val()
        }
    }).done(()=>{
        console.log("asdadadssadadsasdhakhdkahdkjsakhd");
    })
}
function ajaxPost(){
    $.ajax({
        method: "POST",
        url: "https://vlad-matei.thrive-dev.bitstoneint.com/wp-json/chess-api/v1/data",
        data: {
            "email": $("#email").val(),
            "key": "chessTM",
            "timestamp": "chess",
            data: {
                game,
                turn
            }
        }
    }).done(function( msg ) {
        console.log( "Data Saved: " + msg );
    });
}
function ajaxGet(){
    $.ajax({
        method: "GET",
        url: "https://vlad-matei.thrive-dev.bitstoneint.com/wp-json/chess-api/v1/data",
        data: {
            "email": $("#email").val(),
            "key": "chessTM",
            "timestamp": "chess",
        }
    }).done(function( response ) {
       localStorage.setItem("gameMap",JSON.stringify(response.data[0].value.game))
       localStorage.setItem("gameStat",response.data[0].value.turn)
        placeThePieces();
        event();
        //ajaxPost();
    });
}

function keyboard(){
    let asd = true;
    if(asd){
        asd = !asd;
        from = "e1";
    }
    document.addEventListener('keydown', (event) => {
        let asciiOfIdString = from[0].charCodeAt(0);
        let name = event.key;
        if(name === "w"){
            if ($(`#${String.fromCharCode((asciiOfIdString))}${+from[1]+1}`)[0].hasChildNodes()){
                moveFrom($(`#${String.fromCharCode((asciiOfIdString))}${+from[1]+1}`)[0].firstChild)
                console.log("asdad")
            }
            else {
                console.log($(`#${String.fromCharCode((asciiOfIdString))}${+from[1]+1}`)[0])
                moveTo($(`#${String.fromCharCode((asciiOfIdString))}${+from[1]+1}`)[0])
            }

        }if(name === "a"){
            moveFrom($(`#${String.fromCharCode((asciiOfIdString-1))}${from[1]}`)[0].firstChild)
        }if(name === "s"){
            moveFrom($(`#${String.fromCharCode((asciiOfIdString))}${+from[1]-1}`)[0].firstChild)
        }if(name === "d"){
            moveFrom($(`#${String.fromCharCode((asciiOfIdString+1))}${from[1]}`)[0].firstChild)
        }
        if(name === "Enter"){
            moveFrom($(`#${String.fromCharCode((asciiOfIdString))}${from[1]}`)[0].firstChild)
        }
    }, false);
}

function random(){
    let piese = [];
    let sorted=[];
    let asciiOfIdString;
    document.addEventListener('keypress', (event) => {
        if(event.key === " "){
            if (turn === "white"){
                for (let j of cell) {
                    from = j;
                    asciiOfIdString = from[0].charCodeAt(0)
                    if (game[j].length === 1 && game[j] !=="e") {
                        piese.push(game[j]);
                        moveFrom($(`#${String.fromCharCode((asciiOfIdString))}${from[1]}`)[0].firstChild)
                        if(posMove.length !== 0){
                            sorted.push(j)
                        }
                    }
                }
                turn = "black";
            }
            if (turn === "black"){
                for (let j of cell) {
                    from = j;
                    asciiOfIdString = from[0].charCodeAt(0)
                    if (game[j].length === 2) {
                        piese.push(game[j]);
                        moveFrom($(`#${String.fromCharCode((asciiOfIdString))}${from[1]}`)[0].firstChild)
                        if(posMove.length !== 0){
                            sorted.push(j)
                        }
                    }
                }
                turn = "white";
            }
            console.log("piese "+piese)
            piese = []
            console.log("sorted ",sorted)
            let randomPiece = sorted[Math.floor(Math.random()*sorted.length)];
            moveFrom($(`#${randomPiece}`)[0].firstChild);
            let randMov = posMove[Math.floor(Math.random()*posMove.length)];
            console.log(randMov)
            moveTo($(`${randMov}`)[0])
            console.log(randomPiece)
            sorted=[]
            posMove =[]
        }
    });
}

function generateGame(){
    createTable();
    placeThePieces();
    event();
}

// generateGame();
random();
keyboard();