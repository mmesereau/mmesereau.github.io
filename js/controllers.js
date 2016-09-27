'use strict';

app.controller('HomeController', ['HomeService', '$state', '$window', '$scope', function(HomeService, $state, $window, $scope) {
  var vm = this;
  vm.$state = $state;
  $scope.game = {};
  $scope.game.inProgress = false;
  if ($window.localStorage.token) {
    $scope.profile = HomeService.getProfile();
    vm.loggedIn = true;
  }
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
  }, 40);

  vm.logout = function() {
    delete $window.localStorage.token;
    vm.loggedIn = false;
    $state.go('home');
  };
}]);

app.controller("LoginController", ['LoginService', '$state', '$window', function(LoginService, $state, $window) {
  if ($window.localStorage.token) {
    $state.go('home');
  }
  var vm = this;
  vm.$state = $state;
  vm.user = {};
  vm.login = function() {
    LoginService.login(vm.user);
  };
}]);

app.controller("RegisterController", ['RegisterService', '$state', '$window', function(RegisterService, $state, $window) {
  if ($window.localStorage.token) {
    $state.go('home');
  }
  var vm = this;
  vm.newUser = {};
  vm.$state = $state;
  vm.register = function() {
    RegisterService.register(vm.newUser);
  };
}]);

app.controller("LeaderboardController", ['LeaderboardService', '$state', '$http', function(LeaderboardService, $state, $http) {
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
  vm.wins = function() {
    LeaderboardService.wins(vm.leaders);
  };
  vm.losses = function() {
    LeaderboardService.losses(vm.leaders);
  };
  vm.percentage = function() {
    LeaderboardService.percentage(vm.leaders);
  };
}]);

app.controller("MultiplayerController", ['$state', '$http', '$scope', function($state, $http, $scope) {
  var vm = this;
  vm.numberOfPlayers = 4;
  vm.getGames = function() {
    $http.get('http://phantom-mmesereau.herokuapp.com/multiplayer')
    .then(function(data) {
      vm.allGames = data.data;
      for (var i = 0; i < vm.allGames.length; i++) {
        for (var j = 0; j < vm.allGames[i].users.length; j++) {
          if (vm.allGames[i].users[j].id === $scope.profile.id) {
            vm.allGames[i].joined = true;
          }
        }
      }
    })
    .catch(function(err) {
      console.log(err);
    });
  };
  vm.getGames();
  vm.addGame = function() {
    $http.post('http://phantom-mmesereau.herokuapp.com/multiplayer', {name: vm.gameName, id: $scope.profile.id})
    .then(function() {
      vm.gameName = "";
      vm.newGame = false;
      vm.getGames();
    })
    .catch(function(err) {
      console.log(err);
    });
  };
  vm.join = function(id) {
    $http.post('http://phantom-mmesereau.herokuapp.com/multiplayer/join', {games_id: id, users_id: $scope.profile.id})
    .then(function() {
      vm.getGames();
    })
    .catch(function(err) {
      console.log(err);
    });
  };
  vm.go = function(game) {
    $scope.game.game = game;
    $state.go('staging', {game_name: game.name});
  };
}]);

app.controller("StagingController", ['$state', '$stateParams', '$scope', function($state, $stateParams, $scope) {
  var vm = this;
  vm.gameName = $stateParams.game_name;
  vm.presentPlayers = [];
  var client = deepstream('localhost:6020');
  client.login({username: $scope.profile.nickname});
  var record = client.record.getRecord('word');
  record.set('presentPlayers', $scope.profile.nickname);
  record.subscribe('presentPlayers', function(value) {
    $scope.$apply(vm.presentPlayers.push(value));
    vm.newPlayer();
  });
  vm.newPlayer = function() {
    vm.numberOfPlayersPresent = 0;
    for (var i = 0; i < vm.presentPlayers.length; i++) {
      for (var j = 0; j < $scope.game.game.users.length; j++) {
        if ($scope.game.game.users[j].username === vm.presentPlayers[i]) {
          vm.numberOfPlayersPresent++;
        }
      }
    }
    if (vm.numberOfPlayersPresent === /*TODO$scope.game.game.users.length*/2) {
      $scope.$apply(vm.allPlayersPresent = true);
      $scope.$apply(vm.countdown = 5);
      $scope.setCountdown = setInterval(function() {
        $scope.$apply(vm.countdown--);
        if (vm.countdown === 0) {
          vm.begin();
        }
      }, 1000);
    }
  };
  vm.begin = function() {
    clearInterval($scope.setCountdown);
    $scope.game.playerNames = vm.presentPlayers;
    $scope.game.type = 'multiplayer';
    $state.go('game');
  };
}]);

app.controller("PassAndPlayController", ['$scope', '$state', function($scope, $state) {
  var vm = this;
  $scope.game.playerNames = [];
  vm.startPnP = function() {
    for (var i = 0; i < vm.players; i++) {
      $scope.game.playerNames.push("");
    }
    vm.pnpinit = true;
  };
  vm.startGame = function() {
    $scope.game.type = 'pass';
    $state.go('game');
  };
}]);

app.controller("GameController", ['$scope', '$state', '$http', function($scope, $state, $http) {
  var vm = this;
  vm.$state = $state;
  vm.startGame = function() {
    $scope.game.inProgress = true;
      var newGame = new Phaser.Game($(window).width(), $(window).height(), Phaser.CANVAS, '', { preload: preload, create: create, update: update, render: render });

      var map, layer, sprites, line, turn, basic_attack, special_attack, avatarWidth, avatarHeight, turnsWithoutDamage, move, shield, extra_turn, dig, capsule, log, turn_text, lava_done, capsules, flicker, time, notification, note, buttons, buttonsShow, digLine, gameOverNotification, playerWhoseTurnItIs, gameOver;
      var players = [];
      var notifications = [];
      var notificationLog = [];
      var avatars = [];
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
        basic_attack = newGame.add.button($(window).width() - 200, 200, 'basic_attack', do_basic_attack, this);
        special_attack = newGame.add.button($(window).width() - 200, 250, 'special_attack', do_special_attack, this);
        shield = newGame.add.button($(window).width() - 200, 300, 'shield', do_shield, this);
        move = newGame.add.button($(window).width() - 200, 150, 'move', do_move, this);
        capsule = newGame.add.button($(window).width() - 200, 50, 'capsule', do_capsule, this);
        dig = newGame.add.button($(window).width() - 200, 100, 'dig', do_dig, this);
        extra_turn = newGame.add.button($(window).width() - 200, 0, 'extra_turn', do_extra_turn, this);
        turn_text = newGame.add.text(0, 0, "Filler Text", {font: "40px Arial", fill: "white"});
        log = newGame.add.text(0, 45, "", {font: "30px Arial", fill: "white"});
        gameOver = newGame.add.button($(window).width() - 400, 0, 'gameover', endGame, this);
        line = new Phaser.Line(players[0].x, players[0].y, players[0].x, players[0].y);
        buttons=[basic_attack, special_attack, shield, move, capsule, dig, extra_turn, gameOver];
        buttonsShow = true;
        layer.resizeWorld();
        map.setCollisionBetween(6, 34);
        newGame.physics.p2.convertTilemap(map, layer);
        newGame.physics.p2.gravity.y = 0;
        newGame.physics.p2.enable(line);
        for (i = 0; i < players.length; i++) {
          newGame.physics.p2.enable(players[i]);
          players[i].key = $scope.game.playerNames[i];
          players[i].turn = false;
          players[i].hp = 6;
          players[i].maxhp = 6;
          players[i].sap = 10;
          players[i].maxsap = 10;
          players[i].shield = 0;
          players[i].wand = 0;
          players[i].hoverName = players[i].addChild(newGame.add.text(-50, 0, players[i].key, {fill: "white", font: "18px Arial"}));
        }
        for (i = 0; i < avatars.length; i++) {
          avatarWidth = $(window).width() / avatars.length;
          avatarHeight = $(window).height() * 0.2;
          avatars[i].reset(avatarWidth * i, $(window).height() - avatarHeight);
          // avatars[i].width = avatarWidth / 4;
          // avatars[i].height = avatarWidth / 4;
          avatars[i].title = players[i].key;
          avatars[i].name = avatars[i].addChild(newGame.add.text(0, avatarHeight / 2, players[i].key, {fill: "white", font: "18px Arial"}))
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
        turn = 0;
        capsules = ['health', 'wand', 'lava', 'death', 'wand', 'health'];
        notification = newGame.add.text(newGame.world.centerX, newGame.world.centerY, "Let the game begin!", {font: '64px Arial', fill: 'white'});
        gameOverNotification = newGame.add.text(newGame.world.centerX, newGame.world.centerY, "", {font: '75px Arial', fill: 'white'});
        note = setInterval(function() {
          notification.fontSize++;
          notification.x = newGame.world.centerX - notification.width / 2;
          notification.y = newGame.world.centerY - notification.height / 2;
        }, 1);
        generateMap();
      }

      function update() {
        for (var i = 0; i < players.length; i++) {
          players[i].body.setZeroVelocity();
          for (var j = 0; j < avatars.length; j++) {
            if (avatars[j].title === players[i].key) {
              avatars[j].healthbar.width = players[i].hp / players[i].maxhp * avatarWidth / 2;
              avatars[j].healthnote.text = players[i].hp + " / " + players[i].maxhp + " Hit Points";
              avatars[j].sapbar.width = players[i].sap / players[i].maxsap * avatarWidth / 2;
              avatars[j].sapnote.text = players[i].sap + " / " + players[i].maxsap + " Special Points";
              avatars[j].shieldnote.text = "SHIELD: " + players[i].shield;
              avatars[j].wandnote.text = "WAND: " + players[i].wand;
            }
          }
          if (turn % players.length === i) {
            playerWhoseTurnItIs = players[i].key;
            players[i].turn = true;
            turn_text.text = players[i].key + "\'s Turn";
            players[i].height = 30;
            players[i].width = 30;
            changeline(players[i]);

          }
          else if (!players[i].target) {
            players[i].turn = false;
            players[i].height = 17;
            players[i].width = 17;
            players[i].hoverName.visible = false;
          }
          else {
            players[i].turn = false;
          }
          if (Math.abs(players[i].x - newGame.input.activePointer.x) < players[i].width / 2 && Math.abs(players[i].y - newGame.input.activePointer.y) < players[i].height / 2) {
            players[i].hoverName.visible = true;
          }
        }
        for (var i = 0; i < avatars.length; i++) {
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
          flicker = 0;
          for (i = 0; i < players.length; i++) {
            players[i].visible = true;
          }
        }
        if (newGame.input.activePointer.y > $(window).height() - avatarHeight) {
          for (var i = 0; i < avatars.length; i++) {
            avatars[i].visible = false;
          }
        }
        else {
          for (var i = 0; i < avatars.length; i++) {
            if (!avatars[i].dead) {
              avatars[i].visible = true;
            }
          }
        }
        if (notification.fontSize > 180) {
          clearInterval(note);
          // note = 0;
          notification.text = "";
          notification.fontSize = 64;
          notifications.splice(0, 1);
          if (notifications.length > 0) {
            notify();
          }
        }
        for (i = 0; i < buttons.length; i++) {
          if (newGame.input.activePointer.x < buttons[i].x || newGame.input.activePointer.y > buttons[2].y + buttons[2].height || !buttonsShow/* || ($scope.game.type === 'multiplayer' && playerWhoseTurnItIs !== $scope.profile.nickname)*/) {
            buttons[i].visible = false;
          }
          else {
            buttons[i].visible = true;
          }
        }
        if (newGame.input.activePointer.x > log.left && newGame.input.activePointer.x < log.right && newGame.input.activePointer.y > log.top && newGame.input.activePointer.y < log.bottom) {
          log.visible = false;
        }
        else {
          log.visible = true;
        }
        turn_text.visible = false;
        if (digLine) {
          digLine.setTo(digLine.start.x, digLine.start.y, newGame.input.activePointer.x, newGame.input.activePointer.y);
        }
        if (players.length === 1) {
          winner();
        }
      }

      function do_capsule() {
        buttonsShow = false;
        newGame.input.onDown.addOnce(do_capsule_2, this);
      }

      function do_capsule_2() {
        var x = Math.ceil(newGame.input.activePointer.x / 32 - 1);
        var y = Math.ceil(newGame.input.activePointer.y / 32 - 1);
        var tile = map.getTile(x, y, 'Tile Layer 1', true);
        if (tile.index === 34) {
          var index = Math.floor(Math.random() * capsules.length);
          notify(playerWhoseTurnItIs + " opens a " + capsules[index] + " capsule.");
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
          else {
            alert("problem with if loop");
          }
          capsules.splice(capsules.indexOf(capsules[index]), 1);
        }
      }

      function health() {
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            players[i].hp = players[i].maxhp;
            players[i].sap = players[i].maxsap;
            var x = Math.ceil(newGame.input.activePointer.x / 32 - 1);
            var y = Math.ceil(newGame.input.activePointer.y / 32 - 1);
            map.replace(34, 1, x, y, 1, 1);
            nextTurn();
          }
        }
      }

      function wand() {
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            players[i].wand = 2;
            var x = Math.ceil(newGame.input.activePointer.x / 32 - 1);
            var y = Math.ceil(newGame.input.activePointer.y / 32 - 1);
            map.replace(34, 1, x, y, 1, 1);
            nextTurn();
          }
        }
      }

      function death() {
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            doDamage(players[i], 6);
          }
        }
        var x = Math.ceil(newGame.input.activePointer.x / 32 - 1);
        var y = Math.ceil(newGame.input.activePointer.y / 32 - 1);
        map.replace(34, 1, x, y, 1, 1);
        nextTurn();
      }

      function lava(x, y) {
        var init = false;
        if (typeof x !== 'number' && typeof y !== 'number') {
          init = true;
          x = Math.ceil(newGame.input.activePointer.x / 32 - 1);
          y = Math.ceil(newGame.input.activePointer.y / 32 - 1);
          lava_done = true;
        }
        var tile = map.getTile(x, y, 'Tile Layer 1', true);
        if ((init && tile.index === 34) || !init) {
          if (Math.floor(Math.random() * 2) === 0) {
            map.replace(tile.index, 85, x, y, 1, 1);
          }
          else {
            map.replace(tile.index, 2, x, y, 1, 1);
          }
          var surrounding = [map.getTile(x, y - 1, 'Tile Layer 1', true), map.getTile(x, y + 1, 'Tile Layer 1', true), map.getTile(x - 1, y, 'Tile Layer 1', true), map.getTile(x + 1, y, 'Tile Layer 1', true)];
          for (var i = 0; i < surrounding.length; i++) {
            if (surrounding[i] && surrounding[i].index === 1) {
              lava(surrounding[i].x, surrounding[i].y);
            }
          }
        }
        if (init) {
          for (var i = 0; i < players.length; i++) {
            if (!players[i].turn) {
              doDamage(players[i], 1);
            }
          }
          nextTurn();
        }
      }

      function do_dig() {
         buttonsShow = false;
        newGame.input.onDown.addOnce(do_dig_2, this);
      }

      function do_dig_2() {
        digLine = new Phaser.Line(newGame.input.activePointer.x, newGame.input.activePointer.y, newGame.input.activePointer.x, newGame.input.activePointer.y);
        newGame.input.onDown.addOnce(do_dig_3, this);
      }


      function do_dig_3() {
        buttonsShow = true;
        var coords = digLine.coordinatesOnLine(1);
        for (var i = 1; i < coords.length; i++) {
          var x = Math.ceil(coords[i][0] / 32 - 1);
          var y = Math.ceil(coords[i][1] / 32 - 1);
          map.replace(6, 1, x, y, 1, 1);
        }
        digLine = undefined;
        nextTurn();
      }


      function do_move() {
        buttonsShow = false;
        newGame.input.onDown.addOnce(do_move_2, this);
      }

      function do_move_2() {
        buttonsShow = true;
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            players[i].reset(newGame.input.activePointer.x, newGame.input.activePointer.y);
            nextTurn();
          }
        }
      }

      function do_extra_turn() {
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            if (players[i].sap >= 3) {
              players[i].extra_turn = true;
              players[i].sap -= 3;
            }
            else {
              alert("You do not have the Special Points necessary to do this.");
            }
          }
        }
      }

      function do_basic_attack() {
        buttonsShow = false;
        newGame.input.onDown.addOnce(do_basic_attack_2, this);
      }

      function do_basic_attack_2() {
        buttonsShow = true;
        for (var i = 0; i < players.length; i++) {
          if (players[i].target) {
            doDamage(players[i], 1);
            nextTurn();
          }
        }
      }

      function do_special_attack() {
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            if (players[i].sap >= 2 || (players[i].wand && players[i].wand > 0)) {
              buttonsShow = false;
              newGame.input.onDown.addOnce(do_special_attack_2, this);
            }
            else {
              alert("You do not have the Special Points necessary to do this.");
            }
          }
        }
      }

      function do_special_attack_2() {
        buttonsShow = true;
        for (var i = 0; i < players.length; i++) {
          for (var j = 0; j < players.length; j++) {
            if (players[i].target && players[j].turn) {
              doDamage(players[i], 2);
              if (players[j].wand && players[j].wand > 0) {
                players[j].wand--;
              }
              else {
                players[j].sap -= 2;
              }
              nextTurn();
            }
          }
        }
      }

      function do_shield() {
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            if (players[i].sap >= 2) {
              players[i].shield = 2;
              players[i].sap -= 2;
              nextTurn();
            }
            else {
              alert("You do not have the Special Points necessary to do this.");
            }
          }
        }
      }

      function changeline(player) {
        var x1 = player.x;
        var y1 = player.y;
        var x2 = newGame.input.activePointer.x;
        var y2 = newGame.input.activePointer.y;
        if (x2 && y2) {
          line.setTo(x1, y1, x2, y2);
        }
        else {
          line.setTo(x1, y1, x1, y1);
        }
        var coords = line.coordinatesOnLine(1);
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
            players[j].width = 35;
            players[j].height = 35;
            players[j].target = true;
          }
          else if (!players[j].turn) {
            players[j].width = 17;
            players[j].height = 17;
            players[j].target = false;
          }
          else {
            players[j].target = false;
          }
        }
      }

      function nextTurn() {
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            if (players[i].extra_turn) {
              players[i].extra_turn = false;
            }
            else {
              // if ($scope.game.type === 'multiplayer') {
              //   sendInfo();
              // }
              lavaTest();
              turn++;
              turnsWithoutDamage++;
              console.log(turnsWithoutDamage, players.length);
              turn = turn % players.length;
              if (players.length === 2 || Math.floor(Math.random() * 10) === 3) {
                if (players.length === 2) {
                  removeBarriers();
                }
                shuffle();
              }
              else if (Math.floor(Math.random() * 10) === 7) {
                phantomAttack(false);
              }
              else if (Math.floor(Math.random() * 10) === 5) {
                phantomHeal();
              }
              if (turnsWithoutDamage >= players.length) {
                  phantomAttack(true);
              }
            }
          }
        }
        buttonsShow = true;
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
        var x = $(window).width() / 32 - 1;
        var y = $(window).height() / 32 - 1;
        for (var i = 0; i < y; i++) {
          for (var j = 0; j < x; j++) {
            var tile = map.getTile(j, i, 'Tile Layer 1', true);
            if (tile) {
              if (Math.floor(Math.random() * 4) === 0) {
                map.replace(6, 1, j, i, 1, 1);
              }
            }
          }
        }
        notify("The Phantom breaks down the barriers.");
      }

      function phantomHeal() {
        for (var i = 0; i < players.length; i++) {
          if (Math.floor(Math.random() * 2) === 1) {
            if (players[i].hp < players[i].maxhp) {
              notify("The Phantom has mercy and heals " + players[i].key + "!");
            }
            players[i].hp += 2;
            if (players[i].hp > players[i].maxhp) {
              players[i].hp = players[i].maxhp;
            }
          }
        }
      }

      function phantomAttack(bool) {
        for (var i = 0; i < players.length; i++) {
          if (Math.floor(Math.random() * 2) === 1 || bool) {
            notify("An angry phantom attacks " + players[i].key + "!");

            if (players[i].hp > 3) {
              doDamage(players[i], 3);
            }
            else {
              doDamage(players[i], players[i].hp - 1);
            }
          }
        }
        if (bool) {
          notify("If you won't attack each other, then he will!")
        }
      }

      function shuffle() {
        for (var i = 0; i < players.length; i++) {
          players[i].reset(Math.floor(Math.random() * $(window).width()), Math.floor(Math.random() * $(window).height()));
        }
        notify("SHUFFLE!");
      }

      function lavaTest() {
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            var x = Math.ceil(players[i].x / 32  - 1);
            var y = Math.ceil(players[i].y / 32  - 1);
            var tile = map.getTile(x, y, 'Tile Layer 1', true);
            if (tile.index === 85) {
              doDamage(players[i], 1);
            }
          }
        }
      }

      function doDamage(target, amt) {
        turnsWithoutDamage = 0;
        if (target.shield) {
          var tick = 0;
          while (target.shield > 0) {
            target.shield--;
            amt--;
            tick++;
          }
          notify(target.key + "\'s Shield absorbs " + tick + " damage!");
        }
        if (amt > 0) {
          target.hp -= amt;
          time = Date.now();
          notify(target.key + " takes " + amt + " damage.");
          flicker = setInterval(function() {
            target.visible = !target.visible;
          }, 100);
        }
        if (target.hp <= 0) {
          notify(target.key + " dies.");
          levelUp();
          target.visible = false;
          target.width = 0;
          target.kill();
          players.splice(players.indexOf(target), 1);
        }
      }

      function levelUp() {
        for (var i = 0; i < players.length; i++) {
          if (players[i].turn) {
            if (players[i].hp !== 0) {
              notify(players[i].key + " levels up!");
            }
            players[i].hp += 2;
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
        var x = $(window).width() / 32;
        var y = $(window).height() / 32;
        for (var i = 0; i < 6; i++) {
          map.replace(1, 34, Math.floor(Math.random() * x), Math.floor(Math.random() * y), 1, 1);
        }
        for (i = 0; i < y; i++) {
          for (var j = 0; j < x; j++) {
            var tile = map.getTile(j, i, 'Tile Layer 1', true);
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
        if (string) {
          notifications.push(string);
          notificationLog.push(string);
          while (notificationLog.length > 4) {
            notificationLog.splice(0, 1);
          }
        }
        notification.text = notifications[0];
        log.text = "";
        for (var i = 0; i < notificationLog.length; i++) {
          log.text += notificationLog[i] + "\n";
        }
        notification.fontSize = 28;
        note = setInterval(function() {
          notification.fontSize++;
          notification.x = newGame.world.centerX - notification.width / 2;
          notification.y = newGame.world.centerY - notification.height / 2;
        }, 15);
      }

      function winner() {
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
        $http.post('http://phantom-mmesereau.herokuapp.com/win', {nickname: players[0].key})
        .then(function() {
          var output = [];
          for (i = 0; i < $scope.game.playerNames.length; i++) {
            output.push($http.post('http://phantom-mmesereau.herokuapp.com/loss', {nickname: $scope.game.playerNames[i]}));
          }
          return Promise.all(output);
        })
        .catch(function(err) {
          console.log(err);
        });
        buttons.splice(buttons.indexOf(gameOver), 1);
        gameOver.visible = true;
      }

        function endGame() {
          newGame.disableStep();
          newGame.destroy();
          $scope.game.inProgress = false;
          $state.go('home');
        };
    };
    if ($scope.game.type === 'pass') {
      vm.startGame();
    }
    // if ($scope.game.type === 'multiplayer') {
    //   var client = deepstream('localhost:6020');
    //   client.login({username: $scope.profile.nickname});
    //   $scope.game.record = client.record.getRecord('gameInfo');
    //   vm.startGame();
    // }
}]);
