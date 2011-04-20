
var DEBUG = false,
   NONE = 0, LEFT = 1, RIGHT = 2, UP = 3, DOWN = 4;

function get(s) { return document.getElementById(s); }

function Sprite() {
   this.setProps = function(props) {
      var ax = props.accel.x;
      var ay = props.accel.y;
      var vx = props.vel.x;
      var vy = props.vel.y;
      var x = props.pos.x;
      var y = props.pos.y;
      this.setX = function(_x) {
         x = _x;
         _div.style.left = x + 'px';
      };
      this.shiftX = function(_dx) {
         x += _dx;
         _div.style.left = x + 'px';
      };
      this.getLeft = function() { return x; };
      this.getRight = function() { return x + w; };
      this.getMiddleX = function() { return x + w/2; };

      this.setY = function(_y) {
         y = _y;
         _div.style.top = y + 'px';
      };
      this.shiftY = function(_dy) {
         y += _dy;
         _div.style.top = y + 'px';
      };
      this.getTop = function() { return y; };
      this.getBottom = function() { return y + h; };

      this.setXVel = function(_vx) { vx = _vx; };
      this.setYVel = function(_vy) { vy = _vy; };
      this.getXVel = function() { return vx; };
      this.getYVel = function() { return vy; };
      this.trimToMaxVel = function(max) {
         // if (vy < -max) vy = -max;
         if (vy > max) vy = max;
         if (vx < -max) vx = -max;
         else if (vx > max) vx = max;
      };
      this.shiftXVel = function(_dvx) { vx += _dvx; };
      this.shiftYVel = function(_dvy) { vy += _dvy; };
      this.setAccelX = function(_ax) { ax = _ax; };
      this.setAccelY = function(_ay) { ay = _ay; };
      var w = props.width;
      var h = props.height;
      this.getWidth = function() { return w; };
      this.getHeight = function() { return h; };

      var _div = document.createElement("div");
      _div.style.position = 'absolute';
      _div.style.top = y + 'px';
      _div.style.left = x + 'px';
      _div.style.width = w + 'px';
      _div.style.height = h + 'px';
      _div.style.backgroundColor = props.color;

      this.getDiv = function() {
         return _div;
      };
   };
}

function Block(background, numCoins) {
   var bumpShift = 4, BUMP_MS = 125;
   
   this.hit = function(guy, dirFrom) {
      if (dirFrom == DOWN) {
         guy.flipYAccel();
         if (numCoins > 0) {
            numCoins -= 1;
            if (numCoins == 0) {
               this.getDiv().style.backgroundColor = '#ca0';
            }
            // _div.style.top = (y - bumpShift) + 'px';
            var origTop = this.getTop();
            this.shiftY(-bumpShift);
            var c = new Sprite();
            c.setProps({
               accel: {x: 0, y: 0},
               vel: {x: 0, y: 0},
               pos: {x: this.getMiddleX() - 1, y: origTop - this.getHeight()},
               width: this.getWidth() / 3,
               height: this.getHeight() * 3 / 4,
               color: '#ba0'
            });
            background.addCoin(c);
            window.setTimeout((function(me){
               return function(){
                  // _div.style.top = y + 'px';
                  me.shiftY(bumpShift);
               };
            })(this), BUMP_MS);
         }
      }
   };
}
Block.prototype = new Sprite();

function Guy() {

   var alive = true;
   this.getAlive = function() { return alive; };
   
   this.kill = function() {
      this.getDiv().style.backgroundColor = '#999';
      alive = false;
   };
   
   this.collideWith = function(playerGuy) {
      if (!alive || !playerGuy.getAlive()) {
         return
      }
      if (this.getLeft() > playerGuy.getRight() || this.getRight() < playerGuy.getLeft() ||
         this.getTop() > playerGuy.getBottom() || this.getBottom() < playerGuy.getTop()) {
         return;
      }
      if (this.getBottom() <= playerGuy.getBottom()) {
         playerGuy.kill();
         this.setYVel(JUMP_ACCEL / 2);
      }
      else {
         this.kill();
         this.setYVel(JUMP_ACCEL / 2);
         playerGuy.forceJump();
      }
   };

   this.willHitBlock = function(block) {
      if (block.getLeft() > this.getRight() ||
          block.getRight() < this.getLeft()) {
         return false;
      }
      return Math.abs(block.getTop() - this.getBottom()) < 2 || Math.abs(block.getBottom() - this.getTop()) < 2;
   };
   
   this.overlaps = function(coin) {
      var notOverlapping = coin.getLeft() > this.getRight() || coin.getRight() < this.getLeft() || coin.getTop() > this.getBottom() || coin.getBottom() < this.getTop();
      return !notOverlapping;
   };

   var X_ACCEL = 0.4, 
      JUMP_ACCEL = -6.5, 
      GRAVITY_ACCEL = 0.6,
      dirPressed = NONE,
      justHitBlock = false;
   
   this.move = function(block) {
      if (!alive) {
         // dx = 0;
         // dy += GRAVITY_ACCEL;
         // y += dy;
         this.setXVel(0);
         this.shiftYVel(GRAVITY_ACCEL);
         this.shiftY(this.getYVel());
         // _div.style.top = Math.round(y) + 'px';
         // _div.style.left = Math.round(x) + 'px';
         return;
      }
   
      // make sure we dont accelerate too much.
      this.trimToMaxVel(4.0);
      /*
      if (dy > 4.0) {
         dy = 4.0;
      }
      if (dx > 4.0) {
         dx = 4.0;
      }
      else if (dx < -4.0) {
         dx = -4.0;
      }
      */
      
      // accel downwards by 1px/frame
      // dy += GRAVITY_ACCEL;
      this.shiftYVel(GRAVITY_ACCEL);
      
      // only stick to block is accel is not negative
      justHitBlock = false;
      if (block) {
         if (this.getYVel() >= 0.0 && Math.abs(block.getTop() - this.getBottom()) < 2) { // going down
            // y = block.getTop() - h; // set guy to be walking exactly on top of block
            // dy = 0.0;
            this.setY(block.getTop() - this.getHeight());
            this.setYVel(0.0);
            justHitBlock = true;
         }
         else if (this.getYVel() <= 0.0 && Math.abs(block.getBottom() - this.getTop()) < 2) { // going up
         
            // try reversing y accel in block hit method instead of zeroing it here
            // dy = 0.0;
            
            block.hit(this, DOWN);
         }
      }
      // y += dy;
      this.shiftY(this.getYVel());

      if (dirPressed == LEFT) {
         this.shiftXVel(-X_ACCEL);
         // dx -= X_ACCEL;
      }
      else if (dirPressed == RIGHT) {
         this.shiftXVel(X_ACCEL);
         // dx += X_ACCEL;
      }
      else {
         // slow horiz accel
         if (this.getXVel() <= -X_ACCEL) {
            this.shiftXVel(X_ACCEL);
            // dx += X_ACCEL;
         }
         else if (this.getXVel() >= X_ACCEL) {
            this.shiftXVel(-X_ACCEL);
            // dx -= X_ACCEL;
         }
         else {
            this.setXVel(0.0);
            // dx = 0.0;
         }
      }
      
      // x += dx;
      this.shiftX(this.getXVel());

      // _div.style.top = Math.round(y) + 'px';
      // _div.style.left = Math.round(x) + 'px';
   };
   
   this.flipYAccel = function() {
      // dy = -dy;
      this.setYVel(-this.getYVel());
   };
   
   this.jump = function() {
      if (justHitBlock && Math.abs(this.getYVel()) < 0.1) {
         // dy = JUMP_ACCEL;
         this.setYVel(JUMP_ACCEL);
      }
   };
   this.forceJump = function() {
      // dy = JUMP_ACCEL;
         this.setYVel(JUMP_ACCEL);
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
Guy.prototype = new Sprite();

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
      // var b = new Block(100 + k * 10, 100, 10, 10, '#ec0', back, 0);
      var b = new Block(back, 0);
      b.setProps({
            accel: {x: 0, y: 0},
            vel: {x: 0, y: 0},
            pos: {x: 100 + k * 10, y: 100},
            width: 10,
            height: 10,
            color: '#ec0'
         });
      back.addBlock(b);
   }
   // b = new Block(120, 70, 10, 10, '#ec0', back, 1);
   b = new Block(back, 1);
   b.setProps({
         accel: {x: 0, y: 0},
         vel: {x: 0, y: 0},
         pos: {x: 120, y: 70},
         width: 10,
         height: 10,
         color: '#ec0'
      });
   back.addBlock(b);

   // var g = new Guy(100, 90, 0, 0, 10, 10, '#ca0');
   var g = new Guy();
   g.setProps({
         accel: {x: 0, y: 0},
         vel: {x: 0, y: 0},
         pos: {x: 100, y: 90},
         width: 10,
         height: 10,
         color: '#ca0'
      });
   back.addGuy(g);
   // var e = new Guy(130, 90, -10, 0, 10, 10, '#0ac');
   var e = new Guy();
   e.setProps({
         accel: {x: 0, y: 0},
         vel: {x: -10, y: 0},
         pos: {x: 130, y: 90},
         width: 10,
         height: 10,
         color: '#0ac'
      });
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

