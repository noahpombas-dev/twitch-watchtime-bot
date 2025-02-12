# 🎥 Twitch Watchtime Bot

A **Twitch Chat Bot** that tracks viewers' watch time, awards points, and manages a blacklist! 🚀

---

## 🛠 Features

✅ **Track Watch Time** - Logs viewer time while the stream is live.  
✅ **Award Points** - Gives points for every minute watched.  
✅ **Blacklist Management** - Prevents certain users from earning time/points.  
✅ **Twitch API Integration** - Checks if the stream is online.  
✅ **MySQL Database** - Stores watch time and blacklist data.  

---

## 📦 Installation

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/noahpombas-dev/twitch-watchtime-bot.git
cd twitch-watchtime-bot
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Configure Environment Variables
Create a `.env` file and add your Twitch and MySQL credentials.

#### Example `.env` File:
```ini
# Twitch API Credentials
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret
TWITCH_OAUTH=oauth:your_oauth_token
TWITCH_ACCESS_TOKEN=your_access_token
TWITCH_USERNAME=your_twitch_username
TWITCH_CHANNEL=your_twitch_channel

# MySQL Database Credentials
DB_HOST=your_database_host
DB_USER=your_database_user
DB_NAME=your_database_name
DB_PASSWORD=your_database_password
```

> 🔗 **Get your Twitch API keys here:** [Twitch Developer Console](https://dev.twitch.tv/console)  
> 🔑 **Generate an OAuth Token here:** [Twitch Token Generator](https://twitchtokengenerator.com/)

---

## 🚀 Running the Bot
```sh
node index.js
```

If everything is set up correctly, the bot will connect to Twitch chat and begin tracking watch time! 🎉

---

## 🎮 Commands

| Command | Description |
|---------|-------------|
| `!watchtime` | Shows your total watch time. ⏳ |
| `!addblacklist <username>` | Adds a user to the blacklist. 🚫 |
| `!removeblacklist <username>` | Removes a user from the blacklist. ✅ |
| `!listblacklist` | Lists all blacklisted users. 📜 |

---

## 🛢 Database Structure

This bot uses **MySQL** to store viewer watch times and blacklisted users. Run the following SQL script to create the required tables:

```sql
CREATE TABLE watch_time (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_watch_time INT DEFAULT 0,
  points INT DEFAULT 0
);

CREATE TABLE blacklist_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL
);
```

---

## 🤝 Contributing

Want to improve the bot? Fork the repo and submit a pull request! 🚀

---

## 📜 License

This project is **open-source** and licensed under the MIT License. 📝
