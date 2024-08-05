let user = document.getElementById("userID");
let history = JSON.parse(localStorage.getItem('searchHistory')) || [];

document.getElementById("btn").addEventListener("click", () => {
    const userId = user.value;
    document.getElementById("userProfile").innerHTML = `<span class="loader"></span>`;
    fetchUser(userId);
    updateHistory(userId);
});

document.getElementById('themeSwitch').addEventListener('change', (event) => {
    if (event.target.checked) {
        document.body.classList.add('dark-mode');
        document.getElementById('themeStatus').textContent = 'Dark Mode';
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('themeStatus').textContent = 'Light Mode';
    }
});

document.getElementById('deleteHistory').addEventListener('click', () => {
    history = [];
    localStorage.removeItem('searchHistory');
    renderHistory();
});

function updateHistory(userId) {
    if (!history.includes(userId)) {
        history.push(userId);
        localStorage.setItem('searchHistory', JSON.stringify(history));
        renderHistory();
    }
}

function renderHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    history.forEach(userId => {
        const li = document.createElement('li');
        li.textContent = userId;
        li.addEventListener('click', () => fetchUser(userId));
        historyList.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
});

async function fetchUser(username) {
    try {
        let response = await fetch(`https://api.github.com/users/${username}`);
        if (!response.ok) throw new Error('User not found');
        let result = await response.json();
        displayUser(result);
    } catch (error) {
        document.getElementById("userProfile").innerHTML = `<h1>${error.message}</h1>`;
    }
}

function displayUser({
    avatar_url,
    name,
    bio,
    followers,
    following,
    public_repos,
    html_url
}) {
    if (!avatar_url) {
        document.getElementById("userProfile").innerHTML = `<h1>User Not Found</h1>`;
        return;
    }

    bio = bio || '';
    document.getElementById("userProfile").innerHTML = `
        <div class="userInfo">
            <img src="${avatar_url}" class="userImg" alt="${name}">
            <div class="userDetail">
                <p class="userName">${name}</p>
                <p class="userBio">${bio}</p>
            </div>
        </div>
        <div class="userFollow">
            <div class="Follower">
                <div class="repo">
                    <p>Followers</p>
                    <p>${followers}</p>
                </div>
                <div class="repo">
                    <p>Following</p>
                    <p>${following}</p>
                </div>
                <div class="repo">
                    <p>Repos</p>
                    <p>${public_repos}</p>
                </div>
            </div>
            <a href="${html_url}" target="_blank" class="VisitProfile">Visit Profile</a>
        </div>
        <div class="profileStats">
            <h2>Profile Stats</h2>
            <p>Most Popular Repo: <span id="mostPopularRepo">Loading...</span></p>
        </div>`;
    fetchMostPopularRepo(html_url);
}

async function fetchMostPopularRepo(profileUrl) {
    try {
        let response = await fetch(`${profileUrl}/repos`);
        if (!response.ok) throw new Error('Failed to fetch repos');
        let repos = await response.json();
        let popularRepo = repos.reduce((max, repo) => repo.stargazers_count > max.stargazers_count ? repo : max, repos[0]);
        document.getElementById('mostPopularRepo').textContent = popularRepo.name;
    } catch (error) {
        document.getElementById('mostPopularRepo').textContent = 'Error fetching repo';
    }
}

