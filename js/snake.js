var sw = 20, //盒子的宽度
	sh = 20, //盒子的高度
	tr = 30, //行数
	td = 30; //列数

var snake = null,// 蛇的实例
	food = null,// 食物的实例
	game = null;// 游戏的实例
	
// 盒子构造函数
function Square(x, y, classname){
	this.x = x * sw;
	this.y = y * sh;
	this.name = classname;
	this.viewContent = document.createElement('div');// 盒子对应的DOM元素
	this.viewContent.className = this.name;
	this.parent = document.getElementById('snakeWrap');// 盒子对应的父级
}
// 创建盒子DOM并且添加到页面中
Square.prototype.create = function(){
	this.viewContent.style.width = sw + 'px';
	this.viewContent.style.height = sh + 'px';
	this.viewContent.style.position = 'absolute';
	this.viewContent.style.left = this.x + 'px';
	this.viewContent.style.top = this.y + 'px';
	
	this.parent.appendChild(this.viewContent);
}
// 删除盒子DOM
Square.prototype.remove = function(){
	this.parent.removeChild(this.viewContent);
}

// 蛇
function Snake(){
	this.head = null;// 存储蛇头信息
	this.tail = null;// 存储蛇尾信息
	this.pos = [];// 用于存储蛇身上每一个盒子的位置
	
	this.directionNum = {// 存储蛇走的方向
		left: {
			x: -1,
			y: 0,
			rotate: 180 //蛇头在不同的方向中应该进行旋转
		},
		right: {
			x: 1,
			y: 0,
			rotate: 0
		},
		up: {
			x: 0,
			y: -1,
			rotate: -90
		},
		down: {
			x: 0,
			y: 1,
			rotate: 90
		}
	}
}
// 创建蛇一开始基本结构
Snake.prototype.init = function(){
	// 创建蛇头
	var snakeHead = new Square(2,0,'snakeHead');
	snakeHead.create();
	this.head = snakeHead;// 存储蛇头信息
	this.pos.push([2,0]);// 把蛇头的位置存起来
	
	// 创建蛇的身体1
	var snakeBody1 = new Square(1,0,'snakeBody');
	snakeBody1.create();
	this.pos.push([1,0,]);// 把蛇身体1的位置存起来
	
	// 创建蛇的身体2
	var snakeBody2 = new Square(0,0,'snakeBody');
	snakeBody2.create();
	this.tail = snakeBody2;// 把蛇尾的信息存储起来
	this.pos.push([0,0,]);// 把蛇身体2的位置存起来
	
	// 形成链表关系
	snakeHead.last = null;
	snakeHead.next = snakeBody1;
	
	snakeBody1.last = snakeHead;
	snakeBody1.next = snakeBody2;
	
	snakeBody2.last = snakeBody1;
	snakeBody2.next = null;
	
	// 给蛇添加一个属性,用来表示蛇走的方向
	this.direction = this.directionNum.right;
}

// 这个方法用来获取蛇头下一个对应的元素,要跟去元素做不同的事情
Snake.prototype.getNextPos = function(){
	var nextPos = [// 蛇头要走的下一个坐标
		this.head.x / sw + this.direction.x,
		this.head.y / sh + this.direction.y
	]
	
	// 下一个点是自己,代表撞到了自己,游戏结束
	var selfCollied = false;// 是否撞到了自己
	this.pos.forEach(function(value){
		if(value[0] == nextPos[0] && value[1] == nextPos[1]){
			// 如有两个数组中的两个数据都相等,就说明下一个点在蛇身上里面能找到,代表撞到自己了
			selfCollied = true;
		}
	});
	if(selfCollied){
		console.log('撞到了自己');
		
		this.strategies.die.call(this);
		
		return;
	}
	
	// 下一个点是围墙,游戏结束
	if(nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td-1 || nextPos[1] > tr-1){
		console.log('撞墙了');
		
		this.strategies.die.call(this);
		
		return;
	}
	
	// 下一个点是食物,吃
	if(food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]){
		// 如果这一个条件成立说明在蛇头要走的下一点是食物那个点
		console.log('撞到食物了')
		this.strategies.eat.call(this);
		return;
	}
	
	// 下一个点什么都不是,走
	this.strategies.move.call(this);
}

// 处理碰撞后要做的事情
Snake.prototype.strategies = {
	move: function(formt){// 这个参数决定要不要删除最后一个盒子(蛇尾),当穿了这个参数后就表示要做的事情是 吃
		// 创建一个新的身体(在旧蛇头的位置)
		var newBody = new Square(this.head.x/sw, this.head.y/sh, 'snakeBody');
		// 更新链表的关系
		newBody.next = this.head.next;
		newBody.next.last = newBody;
		newBody.last = null;
		
		this.head.remove();// 把旧蛇头从原来的位置删除
		newBody.create();
		
		// 创建一个新的蛇头
		var newHead = new Square(this.head.x/sw + this.direction.x, this.head.y/sh + this.direction.y, 'snakeHead');
		// 更行链表的关系
		newHead.next = newBody;
		newHead.last = null;
		newBody.last = newHead;
		newHead.viewContent.style.transform= 'rotate('+ this.directionNum.rotate +'deg)'
		newHead.create();
		
		// 蛇身上每一个盒子的坐标也要更新
		this.pos.splice(0,0,[this.head.x/sw + this.direction.x, this.head.y/sh + this.direction.y]);
		this.head = newHead;// 把蛇头的信息更新一下
		
		// 如果formt的值为false,表示需要删除(除了吃之外的操作)
		if(!formt){
			this.tail.remove();
			this.tail = this.tail.last;
			
			this.pos.pop();
		}
	},
	eat: function(){
		this.strategies.move.call(this,true);
		createFood();
		game.score ++;
	},
	die: function(){
		game.over();
	}
}


snake = new Snake();


// 创建食物
function createFood(){
	// 食物的随机坐标
	var x = null,
		y = null;
	
	var include = true;// 循环跳出条件,true表示食物的坐标在蛇的身上(需要继续循环), false表示蛇的坐标不在蛇身上(不循环了)
	while (include){
		x = Math.round(Math.random() * (td-1));
		y = Math.round(Math.random() * (tr-1));
		
		snake.pos.forEach(function(value){
			if(x != value[0] && y != value[1]){
				// 这个条件成立说明在随机出来这个坐标,在蛇身上并没有找到
				include = false;
			}
		});
	}
	
	// 生成食物
	food = new Square(x, y, 'food');
	food.pos = [x, y];// 存储一下生成食物的坐标,用于跟蛇头要走的下一点对比
	
	var foodDom = document.querySelector('.food');
	if(foodDom){
		foodDom.style.left = x*sw+'px';
		foodDom.style.top = y*sh+'px';
	}else{
		food.create();
	}
}

// 创建游戏逻辑
function Game(){
	snake.timer = null;
	this.score = 0;
}
Game.prototype.init = function(){
	snake.init();
	createFood();
	snake.getNextPos();
	
	document.onkeydown = function(e){
		if(e.which == 37 && snake.direction != snake.directionNum.right){// 用户按下左键的实话,这条蛇不能正在往右走
			snake.direction = snake.directionNum.left;
		}else if(e.which == 38 && snake.direction != snake.directionNum.down){
			snake.direction = snake.directionNum.up;
		}else if(e.which == 39 && snake.direction != snake.directionNum.left){
			snake.direction = snake.directionNum.right;
		}else if(e.which == 40 && snake.direction != snake.directionNum.up){
			snake.direction = snake.directionNum.down;
		}
	}
	
	this.start();
}
Game.prototype.start = function(){
	this.timer = setInterval(function(){
		snake.getNextPos()
	},200);
}
Game.prototype.pause = function(){
	clearInterval(this.timer);
}
Game.prototype.over = function(){
	clearInterval(this.timer);
	alert('您的得分为' + this.score);
	
	// 游戏回到最初时的状态
	var snakeWrap = document.getElementById("snakeWrap");
	snakeWrap.innerHTML = '';
	
	snake = new Snake();
	game = new Game();
	
	var startBtnWrap = document.querySelector('.startBtn');
	startBtnWrap.style.display = 'block';
}

// 开启游戏
game = new Game();
var startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function(){
	startBtn.parentNode.style.display = 'none';
	game.init();
}

// 暂停游戏
var snakeWrap = document.getElementById("snakeWrap");
var pauseBtn = document.querySelector('.pauseBtn button');
snakeWrap.onclick = function(){
	game.pause();
	
	pauseBtn.parentNode.style.display = 'block';
}

pauseBtn.onclick = function(){
	game.start();
	this.parentNode.style.display = 'none';
}








