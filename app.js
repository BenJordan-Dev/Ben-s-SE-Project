document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // Game card click tracking
  // ============================================================
  document.querySelectorAll('.game-card').forEach(card => {
    const gameKey = card.dataset.game
    const productUrl = `product.html?game=${gameKey}`

    card.querySelector('.game-image').addEventListener('click', () => {
      window._klOnsite = window._klOnsite || []
      klaviyo.push(['track', 'Viewed Product', {
        'Game Title': card.querySelector('.game-title-link').textContent,
        'Game ID': gameKey,
        'Source': 'image'
      }])
      window.open(productUrl, '_blank')
    })

    card.querySelector('.game-title-link').addEventListener('click', () => {
      klaviyo.push(['track', 'Viewed Product', {
        'Game Title': card.querySelector('.game-title-link').textContent,
        'Game ID': gameKey,
        'Source': 'title'
      }])
      window.open(productUrl, '_blank')
    })
  })

  // ============================================================
  // Signup form
  // ============================================================
  document.getElementById('signupBtn').addEventListener('click', () => {
    const firstName = document.getElementById('firstName').value.trim()
    const email = document.getElementById('email').value.trim()
    const favouriteGame = document.getElementById('favouriteGame').value

    if (!email) { alert('Please enter your email address'); return }

    klaviyo.push(['identify', {
      '$email': email,
      '$first_name': firstName,
      'Favourite Game': favouriteGame
    }])

    klaviyo.push(['track', 'Newsletter Signup', {
      'First Name': firstName,
      'Favourite Game': favouriteGame,
      'Source': 'Hero Form'
    }])

    console.log('Identified:', email)
    document.getElementById('signupBtn').style.display = 'none'
    document.getElementById('successMsg').style.display = 'block'
  })

  // ============================================================
  // Mini Game — LevelUp Runner
  // ============================================================
  const canvas = document.getElementById('gameCanvas')
  const ctx = canvas.getContext('2d')

  const W = canvas.width
  const H = canvas.height
  const GROUND = H - 40

  let playerEmail = ''
  let score = 0
  let highScore = parseInt(localStorage.getItem('levelup_highscore') || '0')
  let gameRunning = false
  let animFrame

  // Player
  const player = {
    x: 80, y: GROUND, w: 30, h: 40,
    vy: 0, jumping: false,
    jump() {
      if (!this.jumping) {
        this.vy = -12
        this.jumping = true
      }
    },
    update() {
      this.vy += 0.6
      this.y += this.vy
      if (this.y >= GROUND) {
        this.y = GROUND
        this.vy = 0
        this.jumping = false
      }
    },
    draw() {
      ctx.fillStyle = '#7b2ff7'
      ctx.fillRect(this.x, this.y - this.h, this.w, this.h)
      // Eyes
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(this.x + 18, this.y - this.h + 8, 6, 6)
      ctx.fillStyle = '#0a0a0f'
      ctx.fillRect(this.x + 20, this.y - this.h + 10, 3, 3)
    }
  }

  // Obstacles
  let obstacles = []
  let obstacleTimer = 0
  let obstacleInterval = 90
  let speed = 4

  function spawnObstacle() {
    const h = 20 + Math.random() * 30
    obstacles.push({ x: W, y: GROUND - h, w: 20, h })
  }

  function updateObstacles() {
    obstacleTimer++
    if (obstacleTimer >= obstacleInterval) {
      spawnObstacle()
      obstacleTimer = 0
      obstacleInterval = Math.max(50, obstacleInterval - 1)
    }
    obstacles.forEach(o => o.x -= speed)
    obstacles = obstacles.filter(o => o.x + o.w > 0)
  }

  function drawObstacles() {
    obstacles.forEach(o => {
      ctx.fillStyle = '#14b57f'
      ctx.fillRect(o.x, o.y, o.w, o.h)
    })
  }

  function checkCollision() {
    return obstacles.some(o =>
      player.x + 2 < o.x + o.w &&
      player.x + player.w - 2 > o.x &&
      player.y - player.h + 2 < o.y + o.h &&
      player.y > o.y
    )
  }

  function drawGround() {
    ctx.fillStyle = '#2d2d3a'
    ctx.fillRect(0, GROUND, W, 2)
  }

  function drawScore() {
    ctx.fillStyle = '#a78bfa'
    ctx.font = '12px "Press Start 2P", cursive'
    ctx.fillText('Score: ' + score, 16, 24)
  }

  function drawStars() {
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ;[[50,20],[150,40],[300,15],[500,30],[620,10],[200,50],[420,25]].forEach(([x,y]) => {
      ctx.fillRect(x, y, 2, 2)
    })
  }

  function gameLoop() {
    ctx.clearRect(0, 0, W, H)
    drawStars()
    drawGround()

    player.update()
    player.draw()

    updateObstacles()
    drawObstacles()

    score++
    speed = 4 + Math.floor(score / 200) * 0.5

    document.getElementById('hudScore').textContent = score

    drawScore()

    if (checkCollision()) {
      endGame()
      return
    }

    animFrame = requestAnimationFrame(gameLoop)
  }

  function startGame() {
    score = 0
    obstacles = []
    obstacleTimer = 0
    obstacleInterval = 90
    speed = 4
    player.y = GROUND
    player.vy = 0
    player.jumping = false
    gameRunning = true

    document.getElementById('hudHighScore').textContent = highScore
    document.getElementById('gameOverPanel').style.display = 'none'
    document.getElementById('gameWrapper').style.display = 'flex'

    animFrame = requestAnimationFrame(gameLoop)
  }

  function endGame() {
    cancelAnimationFrame(animFrame)
    gameRunning = false

    // Update high score
    const isNewHighScore = score > highScore
    if (isNewHighScore) {
      highScore = score
      localStorage.setItem('levelup_highscore', highScore)
    }

    // Show game over panel
    document.getElementById('gameWrapper').style.display = 'none'
    document.getElementById('finalScore').textContent = score
    document.getElementById('highScoreMsg').textContent = isNewHighScore
      ? '🏆 New High Score!'
      : 'High Score: ' + highScore
    document.getElementById('gameOverPanel').style.display = 'flex'

    // Fire Klaviyo event
    klaviyo.push(['identify', { '$email': playerEmail }])
    klaviyo.push(['track', 'Game Played', {
      'Score': score,
      'High Score': highScore,
      'IsNewHighScore': isNewHighScore,
      'Game': 'LevelUp Runner',
      'Duration (frames)': score
    }])

    console.log('Tracked: Game Played — Score:', score)
  }

  // Email gate
  document.getElementById('btnPlay').addEventListener('click', () => {
    const email = document.getElementById('gameEmail').value.trim()
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address to play!')
      return
    }
    playerEmail = email
    klaviyo.push(['identify', { '$email': email }])
    document.getElementById('gameGate').style.display = 'none'
    startGame()
  })

  // Restart
  document.getElementById('btnRestart').addEventListener('click', startGame)

  // Controls — spacebar
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && gameRunning) {
      e.preventDefault()
      player.jump()
    }
  })

  // Controls — tap/click on canvas
  canvas.addEventListener('click', () => {
    if (gameRunning) player.jump()
  })

})
