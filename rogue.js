
var DEBUG = true;

function RogueGame(settings) {

   // local functions
   var 
      DAMAGE_FLASH_MS = 300,
      VIEW_DIM_SQUARES = 14,
      MAP_SQUARES = 20,
      CELL_DIM = 30,
      MSG_DISAPPEAR_MS = 3000,
      ENEMY_CHANCE = 0.02,
      
      get = function(s) {
         return document.getElementById(s);
      },
      
      getSign = function(x) {
         return (x == 0 ? 0 : (x < 0 ? -1 : 1));
      },

      makeTextDiv = function(text) {
         var newDiv = document.createElement("div");
         newDiv.innerHTML = text;
         return newDiv;
      },

      makeDiv = function(size, color) {
         var newDiv = document.createElement("div");
         newDiv.style.position = 'absolute';
         newDiv.style.width = size + 'px';
         newDiv.style.height = size + 'px';
         newDiv.style.top = '0';
         newDiv.style.left = '0';
         newDiv.style.backgroundColor = color;
         return newDiv;
      },
      
      treasureData = [
         {  name: 'health potion'
         },
         {  name: 'mana potion'
         },
         {  name: 'axe'
         }
      ],
      
      Monsterator = function() {
         var
            enemyData = [
               { name: 'rat',
                  color: '#f94',
                  minHp: 1,
                  minGold: 1
               }, 
               { name: 'dog',
                  color: '#f49',
                  minHp: 2,
                  minGold: 2,
               }, 
               { name: 'emu',
                  color: '#4f9',
                  minHp: 4,
                  minGold: 4,
               }, 
               { name: 'alpaca',
                  color: '#49f',
                  minHp: 8,
                  minGold: 8,
               },
         ],

         Enemy = function(dim, name, color, _hp, gold) {
         
            var 
               myDiv = makeDiv(MAP_SQUARES, color),
               hp = _hp, 
               xp = _hp,
               row, 
               col;
            
            myDiv.style.zIndex = 10;
            myDiv.style.top = (row * dim + 5) + 'px';
            myDiv.style.left = (col * dim + 5) + 'px';

            this.name = name;

            this.getDiv = function() {
               return myDiv;
            };
            
            this.damage = function() {
               var 
                  dmgDiv = makeDiv(14, '#f66')
                  myDamage = Math.floor(Math.random() * 5);
               dmgDiv.style.top = '3px';
               dmgDiv.style.left = '3px';
               dmgDiv.style.fontSize = '12px';
               
               dmgDiv.innerHTML = '&nbsp;' + myDamage;
               hp -= myDamage;
               myDiv.appendChild(dmgDiv);
               setTimeout(function() { 
                     myDiv.removeChild(dmgDiv); 
                  }, DAMAGE_FLASH_MS)
            };
            
            this.move = function(player, playerRow, playerCol, theGrid) {
               // enemies/this have a row and col
               // theGrid has the myPlayerCol and myPlayerRow
               
               var
                  newCol = col, newRow = row;

               if (Math.random() < 0.5) { // do xdiff
                  newCol += getSign(playerCol - col);
               }
               else { // do ydiff
                  newRow += getSign(playerRow - row);
               }
               
               if (newRow == playerRow && newCol == playerCol) {
                  player.damage();
               }
               else if (!theGrid.hasEnemyAt(newRow, newCol) && !theGrid.hasTreasureAt(newRow, newCol)) {
                  this.setLoc(newRow, newCol);
                  theGrid.moveEnemyTo(this, newRow, newCol);
               }
            };
            
            this.isAlive = function() {
               return hp > 0;
            };
            
            this.getLoc = function() {
               return {row: row, col: col};
            }
            
            this.getXP = function() {
               return xp;
            };
            
            this.getTreasure = function() {
               var t = [{
                     name: 'gold',
                     amount: gold
                  }];
               if (Math.random() < 0.1) {
                  t.push({
                     name: treasureData[Math.floor(Math.random() * treasureData.length)].name,
                     amount: 1
                  });
               }
               return t;
            };

            this.setLoc = function(x, y) {
               row = x;
               col = y;
               myDiv.style.top = (row * dim + 5) + 'px';
               myDiv.style.left = (col * dim + 5) + 'px';
            };
         };
         
         this.getByLevel = function(lvl, dim) {
            var 
               proto = enemyData[lvl],
               hp = proto.minHp + Math.floor(Math.random() * proto.minHp),
               gold = proto.minGold + Math.floor(Math.random() * proto.minGold);
            return new Enemy(dim, proto.name, proto.color, hp, gold);
         };
      },
      
      myMonsterator = new Monsterator(),

      ViewManager = function(containerDiv) {
         var
            panes = {},
            lastShown = '',
            clearContainer = function() {
               while(containerDiv.hasChildNodes()){
                  containerDiv.removeChild(containerDiv.firstChild);
               }
            };

         this.addChild = function(name, div) {
            panes[name] = div;
         };

         this.switchTo = function(name) {
            clearContainer();
            containerDiv.appendChild(panes[name]);
            lastShown = name;
         };

         this.currentView = function(name) {
            return lastShown;
         };
      },
      
      myViewManager = new ViewManager(get(settings.divId)),
      
      Grid = function(rows, cols, dim) {
         var 
            data = [], r, c, tmp, newDiv,
            myPlayerRow = Math.floor(rows / 2), myPlayerCol = Math.floor(cols / 2),
            outerDiv = makeDiv(rows * dim, '#f6a'),
            player, enemies = {}, treasures = {}, 
            initialXOffsetRows = -Math.floor((rows - VIEW_DIM_SQUARES) / 2),
            initialXOffsetCols = -Math.floor((cols - VIEW_DIM_SQUARES) / 2);
         
         // alert('cols ' + cols + ', VIEW_DIM_SQUARES ' + VIEW_DIM_SQUARES + ', initialXOffsetCols ' + initialXOffsetCols);
         
         outerDiv.style.top = (initialXOffsetRows * dim) + 'px';
         outerDiv.style.left = (initialXOffsetCols * dim) + 'px';
         
         // alert('outerDiv left offset: ' + outerDiv.style.left);
         
         this.getDiv = function() {
            return outerDiv;
         };
         
         this.addMessage = function(msg) {
            var msgDiv = makeTextDiv(msg);
            newMsgDiv.appendChild(msgDiv);
            setTimeout(function(){
               newMsgDiv.removeChild(msgDiv);
            }, MSG_DISAPPEAR_MS)
         };
         
         this.addPlayer = function(p) {
            var pdiv;
            player = p;
            pdiv = player.getDiv();

            pdiv.style.top = (myPlayerRow * dim) + 'px';
            pdiv.style.left = (myPlayerCol * dim) + 'px';
            
            pdiv.style.zIndex = 10;
            outerDiv.appendChild(pdiv);
         }

         this.addEnemy = function(r, c) {
            var enemy_hash = r + ',' + c;
            // enemies[enemy_hash] = new Enemy(r, c, dim);
            enemies[enemy_hash] = myMonsterator.getByLevel(Math.floor(Math.random() * 2), dim);
         };

         for (r = 0; r < rows; r++) {
            tmp = [];
            for (c = 0; c < cols; c++) {
               newDiv = makeDiv(dim, (Math.random() < 0.5 ? '#6af' : '#6fa'));
               newDiv.style.top = (r * dim) + 'px';
               newDiv.style.left = (c * dim) + 'px';
               newDiv.style.border = '1px solid #ccc';
               // newDiv.innerHTML = r + ', ' + c;
               tmp.push(newDiv);
               if (Math.random() < ENEMY_CHANCE) {
                  this.addEnemy(r, c);
               }
            }
            data.push(tmp);
         }
         
         this.renderCells = function(container) {
            var tmp, myR, myDiv, k, enemyKey, possibleEnemy;

            while(container.hasChildNodes()){
               container.removeChild(container.firstChild);
            }
            
            for (r = 0; r < rows; r++) {
               tmp = data[r];
               for (c = 0; c < cols; c++) {
                  myDiv = tmp[c];

                  myDiv.style.top = (r * dim) + 'px';
                  myDiv.style.left = (c * dim) + 'px';
                  container.appendChild(myDiv);
                  
                  enemyKey = r + ',' + c;
                  possibleEnemy = enemies[enemyKey];
                  if (possibleEnemy) {
                     possibleEnemy.setLoc(r, c);
                     container.appendChild(possibleEnemy.getDiv());
                  }
               }
            }
            if (player) this.addPlayer(player);
         };
         
         this.renderCells(outerDiv);
         
         this.removeTreasure = function(row, col) {
            var trObj = treasures[row + ',' + col];
            delete treasures[row + ',' + col];
            outerDiv.removeChild(trObj.myDiv);
            return trObj.treasure;
         };
         
         this.addTreasure = function(e) {
            var 
               loc = e.getLoc(),
               tr = e.getTreasure(),
               treasureDiv = makeDiv('20', '#a6f');

            treasures[loc.row + ',' + loc.col] = {treasure: tr, myDiv: treasureDiv};
            
            treasureDiv.style.top = (loc.row * dim + 5) + 'px';
            treasureDiv.style.left = (loc.col * dim + 5) + 'px';
            outerDiv.appendChild(treasureDiv);
         };
         
         this.hasEnemyAt = function(row, col) {
            return enemies[row + ',' + col];
         };
         
         this.hasTreasureAt = function(row, col) {
            return treasures[row + ',' + col];
         };
         
         this.moveEnemyTo = function(e, r, c) {
            this.removeEnemy(e);
            var enemy_hash = r + ',' + c;
            enemies[enemy_hash] = e;
            outerDiv.appendChild(e.getDiv());
         };
         
         this.removeEnemy = function(e) {
            for (var index in enemies) {
               if (enemies[index] == e) {
                  outerDiv.removeChild(enemies[index].getDiv());
                  delete enemies[index];
                  return;
               }
            }
            alert('enemy not found!');
         };
         
         this.moveEnemies = function() {
            var anEnemy;
            for (var index in enemies) {
               anEnemy = enemies[index];
               anEnemy.move(player, myPlayerRow, myPlayerCol, this);
            }
         };
         
         this.checkCollision = function(rowDelta, colDelta) {
            var 
               newLocKey = (myPlayerRow + rowDelta) + ',' + (myPlayerCol + colDelta),
               possibleEnemy = enemies[newLocKey];
            if (possibleEnemy) {
               player.meleeAttack(possibleEnemy, this);
               return true;
            }
            else if (this.hasTreasureAt(myPlayerRow + rowDelta, myPlayerCol + colDelta)) {
               var
                  row = myPlayerRow + rowDelta, 
                  col = myPlayerCol + colDelta;
                  trObj = this.removeTreasure(row, col);

               this.showTreasureSelector(trObj);
               return true;
            }
            else {
               return false;
            }
         };
         
         this.showTreasureSelector = function(trObj) {
            player.addTreasure(trObj);
            var 
               index,
               popDiv = makeDiv(VIEW_DIM_SQUARES * CELL_DIM, '#af6');
            popDiv.innerHTML = "Treasure found!";
            
            for (index in trObj) {
               popDiv.appendChild(
                  makeTextDiv(trObj[index].amount + ' ' + trObj[index].name));
            }

            myViewManager.addChild('treasure window', popDiv);
            myViewManager.switchTo('treasure window');
         };

         this.resetPlayerPos = function() {
            var pdiv = player.getDiv();
            pdiv.style.top = (myPlayerRow * dim) + 'px';
            pdiv.style.left = (myPlayerCol * dim) + 'px';
         };
         
         this.shiftLeft = function() {
            var hadCollision = this.checkCollision(0, -1);
            if (!hadCollision && myPlayerCol > 0) {
               myPlayerCol -= 1;
               outerDiv.style.left = ((Math.floor(cols / 2) - myPlayerCol + initialXOffsetCols) * dim) + 'px';
               // alert('outerDiv left offset: ' + outerDiv.style.left);
               this.resetPlayerPos();
            }
            this.moveEnemies();
         };
         
         this.shiftRight = function() {
            var hadCollision = this.checkCollision(0, 1);
            if (!hadCollision && myPlayerCol < rows - 1) {
               myPlayerCol += 1;
               // alert('outerDiv left offset: ' + outerDiv.style.left);
               outerDiv.style.left = ((Math.floor(cols / 2) - myPlayerCol + initialXOffsetCols) * dim) + 'px';
               this.resetPlayerPos();
            }
            this.moveEnemies();
         };
         
         this.moveUp = function() {
            var hadCollision = this.checkCollision(-1, 0);
            if (!hadCollision && myPlayerRow > 0) {
               myPlayerRow -= 1;
               // outerDiv.style.top = ((Math.floor(rows / 2) - myPlayerRow) * dim) + 'px';
               outerDiv.style.top = ((Math.floor(rows / 2) - myPlayerRow + initialXOffsetRows) * dim) + 'px';
               this.resetPlayerPos();
            }
            this.moveEnemies();
         };
         
         this.shiftDown = function() {
            var hadCollision = this.checkCollision(1, 0);
            if (!hadCollision && myPlayerRow < cols - 1) {
               myPlayerRow += 1;
               // outerDiv.style.top = ((Math.floor(rows / 2) - myPlayerRow) * dim) + 'px';
               outerDiv.style.top = ((Math.floor(rows / 2) - myPlayerRow + initialXOffsetRows) * dim) + 'px';
               this.resetPlayerPos();
            }
            this.moveEnemies();
         };
         
      },

      Player = function(name, size, color) { 
         var
            hp = 10,
            xp = 0,
            myDiv = makeDiv(size, color),
            treasures = {};

         this.getHp = function() {
            return hp;
         };
         
         this.getDiv = function() {
            return myDiv;
         };
         
         this.getScoreDiv = function() {
            var
               outerDiv = makeDiv(VIEW_DIM_SQUARES * CELL_DIM, '#f6a');

            outerDiv.style.padding = '8px';
            outerDiv.appendChild(makeTextDiv('Hit Points: ' + this.getHp()));
            outerDiv.appendChild(makeTextDiv('XP: ' + xp));
            return outerDiv;
         };
         
         this.getInventoryDiv = function() {
            var
               outerDiv = makeDiv(VIEW_DIM_SQUARES * CELL_DIM, '#fa6');
            outerDiv.style.padding = '8px';
            outerDiv.appendChild(this.getTreasureDiv());
            return outerDiv;
         };
         
         this.addTreasure = function(trObj) {
            var
               index,
               subTreasure;
            for (index in trObj) {
               subTreasure = trObj[index];
               if (!treasures[subTreasure.name]) {
                  treasures[subTreasure.name] = 0;
               }
               treasures[subTreasure.name] += subTreasure.amount;
            }
         };
         
         this.getTreasureDiv = function() {
            var 
               name, 
               amount, 
               myContainer = makeTextDiv('My magical treasures:');
            for (name in treasures) {
               amount = treasures[name];
               myContainer.appendChild(makeTextDiv(amount + ' ' + name));
            }
            return myContainer;
         };

         this.damage = function() {
            var 
               dmgDiv = makeDiv(14, '#f66')
               myDamage = Math.floor(Math.random() * 5);
            dmgDiv.style.top = '3px';
            dmgDiv.style.left = '3px';
            dmgDiv.style.fontSize = '12px';
            
            dmgDiv.innerHTML = '&nbsp;' + myDamage;
            hp -= myDamage;
            myDiv.appendChild(dmgDiv);
            setTimeout(function() { 
                  myDiv.removeChild(dmgDiv); 
               }, DAMAGE_FLASH_MS)
            
            if (!this.isAlive()) {
               var 
                  popDiv = makeDiv(VIEW_DIM_SQUARES * CELL_DIM, '#f6a');
               popDiv.innerHTML = "You are dead, press R to restart.";
               
               myViewManager.addChild('dead window', popDiv);
               myViewManager.switchTo('dead window');
            }
         };

         this.isAlive = function() {
            return hp > 0;
         };

         this.meleeAttack = function(victim, grid) {
            victim.damage();
            if (!victim.isAlive()) {
               grid.removeEnemy(victim);
               grid.addTreasure(victim);
               xp += victim.getXP();
               grid.addMessage(victim.name + ' killed, ' + victim.getXP() + 'xp gained');
            }
         };
         
      },

      myPlayer = null,
      myGrid = null,
      that = this,
      
      addNewGameWithWrapper = function() {
         var 
            wrapperDiv = makeDiv(VIEW_DIM_SQUARES * CELL_DIM, '#fff');

         myPlayer = new Player('sam', CELL_DIM, '#fa6'),
         myGrid = new Grid(MAP_SQUARES, MAP_SQUARES, CELL_DIM),
         myGrid.addPlayer(myPlayer);

         wrapperDiv.style.overflow = 'hidden';
         wrapperDiv.appendChild(myGrid.getDiv());
         
         newMsgDiv.style.zIndex = 10;
         newMsgDiv.style.position = 'absolute';
         newMsgDiv.style.top = '0';
         newMsgDiv.style.left = '0';
         newMsgDiv.style.textAlign = 'center';
         newMsgDiv.style.padding = '10px';
         wrapperDiv.appendChild(newMsgDiv);

         myViewManager.addChild('main window', wrapperDiv);
         myViewManager.switchTo('main window');

      },

      keyUpHandler = function(e) {

         if (!e && window.event) {
            e = window.event;
         }
         
         if (!myPlayer.isAlive()) {
            if (e.keyCode == 82) {
               addNewGameWithWrapper();
            }
            return;
         }

         if (e.keyCode == 38) {
            // up key
            myGrid.moveUp();
         }
         else if (e.keyCode == 40) {
            // down key
            myGrid.shiftDown();
         }
         else if (e.keyCode == 37) {
            // left key
            myGrid.shiftLeft();
         }
         else if (e.keyCode == 39) {
            // right key
            myGrid.shiftRight();
         }
         else if (e.keyCode == 27) {
            // esc key
            if (myViewManager.currentView() == 'main window') {
               myViewManager.addChild('inventory window', myPlayer.getInventoryDiv());
               myViewManager.switchTo('inventory window');
            }
            else if (myViewManager.currentView() == 'inventory window') {
               myViewManager.addChild('score window', myPlayer.getScoreDiv());
               myViewManager.switchTo('score window');
            }
            else {
               myViewManager.switchTo('main window');
            }
         }
      },

   newMsgDiv = makeTextDiv('');
   
   // end of local functions / vars
   
   if (window.addEventListener){
      window.addEventListener('keyup', keyUpHandler, true);
   } else if (window.attachEvent){
      get(settings.divId).onkeyup = keyUpHandler;
   } else {
      alert("can't attach keyup listener");
   }

   addNewGameWithWrapper();

}

