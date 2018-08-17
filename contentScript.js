
eval(document.body.querySelector('script').innerHTML.replace('window.', ''));

const shortcode = _sharedData.entry_data.PostPage[0].graphql.shortcode_media.shortcode;
const commentsObj = _sharedData.entry_data.PostPage[0].graphql.shortcode_media.edge_media_to_comment;
let queryHash = '';
let appState = '';
//console.log('a', commentsObj.edges.length);
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    queryHash = request.queryHash;
    if(appState == 'moreCommentsClicked') {
      appState = null;
      getMoreComments();
    }
  });

  const moreCommentsBtn = document.querySelector('li.lnrre > button.Z4IfV.oF4XW.sqdOP.yWX7d');
  moreCommentsBtn.click();
  appState = 'moreCommentsClicked';
  
  function getMoreComments() {
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
          "referrer": "https://www.instagram.com/p/BmQLMy4nrLz/",
          "referrerPolicy": "no-referrer-when-downgrade",
          "body": null,
          "method": "GET",
          "mode": "cors"
        }).then(
          (response) => response.json()
        )
        .then(
          (response) => {
            //console.log('b', response.data.shortcode_media.edge_media_to_comment.edges.length);
            commentsObj.edges = commentsObj.edges.concat(response.data.shortcode_media.edge_media_to_comment.edges);
            //console.log('c', commentsObj.edges.length);
            commentsObj.page_info = response.data.shortcode_media.edge_media_to_comment.page_info;
            if(commentsObj.page_info.has_next_page) {
              getMoreComments();
            } else {
              console.log(commentsObj);
            }
          }
        );
  }