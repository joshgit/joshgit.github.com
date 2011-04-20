
var DEBUG = false,
   NONE = 0, LEFT = 1, RIGHT = 2, UP = 3, DOWN = 4;

function get(s) { return document.getElementById(s); }

function Coin(x, y, w, h) {
   var _div = document.createElement("div");
   _div.style.position = 'absolute';
   _div.style.top = y + 'px';
   _div.style.left = x + 'px';
   _div.style.width = w + 'px';
   _div.style.height = h + 'px';
   _div.style.backgroundColor = '#ba0';
   
   this._top = y;
   this._bottom = y + h;
   this._left = x;
   this._right = x + w;

   this.getDiv = function() {
      return _div;
   };
}

function Block(x, y, w, h, c, background, numCoins) {
   var _div = document.createElement("div");
   _div.style.position = 'absolute';
   _div.style.top = y + 'px';
   _div.style.left = x + 'px';
   _div.style.width = w + 'px';
   _div.style.height = h + 'px';
   _div.style.backgroundColor = c;
   _div.style.border = '1px solid #999';

   this.getDiv = function() {
      return _div;
   };
   this._left = x;
   this._right = x + w;
   this._top = y;
   this._bottom = y + h;

   var bumpShift = 4, BUMP_MS = 125;
   
   this.hit = function(guy, dirFrom) {
      if (dirFrom == DOWN) {
         guy.flipYAccel();
         if (numCoins > 0) {
            numCoins -= 1;
            if (numCoins == 0) {
               _div.style.backgroundColor = '#ca0';
            }
            _div.style.top = (y - bumpShift) + 'px';
            background.addCoin(new Coin(x + w/2, y - w, w/3, h * 3 / 4));
            window.setTimeout((function(_div){
               return function(){
                  _div.style.top = y + 'px';
               };
            })(_div), BUMP_MS);
         }
      }
   };
}

function Guy(x, y, dx, dy, w, h, c) {
   var _div = document.createElement("div");
   _div.style.position = 'absolute';
   _div.style.top = y;
   _div.style.left = x;
   _div.style.width = w;
   _div.style.height = h;
   _div.style.backgroundColor = c;
   
   this.getLeft = function() { return x; };
   this.getRight = function() { return x + w; };
   this.getTop = function() { return y; };
   this.getBottom = function() { return y + h; };
   
   var alive = true;
   this.getAlive = function() { return alive; };
   
   this.kill = function() {
      _div.style.backgroundColor = '#999';
      alive = false;
   };
   
   this.collideWith = function(playerGuy) {
      if (!alive || !playerGuy.getAlive()) {
         return
      }
      if (x > playerGuy.getRight() || x + w < playerGuy.getLeft() ||
         y > playerGuy.getBottom() || y + h < playerGuy.getTop()) {
         return;
      }
      if (y + h <= playerGuy.getBottom()) {
         playerGuy.kill();
         dy = JUMP_ACCEL/2;
      }
      else {
         this.kill();
         dy = JUMP_ACCEL/2;
         playerGuy.forceJump();
      }
   };

   this.getDiv = function() {
      return _div;
   };
   
   this.willHitBlock = function(block) {
      if (block._left > x + w ||
          block._right < x) {
         return false;
      }
      return Math.abs(block._top - (y + h)) < 2 || Math.abs(block._bottom - y) < 2;
   };
   
   this.overlaps = function(coin) {
      var myLeft = x, myRight = x + w, myTop = y, myBottom = y + h;
      var notOverlapping = coin._left > myRight || coin._right < myLeft || coin._top > myBottom || coin._bottom < myTop;
      return !notOverlapping;
   };

   var X_ACCEL = 0.4, 
      JUMP_ACCEL = -6.5, 
      GRAVITY_ACCEL = 0.6,
      dirPressed = NONE,
      justHitBlock = false;
   
   this.move = function(block) {
      if (!alive) {
         dx = 0;
         dy += GRAVITY_ACCEL;
         y += dy;
         _div.style.top = Math.round(y) + 'px';
         _div.style.left = Math.round(x) + 'px';
         return;
      }
   
      // make sure we dont accelerate too much.
      if (dy > 4.0) {
         dy = 4.0;
      }
      if (dx > 4.0) {
         dx = 4.0;
      }
      else if (dx < -4.0) {
         dx = -4.0;
      }
      
      // accel downwards by 1px/frame
      dy += GRAVITY_ACCEL;
      
      // only stick to block is accel is not negative
      justHitBlock = false;
      if (block) {
         if (dy >= 0.0 && Math.abs(block._top - (y + h)) < 2) { // going down
            y = block._top - h; // set guy to be walking exactly on top of block
            dy = 0.0;
            justHitBlock = true;
         }
         else if (dy <= 0.0 && Math.abs(block._bottom - y) < 2) { // going up
         
            // try reversing y accel in block hit method instead of zeroing it here
            // dy = 0.0;
            
            block.hit(this, DOWN);
         }
      }
      y += dy;

      if (dirPressed == LEFT) {
         dx -= X_ACCEL;
      }
      else if (dirPressed == RIGHT) {
         dx += X_ACCEL;
      }
      else {
         // slow horiz accel
         if (dx <= -X_ACCEL) {
            dx += X_ACCEL;
         }
         else if (dx >= X_ACCEL) {
            dx -= X_ACCEL;
         }
         else {
            dx = 0.0;
         }
      }
      
      x += dx;

      _div.style.top = Math.round(y) + 'px';
      _div.style.left = Math.round(x) + 'px';
   };
   
   this.flipYAccel = function() {
      dy = -dy;
   };
   
   this.jump = function() {
      if (justHitBlock && Math.abs(dy) < 0.1) {
         dy = JUMP_ACCEL;
      }
   };
   this.forceJump = function() {
      dy = JUMP_ACCEL;
   };
   this.duck = function() {
      // do nothing now
   };
   this.moveLeft = function() {
      dirPressed = LEFT;
   };
   this.moveRight = function() {
      dirPressed = RIGHT;
   };
   this.stopLeft = function() {
      dirPressed = NONE;
   };
   this.stopRight = function() {
      dirPressed = NONE;
   };
}

function BackgroundPanel(w, h) {
   var _div = document.createElement("div");
   _div.style.position = 'relative';
   _div.style.width = w;
   _div.style.height = h;
   _div.style.backgroundColor = '#acf';

   this.getDiv = function() {
      return _div;
   };
   
   var myBlocks = [];
   
   this.addBlock = function(b) {
      myBlocks.push(b);
      _div.appendChild(b.getDiv());
   };

   var myGuy;

   this.addGuy = function(g) {
      myGuy = g;
      _div.appendChild(g.getDiv());
   };

   var myEnemies = [];

   this.addEnemy = function(e) {
      myEnemies.push(e);
      _div.appendChild(e.getDiv());
   };

   var myCoins = [];
   this.addCoin = function(c) {
      myCoins.push(c);
      _div.appendChild(c.getDiv());
   };

   var willHitBlock = function(guy) {
      for (var i = 0; i < myBlocks.length; i++) {
         if (guy.willHitBlock(myBlocks[i])) {
            return myBlocks[i];
         }
      }
      return false;
   };

   this.moveGuys = function() {
      if (myGuy) {
         myGuy.move(willHitBlock(myGuy));
         if (myGuy.getTop() > h) {
            _div.removeChild(myGuy.getDiv());
            myGuy = null;
         }
      }

      for (var e = 0; e < myEnemies.length; e++) {
         myEnemies[e].move(willHitBlock(myEnemies[e]));
         if (myGuy) {
            myEnemies[e].collideWith(myGuy);
         }
         if (myEnemies[e].getTop() > h) {
            _div.removeChild(myEnemies[e].getDiv());
            myEnemies.splice(e, 1);
         }
      }

      for (var k = 0; k < myCoins.length; k++) {
         if (myGuy && myGuy.overlaps(myCoins[k])) {
            _div.removeChild(myCoins[k].getDiv());
            myCoins.splice(k, 1);
         }
      }
   };
}

function Game(settings) {
   var back = new BackgroundPanel(settings.width, settings.height);
   for (var k = 0; k < 8; k++) {
      var b = new Block(100 + k * 10, 100, 10, 10, '#ec0', back, 0);
      back.addBlock(b);
   }
   b = new Block(120, 70, 10, 10, '#ec0', back, 1);
   back.addBlock(b);

   var g = new Guy(100, 90, 0, 0, 10, 10, '#ca0');
   back.addGuy(g);
   var e = new Guy(130, 90, -10, 0, 10, 10, '#0ac');
   back.addEnemy(e);

   var mainDiv = get(settings.mainDiv);
   mainDiv.appendChild(back.getDiv());

   window.setInterval((function(b){
      return function() {
         b.moveGuys();
      };
   })(back), 50);

   var callback = (function(back, guy) {
      return function(e) {
      
         if (!e && window.event) {
            e = window.event;
         }

         if (e.keyCode == 82) { // r pressed
            // bm.resetGame();
            return;
         }

         /*
         if (!bm.isPlaying()) {
            return;
         }
         */

         if (e.keyCode == 38) {
            // guy.stopJump();
         }
         else if (e.keyCode == 40) {
            // guy.stopDuck();
         }
         else if (e.keyCode == 37) {
            guy.stopLeft();
         }
         else if (e.keyCode == 39) {
            guy.stopRight();
         }
      };
   })(back, g);
   if (window.addEventListener){
      window.addEventListener('keyup', callback, true);
   } else if (window.attachEvent){
      // mainDiv.attachEvent('keyup', callback);
      mainDiv.onkeyup = callback;
   } else {
      alert("can't attach keyup listener");
   }

   callback = (function(back, guy) {
      return function(e) {

         if (!e && window.event) {
            e = window.event;
         }

         if (e.keyCode == 38) {
            guy.jump();
         }
         else if (e.keyCode == 40) {
            guy.duck();
         }
         else if (e.keyCode == 37) {
            guy.moveLeft();
         }
         else if (e.keyCode == 39) {
            guy.moveRight();
         }
      };
   })(back, g);
   if (window.addEventListener){
      window.addEventListener('keydown', callback, true);
   } else if (window.attachEvent){
      // mainDiv.attachEvent('keydown', callback);
      mainDiv.onkeydown = callback;
   } else {
      alert("can't attach keydown listener");
   }
}

