'use strict'


const YT_KEY = 'AIzaSyCzRorg9LA55ClKjw_Hx6e6AChj_C_uQd4'
const searchBtn = document.getElementById('search-icon')
const searchInput = document.getElementById('search-input')
const videoList = document.getElementById('videos')
const videoPlayer = document.getElementById('video-player')
const wikiContent = document.getElementById('wiki-content')
const clearHistoryBtn = document.getElementById('clear-history-btn')
const changeThemeBtn = document.getElementById('change-theme-btn')
const themeModal = document.getElementById('theme-modal')
const colorPicker = document.getElementById('color-picker')
const okColorBtn = document.getElementById('ok-color-btn')
const cancelColorBtn = document.getElementById('cancel-color-btn')

function onInit() {
    changeThemeBtn.addEventListener('click', () => {
        themeModal.style.display = 'flex'; 
        themeModal.style.height = '100%'
        themeModal.style.width = '100%'
    })
    
    displaySearchHistory()
    restoreState()
}

function saveState(videoId, wikiContentHTML) {
    const state = {
        videoId: videoId || '',
        wikiContent: wikiContentHTML || ''
    }
    localStorage.setItem('pageState', JSON.stringify(state))
}

function restoreState() {
    const state = JSON.parse(localStorage.getItem('pageState')) || {}
    if (state.videoId) {
        playVideo(state.videoId)
    }
    if (state.wikiContent) {
        wikiContent.innerHTML = state.wikiContent
    }
}

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim()
    if (query) {
        fetchVideos(query)
        fetchWikipedia(query)
        saveSearchHistory(query)
        searchInput.value = ''
    }
})

async function fetchVideos(query) {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&videoEmbeddable=true&type=video&key=${YT_KEY}&q=${query}`)
    const data = await response.json()
    videoList.innerHTML = ''
    data.items.forEach(item => {
        const videoItem = document.createElement('li')
        videoItem.innerHTML = `<a href="#" onclick="playVideo('${item.id.videoId}')">${item.snippet.title}</a>`
        videoList.appendChild(videoItem)
    })
    if (data.items.length > 0) {
        saveState(data.items[0].id.videoId, wikiContent.innerHTML)
    }
}

function playVideo(videoId) {
    videoPlayer.src = `https://www.youtube.com/embed/${videoId}`
}

async function fetchWikipedia(query) {
    const response = await fetch(`https://en.wikipedia.org/w/api.php?&origin=*&action=query&list=search&srsearch=${query}&format=json`)
    const data = await response.json()
    if (data.query.search.length > 0) {
        wikiContent.innerHTML = `<strong>${data.query.search[0].title}</strong><p>${data.query.search[0].snippet}</p>`
        saveState(null, wikiContent.innerHTML) 
    } else {
        wikiContent.innerHTML = 'No Wikipedia results found.'
    }
}

function saveSearchHistory(query) {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || []
    if (!history.includes(query)) {
        history.push(query)
        localStorage.setItem('searchHistory', JSON.stringify(history))
        displaySearchHistory()
    }
}

function displaySearchHistory() {
    const history = JSON.parse(localStorage.getItem('searchHistory')) || []
    const historyList = document.getElementById('search-history')
    historyList.innerHTML = ''
    history.forEach(term => {
        const historyItem = document.createElement('li')
        historyItem.textContent = term
        historyList.appendChild(historyItem)
    })
}

clearHistoryBtn.addEventListener('click', () => {
    const confirmClear = confirm('Are you sure you want to clear the search history?')
    if (confirmClear) {
        localStorage.removeItem('searchHistory')
        displaySearchHistory()
    }
})

changeThemeBtn.addEventListener('click', () => {
    themeModal.style.display = 'block'
})

okColorBtn.addEventListener('click', () => {
    document.body.style.backgroundColor = colorPicker.value
    themeModal.style.display = 'none'
})

cancelColorBtn.addEventListener('click', () => {
    themeModal.style.display = 'none'
})

