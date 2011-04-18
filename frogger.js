
function WaterRow(gameSettings, settings) {
   var myWidth = gameSettings.getWidth();
   var myHeight = gameSettings.getRowHeight();
   var myLogs = [];
   for (var k = 0; k < settings.numCars; k++) {
      myLogs.push(Math.floor(Math.random() * myWidth));
   }
   var myLogDivs = [];

   this.moveCars = function() {
      if (settings.dir) {
         if (myFrog) {
            myFrog.drift(-settings.carVel);
         }
      }
      else {
         if (myFrog) {
            myFrog.drift(settings.carVel);
         }
      }
      for(var i = 0; i < myLogs.length; i++) {
         if (settings.dir) {
            if (myLogs[i] < -settings.carWidth) {
               myLogs[i] = myWidth;
            }
            else {
               myLogs[i] -= settings.carVel;
            }
         }
         else {
            if (myLogs[i] > myWidth + settings.carWidth) {
               myLogs[i] = 0;
            }
            else {
               myLogs[i] += settings.carVel;
            }
         }
         myLogDivs[i].style.left = myLogs[i] + 'px';
      }
   };

   var rowDiv = document.createElement("div");

   this.addCars = function(parentId) {
      rowDiv.style.position = 'relative';
      rowDiv.style.height = myHeight + 'px';
      rowDiv.style.width = myWidth + 'px';
      rowDiv.style.backgroundColor = '#99f';
      if (DEBUG) {
         rowDiv.style.border = '1px solid #666';
      }
      else {
         rowDiv.style.overflow = 'hidden';
      }
      for(var i = 0; i < myLogs.length; i++) {
         var newDiv = document.createElement("div");
         newDiv.style.position = 'absolute';
         newDiv.style.top = '2';
         newDiv.style.left = myLogs[i] + 'px';
         newDiv.style.width = settings.carWidth + 'px';
         newDiv.style.height = (myHeight - 4) + 'px';
         newDiv.style.backgroundColor = settings.carColor;
         rowDiv.appendChild(newDiv);
         myLogDivs.push(newDiv);
      }
      document.getElementById(parentId).appendChild(rowDiv);
   };
   
   var myFrog = null;
   
   this.addFrog = function(frog) {
      myFrog = frog;
      rowDiv.appendChild(myFrog.div);
   }

   this.removeFrog = function(frog) {
      rowDiv.removeChild(myFrog.div);
      myFrog = null;
   }

   this.carHitFrog = function() {
      // if frog misses not on a log
      if (!myFrog) {
         return false;
      }
      if (!myFrog.inBounds(myWidth)) {
         return true;
      }
      var frogRange = myFrog.getXRange();
      var frogLeft = frogRange[0];
      var frogRight = frogRange[1];
      for (var f = 0; f < myLogs.length; f++) {
         // if the frog is left of current car, do nothing
         // else if the frog is right of current car, do nothing
         if (frogRight < myLogs[f]) {
         }
         else if (frogLeft > myLogs[f] + settings.carWidth) {
         }
         else {
            return false; // on current log
         }
      }
      return true;
   };

}

function ModelRow(gameSettings, settings) {

   var myWidth = gameSettings.getWidth();
   var myHeight = gameSettings.getRowHeight();
   var myCars = [];
   for (var k = 0; k < settings.numCars; k++) {
      myCars.push([Math.floor(Math.random() * myWidth), 0]);
   }
   var myCarDivs = [];

   this.moveCars = function() {
      for(var i = 0; i < myCars.length; i++) {
         if (Math.random() < 0.1) {
            myCars[i][1] = (myCars[i][1] + 1) % 2;
         }
         if (settings.dir) {
            if (myCars[i][0] < -settings.carWidth) {
               myCars[i][0] = myWidth;
            }
            else {
               myCars[i][0] -= settings.carVel + myCars[i][1];
            }
         }
         else {
            if (myCars[i][0] > myWidth + settings.carWidth) {
               myCars[i][0] = 0;
            }
            else {
               myCars[i][0] += settings.carVel + myCars[i][1];
            }
         }
         myCarDivs[i].style.left = myCars[i][0] + 'px';
      }
   };

   var rowDiv = document.createElement("div");
   
   this.addCars = function(parentId) {
      rowDiv.style.position = 'relative';
      rowDiv.style.height = myHeight + 'px';
      rowDiv.style.width = myWidth + 'px';
      if (DEBUG) {
         rowDiv.style.border = '1px solid #666';
      }
      else {
         rowDiv.style.overflow = 'hidden';
      }
      for(var i = 0; i < myCars.length; i++) {
         var newDiv = document.createElement("div");
         newDiv.style.position = 'absolute';
         newDiv.style.top = '0';
         newDiv.style.left = myCars[i][0] + 'px';
         newDiv.style.width = settings.carWidth + 'px';
         newDiv.style.height = myHeight + 'px';
         newDiv.style.backgroundColor = settings.carColor;
         rowDiv.appendChild(newDiv);
         myCarDivs.push(newDiv);
      }
      document.getElementById(parentId).appendChild(rowDiv);
   };
   
   var myFrog = null;
   
   this.addFrog = function(frog) {
      myFrog = frog;
      rowDiv.appendChild(myFrog.div);
   }

   this.removeFrog = function(frog) {
      rowDiv.removeChild(myFrog.div);
      myFrog = null;
   }

   this.carHitFrog = function() {
      if (!myFrog) {
         return false;
      }
      var frogRange = myFrog.getXRange();
      var frogLeft = frogRange[0];
      var frogRight = frogRange[1];
      for (var f = 0; f < myCars.length; f++) {
         // if the frog is left of current car, do nothing
         // else if the frog is right of current car, do nothing
         if (frogRight < myCars[f][0]) {
         }
         else if (frogLeft > myCars[f][0] + settings.carWidth) {
         }
         else {
            return true;
         }
      }
      return false;
   };

}

function Frog(myWidth, maxCols) {
   var x_loc = Math.floor(maxCols / 2) * myWidth;

   var frogDiv = document.createElement("div");
   frogDiv.id = 'frog_div';
   frogDiv.style.position = 'absolute';
   frogDiv.style.top = '0';
   frogDiv.style.left = x_loc + 'px';
   frogDiv.style.width = myWidth + 'px';
   frogDiv.style.height = '10px';
   frogDiv.style.backgroundColor = '#af6';
   this.div = frogDiv;
   
   this.getXRange = function() {
      return [x_loc, x_loc + myWidth];
   };
   this.reset = function() {
      x_loc = Math.floor(maxCols / 2) * myWidth;
      frogDiv.style.left = x_loc + 'px';
   };
   
   this.drift = function(xDelta) {
      x_loc += xDelta;
      frogDiv.style.left = x_loc + 'px';
   };
   this.moveLeft = function() {
      if (x_loc >= myWidth) {
         x_loc -= myWidth;
         frogDiv.style.left = x_loc + 'px';
      }
   };
   this.moveRight = function() {
      if (x_loc < (maxCols - 1) * myWidth) {
         x_loc += myWidth;
         frogDiv.style.left = x_loc + 'px';
      }
   };
   
   this.inBounds = function(maxWidth) {
      return x_loc >= -myWidth/2 && x_loc <= maxWidth - myWidth/2;
   };
}

function ScoreBoard(initLives, initLevel) {
   var livesSpan = document.createElement("span");
   livesSpan.id = 'lives_span';
   livesSpan.innerHTML = initLives;
   livesSpan.style.fontSize = '10px';

   var levelSpan = document.createElement("span");
   levelSpan.id = 'level_span';
   levelSpan.innerHTML = initLevel;
   levelSpan.style.fontSize = '10px';

   this.setLevel = function(n) {
      levelSpan.innerHTML = n;
   };

   this.setLives = function(n) {
      livesSpan.innerHTML = n;
   };

   this.addSelf = function(settings, parentId) {
      var rowDiv = document.createElement("div");
      rowDiv.style.position = 'relative';
      rowDiv.style.height = settings.getRowHeight() + 'px';
      rowDiv.style.width = settings.getWidth() + 'px';
      // rowDiv.style.backgroundColor = '#6af';

      var labelSpan = document.createElement("span");
      labelSpan.innerHTML = 'lives: ';
      labelSpan.style.fontSize = '10px';
      rowDiv.appendChild(labelSpan);

      rowDiv.appendChild(livesSpan);

      labelSpan = document.createElement("span");
      labelSpan.innerHTML = ' level: ';
      labelSpan.style.fontSize = '10px';
      rowDiv.appendChild(labelSpan);

      rowDiv.appendChild(levelSpan);

      if (DEBUG) {
         rowDiv.style.border = '1px solid #666';
      }
      else {
         rowDiv.style.overflow = 'hidden';
      }
      document.getElementById(parentId).appendChild(rowDiv);
   };
}

function BoardModel(settings) {
   var PLAYING = 0;
   var DEAD = 1;
   var WON = 2;
   var state = PLAYING;
   this.isPlaying = function() {
      return state === PLAYING;
   };
   this.setWon = function() {
      // state = WON;
      level += 1;
      scoreBoard.setLevel(level);
      this.resetFrog();
   };
   this.setPlaying = function() {
      state = PLAYING;
   };
   this.setDead = function() {
      lives -= 1;
      scoreBoard.setLives(lives);
      this.resetFrog();
      if (lives == 0) {
         state = DEAD;
      }
   };
   this.resetGame = function() {
      this.resetFrog();
      state = DEAD;
      // must do setTimeout > 60 so pending even will see game state is dead, before we restart.
      window.setTimeout((function(b){
         return function(){
            b.setPlaying();
            scoreBoard.setLives(3);
            scoreBoard.setLevel(1);
            b.moveCars(2000);
         };
      })(this), 100)
   };

   var lives = 3;
   var level = 1;

   var scoreBoard = new ScoreBoard(lives, level);
   scoreBoard.addSelf(settings.gameSettings, "main")

   var myRows = [];
   var mr = new ModelRow(settings.gameSettings, settings.endRow);
   mr.addCars("main");
   mr.moveCars();
   myRows.push(mr);
   for (var p = 0; p < settings.waterRows.length; p++) {
      mr = new WaterRow(settings.gameSettings, settings.waterRows[p]);
      mr.addCars("main");
      mr.moveCars();
      myRows.push(mr);
   }
   for (var p = 0; p < settings.landRows.length; p++) {
      mr = new ModelRow(settings.gameSettings, settings.landRows[p]);
      mr.addCars("main");
      mr.moveCars();
      myRows.push(mr);
   }
   mr = new ModelRow(settings.gameSettings, settings.homeRow);
   mr.addCars("main");
   mr.moveCars();
   myRows.push(mr);

   this.moveCars = function(maxIters) {
      for (var p = 0; p < myRows.length; p++) {
         myRows[p].moveCars();
         if (myRows[p].carHitFrog()) {
            this.setDead();
         }
      }
      if (this.isPlaying() && maxIters > 0) {
         window.setTimeout((function(b, newIters){
            return function(){
               b.moveCars(newIters);
            };
         })(this, maxIters - 1), 60)
      }
   };

   var frogRow = myRows.length - 1;
   
   var myFrog = new Frog(10, 15);
   myRows[frogRow].addFrog(myFrog);
   
   this.resetFrog = function() {
      if (frogRow != myRows.length - 1) {
         myFrog.reset();
         myRows[frogRow].removeFrog(myFrog);
         frogRow = myRows.length - 1;
         myRows[frogRow].addFrog(myFrog);
      }
   };
   this.advanceFrog = function() {
      if (frogRow > 0) {
         myRows[frogRow].removeFrog(myFrog);
         frogRow -= 1;
         myRows[frogRow].addFrog(myFrog);
      }
      if (frogRow == 0) {
         this.setWon();
      }
   };
   this.retreatFrog = function() {
      if (frogRow < myRows.length - 1) {
         myRows[frogRow].removeFrog(myFrog);
         frogRow += 1;
         myRows[frogRow].addFrog(myFrog);
      }
   };
   
   window.addEventListener('keyup', (function(bm, f) {
      return function(e) {
         if (e.keyCode == 82) { // r pressed
            bm.resetGame();
            return;
         }
         if (!bm.isPlaying()) {
            return;
         }
         if (e.keyCode == 38) {
            bm.advanceFrog();
         }
         else if (e.keyCode == 40) {
            bm.retreatFrog();
         }
         else if (e.keyCode == 37) {
            f.moveLeft();
         }
         else if (e.keyCode == 39) {
            f.moveRight();
         }
      };
   })(this, myFrog), true);
}

var DEBUG = false; //true;
