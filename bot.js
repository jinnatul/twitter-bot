import './config/ImportEnv';
import Twit from 'twit';

const config = {
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token: process.env.access_token,
  access_token_secret: process.env.access_token_secret,
};

const T = new Twit(config);

const retweet = (searchTag) => {
  const params = {
    q: searchTag,
    result_type: 'mixed',
    count: 20,
  };

  T.get('search/tweets', params, (srcErr, srcData, srcRes) => {
    const tweets = srcData.statuses;
    if (!srcErr) {
      tweets.forEach((tweet) => {
        const tweetID = tweet.id_str;
        T.post('statuses/retweet/:id', { id: tweetID }, (rtErr, rtData, rtRes) => {
          if (!rtErr) {
            console.log(`\n\nRetweeted! ID - ${tweetID}`);
          } else {
            console.log(`\nError... Duplication maybe...  ${tweetID}`);
            console.log(`Error =  ${rtErr}`);
          }
        });
      });
    } else {
      console.log(`Error while searching: ${srcErr}`);
      process.exit(1);
    }
  });
};

// Run every 60 seconds
setInterval(() => { retweet('#morol'); }, 60000);
