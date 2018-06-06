function _commtestDoMagic() {
    const script = Array.from(document.querySelectorAll('body script')).find(script => {
        return script.innerHTML.includes('_sharedData');
    });
    
    eval(script.innerHTML);

    if (!window._sharedData.entry_data.PostPage) throw "Not on post page";

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: fixed; width: 100%; height: 100%; top: 0; left: 0; margin: 0; padding: 0; background: rgba(0,0,0,0.75); z-index: 999';
    document.body.appendChild(overlay);

    const messageContainer = document.createElement('div');
    messageContainer.style.cssText = 'text-align: center; background: rgba(255, 255, 255, 0.75); padding: 20px 30px; color: #262626; font-size: 36px; line-height: 40px; font-weight: bold; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; position: absolute; top: 50%; left: 50%; transform: translateX(-50%) translateY(-50%); border-radius: 5px;';
    overlay.appendChild(messageContainer);
    messageContainer.innerText = '';

    let loadComments = new Promise(function(resolve, reject) {
            function loop() {
                let showMoreLi = document.querySelector('ul.Xl2Pu li.LGYDV');
                let showMoreButton = document.querySelector('ul.Xl2Pu li.LGYDV a.vTJ4h.Dz3II');
                if (!showMoreLi) {
                    resolve([].slice.call(document.querySelectorAll('ul.Xl2Pu li.gElp9 a.FPmhX.TlrDj')).map((element) => element.innerHTML));
                }
                if (!showMoreButton) {
                    setTimeout(loop, 1000);
                }
                else {
                    showMoreButton.click();
                    setTimeout(loop, 1000);
                }
            }
            loop();
        });

    let loadLikes = new Promise(function(resolve, reject) {
            document.querySelector('div.HbPOm.y9v3U a.zV_Nj').click();
            let scrollContainer;
            function loop() {
                if (document.querySelector('div.kM-aa.l0avK')) {
                    scrollContainer.scrollTop += scrollContainer.clientHeight;
                    setTimeout(loop, 2000);
                } else {
                    document.querySelector('a.Gzt1P span.RuQjm.Szr5J').click();
                    resolve([].slice.call(document.querySelectorAll('li.NroHT div.FsskP a.FPmhX.zsYNt')).map((element) => element.innerHTML));
                }
            }

            setTimeout(() => {
                scrollContainer = document.querySelector('div.wwxN2.GD3H5');
                loop();
            }, 2000);
        });

    function getRandom(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    }

    function isFollowing(username) {
        return new Promise((resolve, reject) => {
            const iframe = document.createElement('iframe');
            window._myTestObject = iframe;
            iframe.height = "200";
            iframe.width = "200";
            iframe.src = `https://instagram.com/${username}`;
            iframe.seamless = true;
    
            document.body.appendChild(iframe);
    
            iframe.onload = () => {
                const script = Array.from(iframe.contentDocument.querySelectorAll('body script')).find(script => {
                    return script.innerHTML.includes('_sharedData');
                });
                eval(script.innerHTML.replace('window.', ''));
                console.info(_sharedData);
                if (_sharedData.entry_data.ProfilePage[0].graphql.user.follows_viewer) resolve(true);
                else reject(false);
                document.body.removeChild(iframe);
            };
        });
    }

    messageContainer.innerHTML = 'Waiting for pinguings to collect Comments and Likes. <br> Please wait ... It might take a while ...';
    Promise.all([loadLikes, loadComments]).then(([likes, comments]) => {
        messageContainer.innerText = 'Looking for someone to satisfy your needs ...';
        let attempts = 0;
        let rejected = [];
        function getUser() {
            attempts++;
            let selected = comments[getRandom(1, comments.length)];
            if(attempts > 20) {
                messageContainer.innerText = `Well that's a shame but we coudn't find anybody that's good enough for you`;
                throw 'Could not find winner in 10 attempts';
            } 
            if(rejected.indexOf(selected) !== -1) getUser(); 
            if(likes.indexOf(selected) === -1) {
                rejected.push(selected);
                console.error(selected, 'did not like');
                getUser();
            }
            else {
                isFollowing(selected).then(() => {
                    console.info(selected);
                    messageContainer.innerText = `And the winner is: ${selected}`;
                }).catch(() => {
                    rejected.push(selected);
                    console.error(selected, 'did not follow');
                    getUser();
                });
            }
        }
        getUser();
    }).catch(err => {
        console.error(err);
    });
};

_commtestDoMagic();