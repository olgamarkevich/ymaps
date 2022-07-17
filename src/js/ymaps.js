ymaps.ready(init);

function init() {
  var myMap = new ymaps.Map('map', {
    center: [55.76, 37.64],
    zoom: 14,
  });

  var myGeoObjects = new ymaps.GeoObjectCollection(
    {},
    {
      preset: 'islands#redCircleIcon',
      strokeWidth: 4,
      geodesic: true,
    }
  );

  var clusterer = new ymaps.Clusterer({
    clusterDisableClickZoom: true,
    clusterOpenBalloonOnClick: true,
    clusterBalloonContentLayout: 'cluster#balloonCarousel',
    clusterBalloonPanelMaxMapArea: 0,
    clusterBalloonContentLayoutWidth: 320,
    clusterBalloonContentLayoutHeight: 450,
    clusterBalloonPagerSize: 5,
  });

  let coords = [];

  const infoPlaces = JSON.parse(localStorage.getItem('infoPlaces')) || [];
  let infoPlace = {};

  if (infoPlaces.length > 0) {
    for (let key of infoPlaces) {
      console.log(key);

      const placemark = new ymaps.Placemark(key.coords, {
        balloonContentBody: `
        <div class='yform claster'>
          <div class='reviews-form'>
            <div class='reviews-form-line'>
              <div class='reviews-form-top'>
              <div class='reviews-user'>${key.user}</div>
              <div class='reviews-place'>${key.place}</div>
              <div class='reviews-date'>${key.ydate}</div>
            </div>
          <div class='reviews-content'>
          ${key.reviews}
          </div>
        </div>
        </div>
        <div class='yform-title'>Отзыв:</div>
            <input id='y-name' type='text' placeholder='Укажите ваше имя' class='y_input'/>
            <input id='y-place' type='text' placeholder='Укажите место' class='y_input' />
            <textarea id='y-reviews' placeholder='Оставить отзыв' class='y_textarea' ></textarea>
            <button id="#add_reviews" class="btn">Добавить</button>
        </div>
        `,
      });

      clusterer.add(placemark);
      myMap.geoObjects.add(clusterer);
    }
  }

  myMap.events.add('click', function (e) {
    if (!myMap.balloon.isOpen()) {
      coords = e.get('coords');
      myMap.balloon.open(coords, {
        contentBody: `
          <div class='yform'>
          <div class='yform-title'>Отзыв:</div>
          <input id='y-name' type='text' placeholder='Укажите ваше имя' class='y_input'/>
          <input id='y-place' type='text' placeholder='Укажите место' class='y_input' />
          <textarea id='y-reviews' placeholder='Оставить отзыв' class='y_textarea' ></textarea>
          <button id="#add_reviews" class="btn">Добавить</button>
          </div>`,
      });
    } else {
      myMap.balloon.close();
    }
  });

  let addReviews = document.querySelector('#add_reviews');

  document.addEventListener('click', function (e) {
    if (e.target && e.target.id == '#add_reviews') {
      let yName = document.querySelector('#y-name').value;
      let yPlace = document.querySelector('#y-place').value;
      let yReviews = document.querySelector('#y-reviews').value;

      let ydate = new Date().toLocaleDateString();
      infoPlace.user = yName;
      infoPlace.place = yPlace;
      infoPlace.reviews = yReviews;
      infoPlace.ydate = ydate;
      infoPlace.coords = coords;

      infoPlaces.push(infoPlace);
      localStorage.setItem('infoPlaces', JSON.stringify(infoPlaces));
      myMap.balloon.close();

      const placemark = new ymaps.Placemark(coords, {
        balloonContentBody: `
        <div class='yform'>
          <div class='reviews-form'>
            <div class='reviews-form-line'>
              <div class='reviews-form-top'>
              <div class='reviews-user'>${infoPlace.user}</div>
              <div class='reviews-place'>${infoPlace.place}</div>
              <div class='reviews-date'>${infoPlace.ydate}</div>
            </div>
          <div class='reviews-content'>
          ${infoPlace.reviews}
          </div>
        </div>
        </div>

        <div class='yform-title'>Отзыв:</div>
        <input id='y-name' type='text' placeholder='Укажите ваше имя' class='y_input'/>
        <input id='y-place' type='text' placeholder='Укажите место' class='y_input' />
        <textarea id='y-reviews' placeholder='Оставить отзыв' class='y_textarea' ></textarea>
        <button id="#add_reviews" class="btn">Добавить</button>
        </div>
        `,
      });

      myMap.geoObjects.add(placemark);
      clusterer.add(placemark);
      myMap.geoObjects.add(clusterer);
    }
  });
}
