
if(mySuperVariable) console.log(mySuperVariable);
eval(document.body.querySelector('script').innerHTML.replace('window.', ''));

const shortcode = _sharedData.entry_data.PostPage[0].graphql.shortcode_media.shortcode;
const commentsObj = _sharedData.entry_data.PostPage[0].graphql.shortcode_media.edge_media_to_comment;
let likesObj = null;
let notifierElem = document.createElement('span');

const APPSTATES = [null, 'moreCommentsClicked', 'moreLikesClicked'];

let queryHash = '';
let appState = APPSTATES[0];

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    queryHash = request.queryHash;
    if (appState === APPSTATES[1]) {
      appState = APPSTATES[0];
      getComments();
    }
    if (appState === APPSTATES[2]) {
      appState = APPSTATES[0];
      getLikes();
    }
  });

function getComments() {
  notify(`Collecting Comments. Currently at ${commentsObj.edges.length}`);
  let variables = {
    'shortcode': shortcode,
    'first': 32,
    'after': commentsObj.page_info.end_cursor
  };
  let url = new URL('https://www.instagram.com/graphql/query/');
  url.searchParams.append('query_hash', queryHash);
  url.searchParams.append('variables', JSON.stringify(variables))
  fetch(url.toString(),
    {
      "credentials": "include",
      "headers": {},
      "referrer": `https://www.instagram.com/p/${shortcode}/`,
      "referrerPolicy": "no-referrer-when-downgrade",
      "body": null,
      "method": "GET",
      "mode": "cors"
    }).then(
      (response) => response.json()
    )
    .then(
      (response) => {
        commentsObj.edges = commentsObj.edges.concat(response.data.shortcode_media.edge_media_to_comment.edges);
        commentsObj.page_info = response.data.shortcode_media.edge_media_to_comment.page_info;

        notify(`Collecting Comments. Currently at ${commentsObj.edges.length}`);
        if (commentsObj.page_info.has_next_page) {
          getComments();
        } else {
          console.log(commentsObj);
          stage2();
        }
      }
    );
}

function getLikes() {
  let variables = {
    'shortcode': shortcode,
    'include_reel': false,
    'first': 24,
  };
  if (likesObj)
    variables['after'] = likesObj.page_info.end_cursor;
  let url = new URL('https://www.instagram.com/graphql/query/');
  url.searchParams.append('query_hash', queryHash);
  url.searchParams.append('variables', JSON.stringify(variables))

  fetch(url.toString(),
    {
      "credentials": "include",
      "headers": {},
      "referrer": `https://www.instagram.com/p/${shortcode}/`,
      "referrerPolicy": "no-referrer-when-downgrade",
      "body": null,
      "method": "GET",
      "mode": "cors"
    }).then(
      (response) => response.json()
    )
    .then(
      (response) => {
        if (!likesObj) {
          likesObj = response.data.shortcode_media.edge_liked_by;
        } else {
          likesObj.edges = likesObj.edges.concat(response.data.shortcode_media.edge_liked_by.edges);
          likesObj.page_info = response.data.shortcode_media.edge_liked_by.page_info;
        }

        notify(`Collecting Likes. Currently at ${likesObj.edges.length}`);
        if (likesObj && likesObj.page_info.has_next_page) {
          getLikes();
        } else {
          console.log(likesObj);
          document.querySelector('button.Gzt1P span.coreSpriteClose').click();
          stage3();
        }
      }
    );
}

function stage1() {
  const moreCommentsBtn = document.querySelector('li.lnrre > button.Z4IfV.oF4XW.sqdOP.yWX7d');
  moreCommentsBtn.click();
  appState = APPSTATES[1];
}

function stage2() {
  const showLikesBtn = document.querySelector('section.EDfFK.ygqzn div.HbPOm.y9v3U a.zV_Nj');
  showLikesBtn.click();
  appState = APPSTATES[2];
}

function init() {
  const overlay = document.createElement('section');
  overlay.style.cssText = `display: block;
                          width: 100%;
                          height: 100%;
                          position: fixed;
                          top: 0;
                          left: 0;
                          background: rgba(0,0,0,0.5);
                          z-index: 1000`;
  const popupContainer = document.createElement('div');
  popupContainer.style.cssText = `display: block;
                                width: 300px;
                                height: 150px;
                                background: rgba(255, 255, 255, 0.5);
                                position: absolute;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%);
                                text-align: center;
                                color: black`;
  overlay.appendChild(popupContainer);
  notifierElem.textContent = 'Hi!';
  popupContainer.appendChild(notifierElem);

  document.body.appendChild(overlay);
  // REVIEW
  stage1();
}

function stage3() {
  notify(`Collected ${commentsObj.edges.length} comments and ${likesObj.edges.length} likes. Now filterting comments`);
}

function notify(msg) {
  notifierElem.textContent = msg;
}

init();
