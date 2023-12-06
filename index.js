// DOM ELEMENTS & QUERY SELECTOR
const querySelector = (selector) => document.querySelector(selector);

const mainDisplay = querySelector('.main__display-container');
const selectorEl = querySelector('.header__selector');
const selectorBtn = querySelector('.header__selector-button');
const searchEl = {
	input: querySelector('.header__search-input'),
	button: querySelector('.header__search-button'),
};

// API Settings
const apiKey = "MYAPIKEY";
const maxSearchResults = 1 // change accordingly

const queryUrl = {
    channelDetails: (channelId) => `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${apiKey}`,
    videoDetails: () => `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${selectorEl.value}&q=${(searchEl.input.value)}&maxResults=${maxSearchResults}&key=${apiKey}`,
};

const ytChannels = [
	{
		name: 'NatGeo',
		id: 'UCpVm7bg6pXKo1Pr6k5kxG9A',
		link: 'https://www.youtube.com/@NatGeo',
	},
	{
		name: 'History',
		id: 'UC9MAhZQQd9egwWCxrwSIsJQ',
		link: 'https://www.youtube.com/@HISTORY',
	},
	{
		name: 'ESPN',
		id: 'UCiWLfSweyRNmLpgEHekhoAg',
		link: 'https://www.youtube.com/@espn',
	},
]

// HTML Templates
const errorDisplay =  `<span class='main__display-error'>⚠️ Refine search & try again ⚠️</span>`
const selectorDisplay = item => `<option class='header__search-selector-option' value="${item.id}">${item.name}</option>`
const channelCard = item => `
    <div class='main__display-channel grid' data-id='${item.id}'>
        <img class='main__display-channel__img' src=${item.snippet.thumbnails.default.url}>
        <div class='main__display-channel__title'>${item.snippet.title}</div>
        <div class='main__display-channel__handle'>${item.snippet.customUrl}</div>
        <div class='main__display-channel__description'>${item.snippet.description}</div>
        <div class='border-gray'></div>
    </div>
`;
const videoCard = item => `
	<div class='main__display-video' data-id='${item.id}'>
        <img class='main__display-video__img' src='${item.snippet.thumbnails.medium.url}' alt='thumbnail'>
        <div class='main__display-video__title'>${item.snippet.title}</div>
        <div class='main__display-video__publishing'>Uploaded: ${item.snippet.publishTime}</div>
        <div class='main__display-video__description'>${item.snippet.description}</div>
        <div class='border-gray'></div>
	</div>
`;

// Function Declarations
const mapArrayToHtml = (array, htmlEl, html) => {htmlEl.innerHTML = array.map(html).join('')};
const setToHtml = (htmlEl, html) => {htmlEl.innerHTML = html}
const addToHtml = (htmlEl, html) => {htmlEl.innerHTML += html}

const handleSearch = () => {
    fetchAndProcessData(queryUrl.videoDetails(), 
        data => mapArrayToHtml(data.items, mainDisplay, videoCard));
};

const saveChannelDataToLocalStorage = data => {
    if (data && data.items) {
        const existingData = JSON.parse(localStorage.getItem('channelData')) || [];
        const updatedData = existingData.concat(data.items);
        localStorage.setItem('channelData', JSON.stringify(updatedData));
    }
};

const fetchAllChannelDetails = async callback => {
    for (const channel of ytChannels) {
        const url = queryUrl.channelDetails(channel.id);
        await fetchAndProcessData(url, callback);
    }
};

const fetchAndProcessData = async (url, callback) => {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Request failed with status: ' + res.status);
        const data = await res.json();
        if (data.items.length === 0) {
            setToHtml(mainDisplay, errorDisplay)
            return;
        }
        if (typeof callback === 'function') {
            callback(data);
        }
    } catch (err) {
        console.error(err);
    }
};

const checkAndFetchChannelData = () => {
    const storedData = localStorage.getItem('channelData');
    if (!storedData) {fetchAllChannelDetails(saveChannelDataToLocalStorage)}
};

const displayChannelData = () => {
    const channelData = JSON.parse(localStorage.getItem('channelData'));
    if (channelData) {mapArrayToHtml(channelData, mainDisplay, channelCard);}
};

const initializePage = () => {
    mapArrayToHtml(ytChannels, selectorEl, selectorDisplay),
    checkAndFetchChannelData(),
    displayChannelData();
};

// Event Listeners
searchEl.button.addEventListener('click', handleSearch)
searchEl.input.addEventListener('keydown', e => e.key === 'Enter' && handleSearch());
selectorBtn.addEventListener('click', initializePage)
document.addEventListener('DOMContentLoaded', initializePage)
