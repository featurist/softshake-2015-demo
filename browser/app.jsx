var plastiq = require('plastiq');
var h = plastiq.html;
var httpism = require('httpism');

function createApp() {
  var app = {
    images: [],

    loadImages: function () {
      var self = this;

      return httpism.get('/images').then(function (response) {
        self.images = response.body;
      });
    },

    render: function () {
      var self = this;
      this.refresh = h.refresh;

      function addImage(ev) {
        ev.preventDefault();
        return httpism.post('/images', {url: self.imageUrl}).then(function () {
          self.imageUrl = '';
          return self.loadImages();
        });
      }

      return <div>
        <form onsubmit={addImage}><input type="text" binding={[this, 'imageUrl']}></input></form>
        <ol>
          {this.images.map(function (image) {
            function voteUp(ev) {
              ev.preventDefault();

              return httpism.post(image.voteHrefTemplate.replace('{vote}', '1')).then(function () {
                return self.loadImages();
              });
            }

            return <li>
              <img src={image.url} alt=""></img>
              <div class="buttons">
                <button class={{up: true, voted: image.vote == 1}} onclick={voteUp}></button>
              </div>
            </li>;
          })}
        </ol>
      </div>;
    }
  };

  function load() {
    app.loadImages().then(function () {
      app.refresh();
    });
  }
  setInterval(load, 100);
  load();

  return app;
}

module.exports = createApp;
