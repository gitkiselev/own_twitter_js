class FetchData {
  getResource = async url => {
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Произошла ошибка:" + res.status);
    }

    return res.json();
  }

  getPost = async () => await this.getResource('db/database.json');
}

class Twitter {
  constructor({ listElem, user, modalElems, tweetElems, avatarElems }) {
    const fetchData = new FetchData();
    this.tweets = new Posts();
    this.user = user;
    this.elements = {
      listElem: document.querySelector(listElem),
      modal: modalElems,
      tweetElems,
      avatarElems,
    }

    fetchData.getPost()
      .then(data => {
        data.forEach(this.tweets.addPost);

        this.showAllPost();
      });

    this.elements.modal.forEach(this.handlerModal, this);
    this.elements.tweetElems.forEach(this.addTweet, this);

    //Заменить аватар
    this.setAvatarOfLoginnedUser(this.elements.avatarElems, this.user.avatar);

  }

  setAvatarOfLoginnedUser(avatarElems, avatarPathCss) {
    //Если у user есть аватар, то ставим, если нет, то не трогаем и будет стоять аватар по умолчанию который в верстке
    if (avatarPathCss) {
      const avatars = [];
      avatarElems.forEach(avatarElem => avatars.push(document.querySelectorAll(avatarElem)));

      avatars.forEach(avatarItem => {
        if (avatarItem.length > 1) {
          avatarItem.forEach(item => item.setAttribute('src', avatarPathCss));
        } else {
          avatarItem[0].setAttribute('src', avatarPathCss)
        }
      });
    }
  }

  renderPosts(tweets) {
    this.elements.listElem.textContent = '';

    tweets.forEach(({ id, userName, nickname, postDate, text, img, likes, getDate }) => {
      this.elements.listElem.insertAdjacentHTML('beforeend', `
        <li>  
          <article class="tweet">
            <div class="row">
              <img class="avatar" src="images/${nickname}.jpg" alt="Аватар пользователя ${nickname}">
              <div class="tweet__wrapper">
                <header class="tweet__header">
                  <h3 class="tweet-author">${userName}
                    <span class="tweet-author__add tweet-author__nickname">@${nickname}</span>
                    <time class="tweet-author__add tweet__date">${getDate()}</time>
                  </h3>
                  <button class="tweet__delete-button chest-icon" data-id="${id}"></button>
                </header>
                <div class="tweet-post">
                  <p class="tweet-post__text">${text}</p>
                  ${img ?
          `<figure class="tweet-post__image">
                        <img src="${img}" alt="иллюстрация из поста ${nickname}.">
                      </figure>`
          : ' '
        }
                </div>
              </div>
            </div>
            <footer>
              <button class="tweet__like">
                ${likes}
              </button>
            </footer>
          </article>
        </li>
      `)
    });
  }

  showUserPost() {

  }

  showLikesPost() {

  }

  showAllPost() {
    this.renderPosts(this.tweets.posts)
  }

  handlerModal({ button, modal, overlay, close }) {
    const buttonElem = document.querySelector(button);
    const modalElem = document.querySelector(modal);
    const overlayElem = document.querySelector(overlay);
    const closeElem = document.querySelector(close);

    const openModal = () => {
      modalElem.style.display = "block";
    }

    const closeModal = (elem, event) => {
      if (event.target === elem) {
        modalElem.style.display = 'none';
      }
    }

    buttonElem.addEventListener('click', openModal);

    if (closeElem) {
      closeElem.addEventListener('click', closeModal.bind(null, closeElem));
    }
    if (overlayElem) {
      overlayElem.addEventListener('click', closeModal.bind(null, overlayElem));
    }

    this.handlerModal.closeModal = () => modalElem.style.display = "none";
  }

  addTweet({ text, img, submit }) {
    const textElem = document.querySelector(text);
    const imgElem = document.querySelector(img);
    const submitElem = document.querySelector(submit);

    //По умолчанию кнопка недоступна
    submitElem.disabled = true;

    let imgUrl = '';
    let tempString = textElem.innerHTML;

    submitElem.addEventListener('click', () => {
      this.tweets.addPost({
        userName: this.user.name,
        nickname: this.user.nick,
        text: textElem.innerHTML,
        img: imgUrl,
      });

      this.showAllPost();
      this.handlerModal.closeModal();
      textElem.innerHTML = tempString;
    });

    textElem.addEventListener('click', () => {
      if (textElem.innerHTML === tempString) {
        textElem.innerHTML = '';
      }
    });

    //Слушаем textarea на изменения, если проверка выполнена, то кнопку можно нажать
    textElem.addEventListener("DOMSubtreeModified", () => {
      if (textElem.textContent !== tempString && textElem.textContent !== '') {
        submitElem.disabled = false;
      } else {
        submitElem.disabled = true;
      }
    })

    imgElem.addEventListener('click', () => {
      imgUrl = prompt('Введите адрес изображения');
    });
  }
}

class Posts {
  constructor({ posts = [] } = {}) {
    this.posts = posts;
  }

  addPost = tweet => {
    this.posts.push(new Post(tweet));
  }

  // deletePost(id) {
  //   this.posts.forEach((item, i, array) => item.id === id ? array.splice(i, 1) : void 0);
  // }

  // likePost(id) {
  //   this.posts[id].changeLike();
  // }
}

class Post {
  constructor(param) {
    const { id, userName, nickname, postDate, text, img, likes = 0 } = param;
    this.id = id ? id : this.generateId();
    this.userName = userName;
    this.nickname = nickname;
    this.postDate = postDate ? new Date(postDate) : new Date();
    this.text = text;
    this.img = img;
    this.likes = likes;
    this.liked = false;
  }

  changeLike() {
    this.liked = !this.liked;
    if (this.liked) {
      this.likes++;
    } else {
      this.likes--;
    }
  }

  generateId() {
    return Math.random().toString(32).substring(2, 9) + (+new Date()).toString(32);
  }

  getDate = () => {
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
    return this.postDate.toLocaleString('ru-RU', options);
  }
}

const twitter = new Twitter({
  listElem: ".tweet-list",
  user: {
    name: 'Адлетико',
    nick: 'tricky',

    //Путь к аватарке юзера
    avatar: 'images/tricky.jpg'
  },
  modalElems: [
    {
      button: '.header__link_tweet',
      modal: '.modal',
      overlay: '.overlay',
      close: '.modal-close__btn',
    },
  ],
  tweetElems: [
    {
      text: '.modal .tweet-form__text',
      img: '.modal .tweet-img__btn',
      submit: '.modal .tweet-form__btn',
    },

    //Передаю еще один tweetElem, который уже не в modal. Так как querySelector, используемый мной при поиске элементов берет первый попавшийся результат, он возьмет поле создания твита в начале страницы(наверное)
    {
      text: '.tweet-form__text',
      img: '.tweet-img__btn',
      submit: '.tweet-form__btn',
    },
  ],

  //Элементы где нужно заменить аватар по умолч. на аватар of user
  avatarElems: ['.tweet-form__avatar', '.header .avatar'],
});