require("dotenv").config();
const tmi = require("tmi.js");
const mysql = require("mysql2");
const axios = require("axios"); // Used to call the Twitch API

/**
 * Database Connection - MySQL
 */
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error connecting to MySQL:", err);
    return;
  }
  console.log("✅ Connected to MySQL!");
});

/**
 * Twitch Bot Connection
 */
const client = new tmi.Client({
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_OAUTH,
  },
  channels: [process.env.TWITCH_CHANNEL],
});

client
  .connect()
  .then(() => console.log(`✅ Bot connected to channel: ${process.env.TWITCH_CHANNEL}`))
  .catch((err) => console.error("❌ Error connecting to Twitch chat:", err));

let viewers = new Set(); // Store active viewers

/**
 * Tracks viewers' watch time in MySQL database
 */
client.on("chat", (channel, user) => {
  const username = user.username;

  db.query("SELECT * FROM watch_time WHERE username = ?", [username], (err, results) => {
    if (err) {
      console.error("❌ Error fetching user:", err);
      return;
    }

    if (results.length > 0) {
      db.query("UPDATE watch_time SET last_seen = NOW() WHERE username = ?", [username]);
    } else {
      db.query("INSERT INTO watch_time (username, session_start, last_seen, total_watch_time, points) VALUES (?, NOW(), NOW(), 0, 0)", [username]);
    }
  });

  viewers.add(username);
});

/**
 * Checks if the stream is currently live
 */
async function isStreamLive() {
  try {
    const response = await axios.get(`https://api.twitch.tv/helix/streams?user_login=${process.env.TWITCH_CHANNEL}`, {
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
      },
    });

    if (response.data.data.length > 0) {
      console.log("✅ Stream is live!");
      return true;
    } else {
      console.log("🚫 Stream is offline.");
      return false;
    }
  } catch (error) {
    console.error("❌ Error fetching Twitch API:", error.response?.data || error.message);
    return false;
  }
}

/**
 * Checks if a user is blacklisted
 */
async function isUserBlacklisted(username) {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM blacklist_users WHERE username = ?", [username], (err, results) => {
      if (err) {
        console.error("❌ Error fetching blacklist:", err);
        reject(err);
      } else {
        resolve(results.length > 0);
      }
    });
  });
}

/**
 * Periodically update watch time every 5 minutes if stream is live
 */
let wasLive = false;
setInterval(async () => {
  const live = await isStreamLive();

  if (live) {
    if (!wasLive) console.log("🎥 Stream started! Updating watch time...");
    wasLive = true;

    for (const username of viewers) {
      try {
        const blacklisted = await isUserBlacklisted(username);
        if (blacklisted) {
          console.log(`🚫 ${username} is blacklisted. No time counted.`);
          continue;
        }

        db.query("SELECT TIMESTAMPDIFF(SECOND, session_start, last_seen) AS time_watched FROM watch_time WHERE username = ?", [username], (err, results) => {
          if (err) {
            console.error("❌ Error fetching user watch time:", err);
            return;
          }

          if (results.length > 0) {
            const timeWatched = results[0].time_watched;

            if (timeWatched >= 60) {
              db.query("UPDATE watch_time SET total_watch_time = total_watch_time + 60, points = points + 1 WHERE username = ?", [username]);
            } else {
              console.log(`🚫 ${username} watched less than a minute. No time counted.`);
            }
          }
        });
      } catch (error) {
        console.error(`❌ Error checking blacklist for ${username}:`, error);
      }
    }

    console.log(`✅ Updated watch time for ${viewers.size} viewers!`);
    viewers.clear();
  } else {
    if (wasLive) console.log("🚫 Stream ended. Stopping watch time counting.");
    wasLive = false;
  }
}, 300000);

/**
 * Chat commands for watch time and blacklist management
 */
client.on("chat", (channel, user, message, self) => {
  if (self) return;

  const args = message.split(" ");
  const command = args[0].toLowerCase();
  const targetUser = args[1]?.toLowerCase();

  if (command === "!watchtime") {
    db.query("SELECT total_watch_time FROM watch_time WHERE username = ?", [user.username], (err, results) => {
      if (err) {
        console.error("❌ Error fetching watch time:", err);
        return;
      }

      if (results.length > 0) {
        let watchTimeSec = results[0].total_watch_time;
        let watchTimeFormatted = new Date(watchTimeSec * 1000).toISOString().substr(11, 8);
        client.say(channel, `@${user.username}, you've watched for ${watchTimeFormatted} while the stream was online! ⏳`);
      } else {
        client.say(channel, `@${user.username}, you have no recorded watch time.`);
      }
    });
  }

  if (command === "!addblacklist" && targetUser) {
    db.query("INSERT INTO blacklist_users (username) VALUES (?) ON DUPLICATE KEY UPDATE username = username", [targetUser], (err) => {
      if (err) {
        console.error("❌ Error adding user to blacklist:", err);
        return;
      }
      client.say(channel, `🚫 ${targetUser} has been added to the blacklist!`);
    });
  }

  if (command === "!removeblacklist" && targetUser) {
    db.query("DELETE FROM blacklist_users WHERE username = ?", [targetUser], (err) => {
      if (err) {
        console.error("❌ Error removing user from blacklist:", err);
        return;
      }
      client.say(channel, `✅ ${targetUser} has been removed from the blacklist!`);
    });
  }
});
