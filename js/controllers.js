'use strict';

app.controller('HomeController', ['HomeService', '$state', '$window', '$scope', function(HomeService, $state, $window, $scope) {
  //Run code on the home page
  var vm = this;
  vm.$state = $state;
  $scope.game = {};
  $scope.game.inProgress = false;
  // if ($window.localStorage.token) {
  //   $scope.profile = HomeService.getProfile();
  //   vm.loggedIn = true;
  // }

  //Run the text area for scrolling the rules
  var textarea = $('textarea');
  var location = 1;
  var scroll = setInterval(function() {
    if (textarea.scrollTop() !== location) {
      location = textarea.scrollTop();
    }
    else if (location === null) {
      location = 0;
    }
    else {
      location++;
      textarea.scrollTop(location);
    }
  }, 30);

  // vm.logout = function() {
  //   delete $window.localStorage.token;
  //   vm.loggedIn = false;
  //   $state.go('home');
  // };
}]);

// app.controller("LoginController", ['LoginService', '$state', '$window', function(LoginService, $state, $window) {
//   if ($window.localStorage.token) {
//     $state.go('home');
//   }
//   var vm = this;
//   vm.$state = $state;
//   vm.user = {};
//   vm.login = function() {
//     LoginService.login(vm.user);
//   };
// }]);
//
// app.controller("RegisterController", ['RegisterService', '$state', '$window', function(RegisterService, $state, $window) {
//   if ($window.localStorage.token) {
//     $state.go('home');
//   }
//   var vm = this;
//   vm.newUser = {};
//   vm.$state = $state;
//   vm.register = function() {
//     RegisterService.register(vm.newUser);
//   };
// }]);

app.controller("LeaderboardController", ['LeaderboardService', '$state', '$http', function(LeaderboardService, $state, $http) {
  //Run code for the leaderboard
  var vm = this;
  vm.$state = $state;
  $http.get('https://phantom-mmesereau.herokuapp.com/leaders')
  .then(function(data) {
    vm.leaders = data.data;
    LeaderboardService.percentage(vm.leaders);
  })
  .catch(function(err) {
    console.log(err);
  });
  //Sort leaderboard data by most wins
  vm.wins = function() {
    LeaderboardService.wins(vm.leaders);
  };
  //Sort leaderboard data by most losses
  vm.losses = function() {
    LeaderboardService.losses(vm.leaders);
  };
  //Sort leaderboard data by highest win percentage
  vm.percentage = function() {
    LeaderboardService.percentage(vm.leaders);
  };
}]);

// app.controller("MultiplayerController", ['$state', '$http', '$scope', function($state, $http, $scope) {
//   var vm = this;
//   vm.numberOfPlayers = 4;
//   vm.getGames = function() {
//     $http.get('http://phantom-mmesereau.herokuapp.com/multiplayer')
//     .then(function(data) {
//       vm.allGames = data.data;
//       for (var i = 0; i < vm.allGames.length; i++) {
//         for (var j = 0; j < vm.allGames[i].users.length; j++) {
//           if (vm.allGames[i].users[j].id === $scope.profile.id) {
//             vm.allGames[i].joined = true;
//           }
//         }
//       }
//     })
//     .catch(function(err) {
//       console.log(err);
//     });
//   };
//   vm.getGames();
//   vm.addGame = function() {
//     $http.post('http://phantom-mmesereau.herokuapp.com/multiplayer', {name: vm.gameName, id: $scope.profile.id})
//     .then(function() {
//       vm.gameName = "";
//       vm.newGame = false;
//       vm.getGames();
//     })
//     .catch(function(err) {
//       console.log(err);
//     });
//   };
//   vm.join = function(id) {
//     $http.post('http://phantom-mmesereau.herokuapp.com/multiplayer/join', {games_id: id, users_id: $scope.profile.id})
//     .then(function() {
//       vm.getGames();
//     })
//     .catch(function(err) {
//       console.log(err);
//     });
//   };
//   vm.go = function(game) {
//     $scope.game.game = game;
//     $state.go('staging', {game_name: game.name});
//   };
// }]);
//
// app.controller("StagingController", ['$state', '$stateParams', '$scope', function($state, $stateParams, $scope) {
//   var vm = this;
//   vm.gameName = $stateParams.game_name;
//   vm.presentPlayers = [];
//   var client = deepstream('localhost:6020');
//   client.login({username: $scope.profile.nickname});
//   var record = client.record.getRecord('word');
//   record.set('presentPlayers', $scope.profile.nickname);
//   record.subscribe('presentPlayers', function(value) {
//     $scope.$apply(vm.presentPlayers.push(value));
//     vm.newPlayer();
//   });
//   vm.newPlayer = function() {
//     vm.numberOfPlayersPresent = 0;
//     for (var i = 0; i < vm.presentPlayers.length; i++) {
//       for (var j = 0; j < $scope.game.game.users.length; j++) {
//         if ($scope.game.game.users[j].username === vm.presentPlayers[i]) {
//           vm.numberOfPlayersPresent++;
//         }
//       }
//     }
//     if (vm.numberOfPlayersPresent === /*TODO$scope.game.game.users.length*/2) {
//       $scope.$apply(vm.allPlayersPresent = true);
//       $scope.$apply(vm.countdown = 5);
//       $scope.setCountdown = setInterval(function() {
//         $scope.$apply(vm.countdown--);
//         if (vm.countdown === 0) {
//           vm.begin();
//         }
//       }, 1000);
//     }
//   };
//   vm.begin = function() {
//     clearInterval($scope.setCountdown);
//     $scope.game.playerNames = vm.presentPlayers;
//     $scope.game.type = 'multiplayer';
//     $state.go('game');
//   };
// }]);

app.controller("PassAndPlayController", ['$scope', '$state', function($scope, $state) {
  //Run code for initiating pass and play game
  var vm = this;
  $scope.game.playerNames = [];
  vm.startPnP = function() {
    for (var i = 0; i < vm.players; i++) {
      $scope.game.playerNames.push("");
    }
    //vm.pnpinit allows name form to be shown
    vm.pnpinit = true;
  };
  //Preventing duplicate names
  vm.nameTest = function() {
    vm.filled = true;
    for (var i = 0; i < $scope.game.playerNames.length; i++) {
      for (var j = i + 1; j < $scope.game.playerNames.length; j++) {
        if ($scope.game.playerNames[i] === "" || $scope.game.playerNames[j] === $scope.game.playerNames[i]) {
          vm.filled = false;
        }
      }
    }

  };
  //Initialize game
  vm.startGame = function() {
    $scope.game.type = 'pass';
    $scope.game.inProgress = true;
    $state.go('game');
  };
}]);

app.controller("GameController", ['$scope', '$state', '$http', function($scope, $state, $http) {
  var vm = this;
  vm.$state = $state;
  vm.startGame = function() {
      var newGame = new Phaser.Game($(window).width(), $(window).height(), Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });
      var map, layer, action_text, sprites, line, turn, avatarWidth, avatarHeight, shield, extra_turn, dig, log, turn_text, lava_done, capsules, time, buttons, buttonsShow, digLine, gameOverNotification, playerWhoseTurnItIs, gameOver, digInitiated;
      var players = [];
      var notificationLog = [];
      var avatars = [];
      var turnsWithoutDamage = 0;
      function preload () {
        newGame.load.tilemap('map', 'assets/tilemaps/maps/tile_properties.json', null, Phaser.Tilemap.TILED_JSON);
        newGame.load.image('tiles', 'assets/tilemaps/tiles/gridtiles.png');
        newGame.load.image('sprite_1', 'assets/sprites/red_ball.png');
        newGame.load.image('sprite_2', 'assets/sprites/aqua_ball.png');
        newGame.load.image('sprite_3', 'assets/sprites/purple_ball.png');
        newGame.load.image('sprite_4', 'assets/sprites/blue_ball.png');
        newGame.load.image('sprite_5', 'assets/sprites/green_ball.png');
        newGame.load.image('sprite_6', 'assets/sprites/yellow_ball.png');
        newGame.load.image('basic_attack', 'assets/buttons/basic_attack.png');
        newGame.load.image('special_attack', 'assets/buttons/special_attack.png');
        newGame.load.image('move', 'assets/buttons/move.png');
        newGame.load.image('shield', 'assets/buttons/shield.png');
        newGame.load.image('dig', 'assets/buttons/dig.png');
        newGame.load.image('capsule', 'assets/buttons/capsule.png');
        newGame.load.image('extra_turn', 'assets/buttons/extra_turn.png');
        newGame.load.image('healthbar', 'assets/sprites/healthbar.png');
        newGame.load.image('sapbar', 'assets/sprites/sap.png');
        newGame.load.image('shield2', 'assets/sprites/shield2.png');
        newGame.load.image('gameover', 'assets/buttons/endgame.png');
      }

      function create () {
        newGame.physics.startSystem(Phaser.Physics.P2JS);
        map = newGame.add.tilemap('map');
        map.addTilesetImage('tiles');
        layer = map.createLayer('Tile Layer 1');
        sprites=['sprite_1', 'sprite_2', 'sprite_3', 'sprite_4', 'sprite_5', 'sprite_6'];
        for (var i = 0; i < $scope.game.playerNames.length; i++) {
          var decision = Math.floor(Math.random() * sprites.length);
          players.push(newGame.add.sprite(Math.floor(Math.random() * $(window).width()), Math.floor(Math.random() * $(window).height()), sprites[decision]));
          avatars.push(newGame.add.sprite(0, 0));
        }
        //These buttons will be shown by the 'options' function
        shield = newGame.add.button($(window).width() - 200, 300, 'shield', do_shield, this);
        dig = newGame.add.button($(window).width() - 200, 100, 'dig', do_dig, this);
        extra_turn = newGame.add.button($(window).width() - 200, 0, 'extra_turn', do_extra_turn, this);
        //Text that shows whose turn it is
        turn_text = newGame.add.text(0, 0, "", {font: "40px Arial", fill: "white"});
        //Text that shows which action to do based on cursor location
        action_text = newGame.add.text(0, 0, "", {font: "40px Arial", fill: "white"});
        //Text that shows previous events
        log = newGame.add.text(0, 45, "", {font: "30px Arial", fill: "white"});
        //Button to end the game and return to the home page
        gameOver = newGame.add.button($(window).width() - 400, 0, 'gameover', endGame, this);
        //A line that allows players to determine whether they can target other players
        line = new Phaser.Line(players[0].x, players[0].y, players[0].x, players[0].y);
        buttons=[shield, dig, extra_turn];
        for (i = 0; i < buttons.length; i++) {
          buttons[i].visible = false;
        }
        layer.resizeWorld();
        map.setCollisionBetween(6, 34);
        newGame.physics.p2.convertTilemap(map, layer);
        newGame.physics.p2.gravity.y = 0;
        newGame.physics.p2.enable(line);
        for (i = 0; i < players.length; i++) {
          newGame.physics.p2.enable(players[i]);
          //A player's name
          players[i].key = $scope.game.playerNames[i];
          //A player's in-game stats
          players[i].turn = false;
          players[i].hp = 6;
          players[i].maxhp = 6;
          players[i].sap = 10;
          players[i].maxsap = 10;
          players[i].shield = 0;
          players[i].wand = 0;
          //Text showing a player's name (visible when the cursor hovers over the player)
          players[i].hoverName = players[i].addChild(newGame.add.text(-50, 0, players[i].key, {fill: "white", font: "18px Arial"}));
          //Animated text enacted when a player gains or loses health
          players[i].healthChange = players[i].addChild(newGame.add.text(0, -50, "", {fill: "red", font: "60px Arial"}));
          //The function to animate player.healthChange
          players[i].showDamage = function(dmg) {
            if (dmg < 0) {
              this.healthChange.style.fill = "red";
            }
            else {
              this.healthChange.style.fill = "green";
              dmg = "+" + dmg;
            }
            this.healthChange.text = dmg;
            this.healthChange.style.font = "60px Arial";
            animateDamage(this);
          };
        }
        for (i = 0; i < avatars.length; i++) {
          //Initializes the avatars at the bottom of the screen to display player stats
          avatarWidth = $(window).width() / avatars.length;
          avatarHeight = $(window).height() * 0.2;
          avatars[i].reset(avatarWidth * i, $(window).height() - avatarHeight);
          avatars[i].title = players[i].key;
          avatars[i].name = avatars[i].addChild(newGame.add.text(0, avatarHeight / 2, players[i].key, {fill: "white", font: "18px Arial"}));
          avatars[i].healthbar = avatars[i].addChild(newGame.make.sprite(avatarWidth / 3, 0, 'healthbar'));
          avatars[i].healthbar.width = avatarWidth / 2;
          avatars[i].healthbar.height = avatarHeight / 12;
          avatars[i].healthnote = avatars[i].addChild(newGame.add.text(avatarWidth / 3, avatarHeight / 6, "test", {fill: "red", font: "18px Arial"}));
          avatars[i].sapbar = avatars[i].addChild(newGame.make.sprite(avatarWidth / 3, avatarHeight / 3, 'sapbar'));
          avatars[i].sapbar.width = avatarWidth / 2;
          avatars[i].sapbar.height = avatarHeight / 12;
          avatars[i].sapnote = avatars[i].addChild(newGame.add.text(avatarWidth / 3, avatarHeight / 2, "test", {fill: "blue", font: "18px Arial"}));
          avatars[i].shieldnote = avatars[i].addChild(newGame.add.text(avatarWidth / 3, avatarHeight * 2 / 3, "SHIELD: 0", {fill: "white", font: "18px Arial"}));
          avatars[i].wandnote = avatars[i].addChild(newGame.add.text(avatarWidth / 3, avatarHeight * 5 / 6, "WAND: 0", {fill: "white", font: "18px Arial"}));
        }
        // if ($scope.game.type !== 'multiplayer' || $scope.game.playerNames[0] === players[0].key) {
        //   for (i = 0; i < $(window).width() / 32 * $(window).height() / 32; i++) {
        //     if (Math.floor(Math.random() * 5) === 0) {
        //       mapArray.push(6);
        //     }
        //     else {
        //       mapArray.push(1);
        //     }
        //   }
        //   for (i = 0; i < 6; i++) {
        //     var spot = Math.floor(Math.random() * mapArray.length);
        //     mapArray[spot] = 34;
        //   }
        // }
        // if ($scope.game.type === 'multiplayer') {
        //   $scope.game.record.subscribe('gameInfo', function(obj) {
        //     for (var i = 0; i < obj.players.length; i++) {
        //       players[i].hp = obj.players[i].hp;
        //       players[i].sap = obj.players[i].sap;
        //       players[i].maxhp = obj.players[i].maxhp;
        //       players[i].maxsap = obj.players[i].maxsap;
        //       players[i].reset(obj.players[i].x, obj.players[i].y);
        //     }
        //   });
        //   if ($scope.game.playerNames[0] === players[0].key) {
        //     var obj = [];
        //     for (i = 0; i < players.length; i++) {
        //       obj.push({hp: players[i].hp, maxhp: players[i].maxhp, sap: players[i].sap, maxsap: players[i].maxsap, x: players[i].x, y: players[i].y});
        //     }
        //     $scope.game.record.set('gameInfo', {players: obj});
        //   }
        // }

        //A counter to keep track of whose turn it is
        turn = 0;
        //Data to keep track of which capsules exist
        capsules = ['health', 'wand', 'lava', 'death', 'wand', 'health'];
        //Text to notify when the game is finished and who won
        gameOverNotification = newGame.add.text(newGame.world.centerX, newGame.world.centerY, "", {font: '75px Arial', fill: 'white'});
        generateMap();
        //A cursor event that triggers when the cursor key is pressed
        newGame.input.onDown.addOnce(action, this);
        $("canvas").css("cursor", "url(css/cursor.png), auto");
      }

      function update() {
        //This function is constantly running
        //This sets the cursor to look like a target
        $("canvas").css("cursor: url(../css/cursor.png), none");
        for (var i = 0; i < players.length; i++) {
          players[i].body.setZeroVelocity();
          for (var j = 0; j < avatars.length; j++) {
            if (avatars[j].title === players[i].key) {
              //Updates the player stats at the bottom of the screen
              avatars[j].healthbar.width = players[i].hp / players[i].maxhp * avatarWidth / 2;
              avatars[j].healthnote.text = players[i].hp + " / " + players[i].maxhp + " Hit Points";
              avatars[j].sapbar.width = players[i].sap / players[i].maxsap * avatarWidth / 2;
              avatars[j].sapnote.text = players[i].sap + " / " + players[i].maxsap + " Special Points";
              avatars[j].shieldnote.text = "SHIELD: " + players[i].shield;
              avatars[j].wandnote.text = "WAND: " + players[i].wand;
            }
          }
          if (turn % players.length === i) {
            //Updates the turn information
            playerWhoseTurnItIs = players[i];
            players[i].turn = true;
            //Updates turn text in top left corner of screen
            turn_text.text = players[i].key + "\'s Turn";
            //Makes the player larger to identify the player whose turn it is
            players[i].height = 30;
            players[i].width = 30;
            //Runs a function that initializes the targeting line to the player's location
            changeline(players[i]);

          }
          else if (!players[i].target) {
            //What to do when a player is successfully targeted
            players[i].turn = false;
            //Makes a targeted player larger
            players[i].height = 17;
            players[i].width = 17;
            players[i].hoverName.visible = false;
          }
          else {
            players[i].turn = false;
          }
          if (Math.abs(players[i].x - newGame.input.activePointer.x) < players[i].width / 2 && Math.abs(players[i].y - newGame.input.activePointer.y) < players[i].height / 2) {
            //If the cursor is hovering over a player, regardless of whether that player is targeted, that player's name is shown
            players[i].hoverName.visible = true;
          }
          if (players[i].healthChange.fontSize <= 20) {
            //This stops the healthChange animation
            clearInterval(players[i].animation);
            players[i].animation = 0;
            players[i].healthChange.text = "";
            players[i].healthChange.x = 0;
            players[i].healthChange.y =  -50;
            players[i].healthChange.fontSize = 60;
          }
        }
        for (var i = 0; i < avatars.length; i++) {
          //This tests to see if a player is still alive, and if they aren't, it removes the stats at the bottom of the screen
          var stillAlive = false;
          for (var j = 0; j < players.length; j++) {
            if (avatars[i].title === players[j].key) {
              stillAlive = true;
            }
          }
          if (!stillAlive) {
            avatars[i].dead = true;
          }
        }
        if (Date.now() > time + 1000) {
          //This stops the flicker animation that runs when a player takes damage
          for (i = 0; i < players.length; i++) {
            players[i].visible = true;
            clearInterval(players[i].flicker);
            players[i].flicker = 0;
          }
        }
        if (newGame.input.activePointer.y > $(window).height() - avatarHeight) {
          //This hides the player stats if the mouse is over the location of the player stats
          for (var i = 0; i < avatars.length; i++) {
            avatars[i].visible = false;
          }
        }
        else {
          //This shows the player stats if the mouse is not over the location of the player stats
          for (var i = 0; i < avatars.length; i++) {
            if (!avatars[i].dead) {
              avatars[i].visible = true;
            }
          }
        }
        if (newGame.input.activePointer.x > log.left && newGame.input.activePointer.x < log.right && newGame.input.activePointer.y > log.top && newGame.input.activePointer.y < log.bottom) {
          //This hides the game log if the cursor is over the game log
          log.visible = false;
        }
        else {
          //This shows the game log if the cursor is not over the game log
          log.visible = true;
        }
        if (digLine) {
          //This updates the line in which tiles will be removed
          digLine.setTo(digLine.start.x, digLine.start.y, newGame.input.activePointer.x, newGame.input.activePointer.y);
        }
        if (map) {
          //This updates the text by the cursor to show what action options are available to the player whose turn it is
          updateActionText();
        }
      }

      function updateActionText() {
        //This identifies the tile that the mouse is over
        var x = Math.ceil(newGame.input.activePointer.x / 32 - 1);
        var y = Math.ceil(newGame.input.activePointer.y / 32 - 1);
        var tile = map.getTile(x, y, 'Tile Layer 1', true);
        //If the tile is a Capsule tile, the text will read "Open Capsule"
        if (tile && tile.index === 34 && !digInitiated) {
          action_text.text = "Open Capsule";
        }
        else if (tile && tile.index !== 6) {
          var done = false;
          for (var i = 0; i < players.length; i++) {
            if (Math.abs(newGame.input.activePointer.x - players[i].x) < players[i].width / 2 && Math.abs(newGame.input.activePointer.y - players[i].y) < players[i].height / 2) {
              //If the cursor is over the player whose turn it is, the text will read "Options"
              if (players[i].turn && !digInitiated) {
                done = true;
                action_text.text = "Options";
              }
              else if (players[i].target && !digInitiated) {
                //If the cursor is over a targeted player, the text will read "Attack [player name]"
                done = true;
                action_text.text = "Attack " + players[i].key;
              }
            }
          }
          if (!done) {
            //If the cursor is over a base tile but not a targeted player (a player who can't be targeted also falls under this), the text will read "Move"
            action_text.text = "Move";
          }
        }
        else {
          //This will only be triggered if the cursor is over a barrier tile.  There will be no text because there are no valid action choices at this location.
          action_text.text = "";
        }
        //The action text's location will always be at the location of the cursor.
        action_text.x = newGame.input.activePointer.x;
        action_text.y = newGame.input.activePointer.y;
      }

      function action() {
        //This function initializes an action once the cursor has been clicked.
        //This identifies the tile that the cursor is over.
        var x = Math.ceil(newGame.input.activePointer.x / 32 - 1);
        var y = Math.ceil(newGame.input.activePointer.y / 32 - 1);
        var tile = map.getTile(x, y, 'Tile Layer 1', true);
        if (tile.index === 34) {
          //If the cursor is over a capsule, the do_capsule function is run.
          do_capsule();
        }
        else if (tile.index !== 6) {
          var done = false;
          for (var i = 0; i < players.length; i++) {
            if (Math.abs(newGame.input.activePointer.x - players[i].x) < players[i].width / 2 && Math.abs(newGame.input.activePointer.y - players[i].y) < players[i].height / 2) {
              if (players[i].turn) {
                //If the cursor is over the player whose turn it is: 1)The input action is paused 2) the options function is run
                newGame.input.onDown.removeAll(this);
                done = true;
                options();
              }
              else if (players[i].target) {
                //If a player is targeted, the do_attack function is run
                done = true;
                do_attack();
              }
            }
          }
          if (!done) {
            //If no other options are chosen, the do_move function is run
            do_move();
          }
        }
      }

      function options() {
        //This function shows the shield, dig, extra_turn buttons surrounding the player whose turn it is
        for (var i = 0; i < buttons.length; i++) {
          buttons[i].visible = true;
        }
        buttons[0].x = newGame.input.activePointer.x - buttons[0].width * 1.5;
        buttons[0].y = newGame.input.activePointer.y;
        buttons[1].x = newGame.input.activePointer.x - buttons[1].width * 0.5;
        buttons[1].y = newGame.input.activePointer.y - buttons[1].height * 1.5;
        buttons[2].x = newGame.input.activePointer.x + buttons[2].width * 0.5;
        buttons[2].y = newGame.input.activePointer.y;
      }


      function do_capsule() {
        //This function opens a capsule
        //This identifies the tile
        var x = Math.ceil(newGame.input.activePointer.x / 32 - 1);
        var y = Math.ceil(newGame.input.activePointer.y / 32 - 1);
        var tile = map.getTile(x, y, 'Tile Layer 1', true);
        if (tile.index === 34) {
          //Index identifies a random capsule out of the remaining capsules
          var index = Math.floor(Math.random() * capsules.length);
          //These if statements trigger the appropriate function based on which capsule is opened
          if (capsules[index] === 'lava') {
            lava();
          }
          else if (capsules[index] === "death") {
            death();
          }
          else if (capsules[index] === "wand") {
            wand();
          }
          else if (capsules[index] === "health") {
            health();
          }
          //Removes the chosen capsule from the list of available capsules
          capsules.splice(capsules.indexOf(capsules[index]), 1);
        }
      }

      function health() {
        //This function triggers when a health capsule is opened
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            //Identifies how much health is gained
            var healAmt = players[i].maxhp - players[i].hp;
            players[i].showDamage(healAmt);
            //Sets hp and sap to maximum
            players[i].hp = players[i].maxhp;
            players[i].sap = players[i].maxsap;
            //Replaces the capsule tile with a base tile
            var x = Math.ceil(newGame.input.activePointer.x / 32 - 1);
            var y = Math.ceil(newGame.input.activePointer.y / 32 - 1);
            map.replace(34, 1, x, y, 1, 1);

            nextTurn();
          }
        }
      }

      function wand() {
        //This function triggers when a wand capsule is opened
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            //Gives the player two wand uses
            players[i].wand = 2;
            //Replaces the capsule tile with a base tile
            var x = Math.ceil(newGame.input.activePointer.x / 32 - 1);
            var y = Math.ceil(newGame.input.activePointer.y / 32 - 1);
            map.replace(34, 1, x, y, 1, 1);

            nextTurn();
          }
        }
      }

      function death() {
        //This function triggers when a death capsule is opened
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            //Does 6 damage to the player who opened the capsule
            doDamage(players[i], 6);
          }
        }
        //Replaces the capsule tile with a base tile
        var x = Math.ceil(newGame.input.activePointer.x / 32 - 1);
        var y = Math.ceil(newGame.input.activePointer.y / 32 - 1);
        map.replace(34, 1, x, y, 1, 1);
        nextTurn();
      }

      function lava(x, y) {
        //This function triggers when a lava capsule is opened
        var init = false;
        if (typeof x !== 'number' && typeof y !== 'number') {
          //If no paramaters were passed, this sets x and y to the tile location of the cursor
          init = true;
          x = Math.ceil(newGame.input.activePointer.x / 32 - 1);
          y = Math.ceil(newGame.input.activePointer.y / 32 - 1);
          lava_done = true;
        }
        //Identifies the tile associated with x and y
        var tile = map.getTile(x, y, 'Tile Layer 1', true);
        if ((init && tile.index === 34) || !init) {
          //Randomly assigns base tiles to either lava tiles or safe tiles
          if (Math.floor(Math.random() * 2) === 0) {
            map.replace(tile.index, 85, x, y, 1, 1);
          }
          else {
            map.replace(tile.index, 2, x, y, 1, 1);
          }
          //surrounding identifies the tiles to the left, right, top and bottom of the current tile
          var surrounding = [map.getTile(x, y - 1, 'Tile Layer 1', true), map.getTile(x, y + 1, 'Tile Layer 1', true), map.getTile(x - 1, y, 'Tile Layer 1', true), map.getTile(x + 1, y, 'Tile Layer 1', true)];
          for (var i = 0; i < surrounding.length; i++) {
            if (surrounding[i] && surrounding[i].index === 1) {
              //recursively runs this function on surrounding tiles
              lava(surrounding[i].x, surrounding[i].y);
            }
          }
        }
        if (init) {
          for (var i = 0; i < players.length; i++) {
            if (!players[i].turn) {
              //if a player is on a lava tile after the lava tile opened, they take one damage
              doDamage(players[i], 1);
            }
          }
          nextTurn();
        }
      }

      function do_dig() {
        digInitiated = true;
        //Updates the action text to read "Start Dig"
        action_text.text = "Start Dig";
         for (var i = 0; i < buttons.length; i++) {
           //Hides the dig, shield, extra_turn buttons
           buttons[i].visible = false;
         }
         //creates a new click event to start the dig
        newGame.input.onDown.addOnce(do_dig_2, this);
      }

      function do_dig_2() {
        //updates the action text
        action_text.text = "End Dig";
        //A digLine will replace all barrier tiles on that line with base tiles.  This initializes the digLine at the current location of the cursor.
        digLine = new Phaser.Line(newGame.input.activePointer.x, newGame.input.activePointer.y, newGame.input.activePointer.x, newGame.input.activePointer.y);
        //Creates a new click event to finish the dig
        newGame.input.onDown.addOnce(do_dig_3, this);
      }


      function do_dig_3() {
        //This function completes the dig
        //The digLine is continuously updated by the update function.  It begins at the x/y coordinates of the last click, and it ends at the current location of the cursor.
        digInitiated = false;
        //Gets all the x/y coordinates for every point on the digLine
        var coords = digLine.coordinatesOnLine(1);
        for (var i = 1; i < coords.length; i++) {
          //Replaces all barrier tiles on the digLine with base tiles
          var x = Math.ceil(coords[i][0] / 32 - 1);
          var y = Math.ceil(coords[i][1] / 32 - 1);
          map.replace(6, 1, x, y, 1, 1);
        }
        digLine = undefined;
        nextTurn();
      }

      function do_move() {
        //This function changes a player's x/y coordinates
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            players[i].reset(newGame.input.activePointer.x, newGame.input.activePointer.y);
            nextTurn();
          }
        }
      }

      function do_extra_turn() {
        //This function allows a player to take an extra turn
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            //This checks to see if a player can use a wand in place of SAP
            if (players[i].wand > 0) {
              players[i].extra_turn = true;
              players[i].wand--;
            }
            //This checks to make sure that a player has enough SAP to use the extra_turn action
            else if (players[i].sap >= 3) {
              players[i].extra_turn = true;
              players[i].sap -= 3;
            }
          }
        }
      }


      function do_attack() {
        //This function attacks a player
        for (var i = 0; i < players.length; i++) {
          for (var j = 0; j < players.length; j++) {
            if (players[i].turn && players[j].target) {
              if (players[i].wand > 0) {
                //If a player has a wand, they can deal two damage for no SAP cost
                players[i].wand--;
                doDamage(players[j], 2);
              }
              else if (players[i].sap >= 2) {
                //If a player has no wand but enough SAP, they can deal two damage for two SAP
                players[i].sap--;
                doDamage(players[j], 2);
              }
              else {
                //If a player has no wand and not enough SAP, they deal one damage for no cost
                doDamage(players[j], 1);
              }
            }
            nextTurn();
          }
        }
      }

      function do_shield() {
        //This function creates a shield that absorbs damage
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            //If a player has a wand, they can make a shield for no cost
            if (players[i].wand > 0) {
              players[i].wand --;
            }
            else if (players[i].sap >= 2) {
              //If a player has no wand but enough SAP, they can make a shield for two SAP
              players[i].sap -= 2;
            }
            players[i].shield += 2;
            nextTurn();
          }
        }
      }

      function changeline(player) {
        //This function updates the targeting line
        var x1 = player.x;
        var y1 = player.y;
        var x2 = newGame.input.activePointer.x;
        var y2 = newGame.input.activePointer.y;
        //This makes sure that the function continues if the cursor leaves the game area
        if (x2 && y2) {
          line.setTo(x1, y1, x2, y2);
        }
        else {
          line.setTo(x1, y1, x1, y1);
        }
        var coords = line.coordinatesOnLine(1);
        //This checks to see if there are any barrier tiles along the line.  If there are, the line stops at the barrier.
        if (coords.length > 1) {
          for (var i = 1; i < coords.length; i++) {
            var tile = map.getTile(Math.ceil(coords[i][0] / 32 - 1), Math.ceil(coords[i][1] / 32 - 1), 'Tile Layer 1', true);
            if (tile) {
              if (tile.index === 34 || tile.index === 6 || tile.index === 12) {
                line.setTo(x1, y1, coords[i - 1][0], coords[i - 1][1]);
                break;
              }
            }
          }
        }
        target();
      }

      function target() {
        for (var j = 0; j < players.length; j++) {
          if (Math.abs(players[j].x - newGame.input.activePointer.x) < players[j].width / 2 && Math.abs(players[j].y - newGame.input.activePointer.y) < players[j].height / 2 && line.end.x === newGame.input.activePointer.x && line.end.y === newGame.input.activePointer.y) {
            //This triggers if the targeting line is unbroken and the cursor is over another player
            players[j].width = 35;
            players[j].height = 35;
            players[j].target = true;
          }
          else if (!players[j].turn) {
            //This triggers if the targeting line is broken and the cursor is over another player
            players[j].width = 17;
            players[j].height = 17;
            players[j].target = false;
          }
          else {
            //This triggers if the cursor is over the player whose turn it is
            players[j].target = false;
          }
        }
      }

      function nextTurn() {
        //This function triggers after a player has taken their turn
        //This re-creates the click event for the next player's action
        newGame.input.onDown.add(action, this);
        for (var i = 0; i < buttons.length; i++) {
          //This hides the extra_turn, shield, and dig buttons
          buttons[i].visible = false;
        }
        for (i = 0; i < players.length; i++) {
          if (players[i].turn) {
            //This triggers if a player took an extra turn
            if (players[i].extra_turn) {
              players[i].extra_turn = false;
            }
            else {
              // if ($scope.game.type === 'multiplayer') {
              //   sendInfo();
              // }
              //This triggers if a player did not take an extra turn
              //lavaTest will test to see if the player who just took a turn is standing on lava.  If they are, they will take one damage.
              lavaTest();
              //This is a counter that keeps track of the number of turns without damage.
              turnsWithoutDamage++;
              //This resets the turn counter.  It is necessary if somebody died this turn.
              turn = i;
              //This increments the turn counter
              turn++;
              if (players.length === 2 || Math.floor(Math.random() * 10) === 3) {
                if (players.length === 2) {
                  //This triggers if there are only two players left.  The removeBarriers function will remove half of the remaining barrier tiles.
                  removeBarriers();
                }
                //This triggers either randomly or if there are only two players left. The shuffle function will relocate all players randomly.
                shuffle();
              }
              else if (Math.floor(Math.random() * 10) === 7) {
                //This triggers randomly.  phantomAttack will randomly attack some players if the paramater passed is false.
                phantomAttack(false);
              }
              else if (Math.floor(Math.random() * 10) === 5) {
                //This triggers randomly.  phantomHeal will randomly heal some players.
                phantomHeal();
              }
              if (turnsWithoutDamage >= players.length) {
                //This triggers if everybody has taken a turn and no damage has been done.  phantomAttack will attack everybody if the paramater passed is true.
                  phantomAttack(true);
              }
            }
          }
        }
      }

      // function sendInfo() {
      //   var obj = [];
      //   for (var i = 0; i < players.length; i++) {
      //     obj.push({
      //       hp: players[i].hp,
      //       sap: players[i].sap,
      //       maxhp: players[i].maxhp,
      //       maxsap: players[i].maxsap,
      //       x: players[i].x,
      //       y: players[i].y,
      //       shield: players[i].shield,
      //       wand: players[i].wand
      //     });
      //   }
      //   $scope.game.record.set('gameInfo', {players: obj});
      // }

      function removeBarriers() {
        //This function removes some of the remaining barriers
        //Identifies the number of tiles on each axis
        var x = $(window).width() / 32 - 1;
        var y = $(window).height() / 32 - 1;
        for (var i = 0; i < y; i++) {
          for (var j = 0; j < x; j++) {
            //Counting from the top left corner, this identifies every tile
            var tile = map.getTile(j, i, 'Tile Layer 1', true);
            if (tile) {
              //Randomly replaces one in four barrier tiles with a base tile
              if (Math.floor(Math.random() * 4) === 0) {
                map.replace(6, 1, j, i, 1, 1);
              }
            }
          }
        }
        notify("The Phantom breaks down the barriers.");
      }

      function phantomHeal() {
        //This function randomly heals some players
        for (var i = 0; i < players.length; i++) {
          if (Math.floor(Math.random() * 2) === 1) {
            if (players[i].hp < players[i].maxhp) {
              notify("The Phantom has mercy and heals " + players[i].key + "!");
            }
            players[i].hp += 2;
            players[i].showDamage(2);
            if (players[i].hp > players[i].maxhp) {
              //Prevents a player from being healed past their max hp
              players[i].hp = players[i].maxhp;
            }
          }
        }
      }

      function phantomAttack(bool) {
        //This function deals damage to players, either randomly if bool=false, or to everybody if bool=true
        for (var i = 0; i < players.length; i++) {
          if (Math.floor(Math.random() * 2) === 1 || bool) {
            notify("An angry phantom attacks " + players[i].key + "!");
            //Prevents the phantom from killing players.  If they don't have enough health to absorb a full attack, their health will be set to one.
            if (players[i].hp > 3) {
              doDamage(players[i], 3);
            }
            else {
              doDamage(players[i], players[i].hp - 1);
            }
          }
        }
        if (bool) {
          notify("If you won't attack each other,\n then HE WILL!");
        }
      }

      function shuffle() {
        //Resets all players in random locations
        for (var i = 0; i < players.length; i++) {
          players[i].reset(Math.floor(Math.random() * $(window).width()), Math.floor(Math.random() * $(window).height()));
        }
        notify("The Phantom tires of your \n locations and changes them!");
      }

      function lavaTest() {
        //Tests to see if a player is standing on lava at the end of their turn.  Deals one damage to that player if they are.
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            //Identifies the tile that the player is on.
            var x = Math.ceil(players[i].x / 32  - 1);
            var y = Math.ceil(players[i].y / 32  - 1);
            var tile = map.getTile(x, y, 'Tile Layer 1', true);
            //If the tile is a lava tile, one damage is taken.
            if (tile.index === 85) {
              doDamage(players[i], 1);
            }
          }
        }
      }

      function doDamage(target, amt) {
        //This function deals amt of damage to target.
        //Resets the turnsWithoutDamage counter to 0
        turnsWithoutDamage = 0;
        if (target.shield) {
          //This handles shields absorbing damage.
          var tick = 0;
          while (target.shield > 0) {
            target.shield--;
            amt--;
            tick++;
          }
          notify(target.key + "\'s Shield absorbs " + tick + " damage!");
        }
        if (amt > 0) {
          //If there is no shield or there is leftover damage after the shield:
          target.hp -= amt;
          //Triggers the damage animation
          target.showDamage(-1 * amt);
          //Triggers the flicker animation
          time = Date.now();
          notify(target.key + " takes " + amt + " damage.");
          target.flicker = setInterval(function() {
            target.visible = !target.visible;
          }, 100);
        }
        if (target.hp <= 0) {
          //This handles death
          notify(target.key + " has tragically perished.");
          //levelUp will grant the player who killed the other player extra maxhp and extra maxsap
          levelUp();
          //Hides the target, killing them
          target.visible = false;
          target.width = 0;
          for (var i = 0; i < avatars.length; i++) {
            //Hides the target's stats
            if (avatars[i].title === target.key) {
              avatars[i].visible = false;
            }
          }

          // for (var i = 0; i < players.length; i++) {
          //   if (players[i].turn) {
          //     if (players[i + 1].key !== target.key) {
          //       turn--;
          //     }
          //   }
          // }

          //Kills the target
          target.kill();
          //Removes the target from the list of players
          players.splice(players.indexOf(target), 1);
          //Updates the API with a losing player
          $http.post('https://phantom-mmesereau.herokuapp.com/loss', {nickname: target.key});
          if (players.length === 1) {
            //Triggers if there is only one remaining player
            winner();
          }
        }
      }

      function levelUp() {
        //This function will increase the hp, maxhp, sap, and maxsap of the player who killed somebody
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            if (players[i].hp !== 0) {
              notify(players[i].key + " absorbs some power!");
            }
            players[i].hp += 2;
            players[i].showDamage(2);
            players[i].maxhp += 2;
            players[i].sap += 3;
            players[i].maxsap += 3;
          }
        }
      }


      function render() {
          newGame.debug.geom(line);
      }

      function generateMap() {
        //This function creates the map
        var x = $(window).width() / 32;
        var y = $(window).height() / 32;
        for (var i = 0; i < 6; i++) {
          //This loop randomly places six capsules on the map
          var capX = Math.floor(Math.random() * x);
          var capY = Math.floor(Math.random() * y);
          var tile = map.getTile(capX, capY, 'Tile Layer 1', true);
          if (tile) {
            map.replace(1, 34, capX, capY, 1, 1);
          }
        }
        for (i = 0; i < y; i++) {
          for (var j = 0; j < x; j++) {
            //This loop randomly creates barrier tiles
            tile = map.getTile(j, i, 'Tile Layer 1', true);
            if (tile) {
              if (Math.floor(Math.random() * 5) === 0) {
                map.replace(1, 6, j, i, 1, 1);
              }
            }
          }
        }
        // mapSet = false;
        // console.log(mapArray);
        // var x = 0;
        // var y = 0;
        // var width = $(window).width() / 32 - 1;
        // for (var i = 0; i < mapArray.length; i++) {
        //   map.replace(1, mapArray[i], x, y, 1, 1);
        //   if (x < width) {
        //     x++;
        //   }
        //   else {
        //     x = 0;
        //     y++;
        //   }
        // }
      }

      function notify(string) {
        //This function updates the notifications log
        if (string) {
          notificationLog.push(string);
          if (notificationLog.length > 8) {
            //This will remove all messages prior to the eight most recent
            notificationLog.splice(0, 1);
          }
        }
        log.text = "";
        for (var i = 0; i < notificationLog.length; i++) {
          //This sets the log text as the most recent notifications
          log.text += notificationLog[i] + "\n";
        }
      }

      function animateDamage(target) {
        //This function initializes the damage animation
        target.animation = setInterval(function() {
          target.healthChange.fontSize--;
          target.healthChange.x--;
          target.healthChange.y -= 2;
        }, 50);
      }

      function winner() {
        //This function triggers when there is only one player remaining
        gameOverNotification.text = players[0].key + " has emerged victorious.  \nCongratulations, " + players[0].key + "!";
        gameOverNotification.x = newGame.world.centerX - gameOverNotification.width / 2;
        gameOverNotification.y = newGame.world.centerY - gameOverNotification.height / 2;
        players[0].x = newGame.world.centerX;
        players[0].y = newGame.world.centerY;
        for (var i = 0; i < $scope.game.playerNames.length; i++) {
          if (players[0].key === $scope.game.playerNames[i]) {
            $scope.game.playerNames.splice(i, 1);
          }
        }
        //Communicates with the API regarding a winner
        $http.post('http://phantom-mmesereau.herokuapp.com/win', {nickname: players[0].key});
        gameOver.visible = true;
      }

        function endGame() {
          //This triggers when the endGame button is clicked.  It destroys the game and returns to the home page.
          newGame.disableStep();
          newGame.destroy();
          $scope.game.inProgress = false;
          $state.go('home');
        };
    };
    if ($scope.game.type === 'pass' && $scope.game.inProgress) {
      vm.startGame();
    }
    // if ($scope.game.type === 'multiplayer') {
    //   var client = deepstream('localhost:6020');
    //   client.login({username: $scope.profile.nickname});
    //   $scope.game.record = client.record.getRecord('gameInfo');
    //   vm.startGame();
    // }
}]);
