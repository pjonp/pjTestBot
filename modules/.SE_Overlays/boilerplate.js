/*
{
    "widgetDuration":{
      "type": "hidden",
      "value": 15
    }
}
*/
const endEvent = (time) => setTimeout(() => SE_API.resumeQueue(), time * 1000);
const skippable = ["bot:counter", "event:test", "event:skip", "message"];

window.addEventListener('onEventReceived', obj => {
  const listener = obj.detail.listener;
  if (skippable.indexOf(listener) !== -1 || !obj.detail.event) return;
  else if (typeof obj.detail.event.itemId !== "undefined") obj.detail.listener = "redemption-latest";
  const event = obj.detail.event;
  switch (obj.detail.listener) {
    case 'follower-latest':
      followerHandler(event);
      break;
    case 'redemption-latest':
      redemptionHandler(event);
      break;
    case 'subscriber-latest':
      if (event.amount === 'gift') subscriberHandler('subGiftHandler', event); //single gift
      else if (event.bulkGifted) subscriberHandler('subBulkGiftSenderHandler', event); //bulk gift sender
      else if (event.isCommunityGift) subscriberHandler('subBulkGiftRecieverHandler', event); //user recieved a bulk gift
      else subscriberHandler('subDefaultHandler', event); //normal sub
      break;
    case 'host-latest':
      hostHandler(event);
      break;
    case 'cheer-latest':
      cheerHandler(event);
      break;
    case 'tip-latest':
      tipHandler(event);
      break;
    case 'raid-latest':
      raidHandler(event);
      break;
    default:
      endEvent(0);
      return;
  };
});

window.addEventListener('onWidgetLoad', obj => {
  //empty
});

//Sub handler:
const subscriberHandler = (type, event) => {
  let res, queueTime,
    newSubUsername = event.name,
    subGifter = event.sender,
    amount = event.amount;
  switch (type) {
    case 'subDefaultHandler':
      res = 'subDefaultHandler';
      queueTime = 5;
      break;
    case 'subGiftHandler':
      res = `${subGifter} gifted ${newSubUsername} a sub!`;
      queueTime = 5;
      break;
    case 'subBulkGiftSenderHandler':
      res = `${subGifter} gifted ${amount} subs to community`;
      queueTime = 5;
      break;
    case 'subBulkGiftRecieverHandler':
      res = `${subGifter} gifted ${newSubUsername} a sub as part of random giveaway! ${Date.now()}`;
      queueTime = 1;
      break;
    default:
      console.error('SubHandler Error');
      SE_API.resumeQueue();
      return;
  };
  console.log(res, event);
  temp(res);
  endEvent(queueTime);
};

const followerHandler = (event) => {
  let res = 'followerHandler',
    queueTime = 10;
  console.log(res, event);
  temp(res);
  endEvent(queueTime);


};
const redemptionHandler = (event) => {
  let res = 'redemptionHandler',
    queueTime = 10;
  console.log(res, event);
  temp(res);
  endEvent(queueTime);


};
const hostHandler = (event) => {
  let res = 'hostHandler',
    queueTime = 10;
  console.log(res, event);
  temp(res);
  endEvent(queueTime);
};


const cheerHandler = (event) => {
  let res = 'cheerHandler',
    queueTime = 10;
  console.log(res, event);
  temp(res);
  endEvent(queueTime);
};


const tipHandler = (event) => {
  let res = 'tipHandler',
    queueTime = 10;
  console.log(res, event);
  temp(res);
  endEvent(queueTime);
};


const raidHandler = (event) => {
  let res = 'raidHandler',
    queueTime = 10;
  console.log(res, event);
  temp(res);
  endEvent(queueTime);
};

const temp = (i) => {
  $('.main-container').html(i);
}
