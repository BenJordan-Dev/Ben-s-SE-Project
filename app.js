document.addEventListener('DOMContentLoaded', () => {

// ============================================================
// Game card click tracking
// ============================================================

document.querySelectorAll('.game-card').forEach(card => {
  const gameKey = card.dataset.game
  const productUrl = `product.html?game=${gameKey}`

  // Click image → open product page + fire Viewed Product
  card.querySelector('.game-image').addEventListener('click', () => {
    klaviyo.push(['track', 'Viewed Product', {
      'Game Title': card.querySelector('.game-title-link').textContent,
      'Game ID': gameKey,
      'Source': 'image'
    }])
    window.open(productUrl, '_blank')
  })

  // Click title → open product page + fire Viewed Product
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

  if (!email) {
    alert('Please enter your email address')
    return
  }

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

})
