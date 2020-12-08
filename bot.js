require('./config/ImportEnv');
const Twit = require('twit');

const config = {
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token: process.env.access_token,
  access_token_secret: process.env.access_token_secret,
};

const Twitter = new Twit(config);

const retweet = (searchTag) => {
  const params = {
    q: searchTag,
    result_type: 'mixed',
    count: 50,
  };

  Twitter.get('search/tweets', params, (srcErr, srcData, srcRes) => {
    const tweets = srcData.statuses;
    if (!srcErr) {
      let tweetIDList = [];

      tweets.forEach((tweet) => {
        if (tweet.text.startsWith('RT @')) {
          if (tweet.retweeted_status) {
            tweetIDList.push(tweet.retweeted_status.id_str);
          } else {
            tweetIDList.push(tweet.id_str);
          }
        } else {
          tweetIDList.push(tweet.id_str);
        }
      });

      // Filter unique tweet IDs.
      tweetIDList = tweetIDList.filter((value, index, self) => self.indexOf(value) === index);

      tweetIDList.forEach((tweetID) => {
        // Post tweet
        Twitter.post('statuses/retweet/:id', {
          id: tweetID,
        }, (rtErr, rtData, rtRes) => {
          if (!rtErr || rtData) {
            console.log(`\n\nRetweeted! ID - ${tweetID}`);
          } else {
            console.log(`\nError... Duplication maybe...  ${tweetID}`);
          }
        });

        // Like a tweet
        Twitter.post('favorites/create', {
          id: tweetID,
        })
          .then(() => {
            console.log('Liked tweet successfully!');
          }).catch(() => {
            console.log('Already Liked this tweet.');
          });
      });
    } else {
      console.log(`Error while searching: ${srcErr}`);
      process.exit(1);
    }
  });
};

// Run every 60 seconds
setInterval(() => {
  retweet('#javascript OR #nodejs OR #100DaysOfCode');
}, 60000);
