(function() {
    var LtAttractor, N, Sketch, canvas, context, cos, density, iterations, limit, log, max, mouseX, mouseY, round, sensitivity, sin, size, start,
      bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  
    sensitivity = 0.01;
  
    iterations = 10000;
  
    density = 3;
  
    start = 0;
  
    limit = 300;
  
    size = Math.round(document.body.clientWidth - (document.body.clientWidth * 0.30));
  
    N = size * (window.devicePixelRatio || 1);
  
    canvas = document.createElement('canvas');
  
    canvas.width = canvas.height = N;
  
    canvas.style.width = canvas.style.height = size + "px";
  
    canvas.style.marginTop = canvas.style.marginLeft = "-" + (size / 2) + "px";
  
    document.body.appendChild(canvas);
  
    context = canvas.getContext('2d');
  
    round = Math.round, log = Math.log, max = Math.max, sin = Math.sin, cos = Math.cos;
  
    mouseX = mouseY = start;
  
    Sketch = (function() {
      function Sketch() {
        this.permalink = bind(this.permalink, this);
        this.resume = bind(this.resume, this);
        this.record = bind(this.record, this);
        this.pause = bind(this.pause, this);
        this.tick = bind(this.tick, this);
        this.steps = 0;
        this.stopped = false;
        this.button = document.getElementById('permalink');
        this.button.addEventListener('mousedown', this.permalink, false);
        document.addEventListener('mousedown', this.pause, false);
        document.addEventListener('mousemove', this.record, false);
        document.addEventListener('mouseup', this.resume, false);
        this.initialSeed();
        this.attractor = new LtAttractor;
        this.loop();
      }
  
      Sketch.prototype.loop = function() {
        return this.interval = setInterval(this.tick, 0);
      };
  
      Sketch.prototype.stopLoop = function() {
        return this.interval = clearInterval(this.interval);
      };
  
      Sketch.prototype.tick = function() {
        if (this.stopped) {
          return this.attractor.reseed();
        }
        this.steps += 1;
        this.attractor.plot(5);
        if (this.steps > limit) {
          return this.stopLoop();
        }
      };
  
      Sketch.prototype.initialSeed = function() {
        var hash, num, ref;
        if (hash = window.location.hash.replace('#', '')) {
          return ref = (function() {
            var k, len, ref, results;
            ref = hash.split(',');
            results = [];
            for (k = 0, len = ref.length; k < len; k++) {
              num = ref[k];
              results.push(parseInt(num, 10));
            }
            return results;
          })(), mouseX = ref[0], mouseY = ref[1], ref;
        }
      };
  
      Sketch.prototype.pause = function(e) {
        e.preventDefault();
        this.stopped = true;
        if (!this.interval) {
          return this.loop();
        }
      };
  
      Sketch.prototype.record = function(e) {
        if (this.stopped) {
          mouseX = e.pageX - canvas.offsetLeft;
          return mouseY = e.pageY - canvas.offsetTop;
        }
      };
  
      Sketch.prototype.resume = function() {
        this.stopped = false;
        return this.steps = 0;
      };
  
      Sketch.prototype.permalink = function(e) {
        e.stopPropagation();
        return window.location.hash = mouseX + ',' + mouseY;
      };
  
      return Sketch;
  
    })();
  
    LtAttractor = (function() {
      function LtAttractor() {
        this.reseed();
      }
  
      LtAttractor.prototype.clear = function() {
        var i, j;
        this.image = context.createImageData(N, N);
        this.density = (function() {
          var k, ref, results;
          results = [];
          for (j = k = 0, ref = N; 0 <= ref ? k < ref : k > ref; j = 0 <= ref ? ++k : --k) {
            results.push((function() {
              var l, ref1, results1;
              results1 = [];
              for (i = l = 0, ref1 = N; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
                results1.push(0);
              }
              return results1;
            })());
          }
          return results;
        })();
        return this.maxDensity = 0;
      };
  
      LtAttractor.prototype.seed = function() {
        var ref;
        this.xSeed = (mouseX * 2 / N - 1) * sensitivity;
        this.ySeed = (mouseY * 2 / N - 1) * sensitivity;
        return ref = [N / 2, N / 2], this.x = ref[0], this.y = ref[1], ref;
      };
  
      LtAttractor.prototype.populate = function(samples) {
        var i, k, ref, ref1, row, x, y;
        for (i = k = 0, ref = samples * iterations; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
          x = ((sin(this.xSeed * this.y) - cos(this.ySeed * this.x)) * N * 0.2) + N / 2;
          y = ((sin(-this.xSeed * this.x) - cos(-this.ySeed * this.y)) * N * 0.2) + N / 2;
          this.density[round(x)][round(y)] += density;
          ref1 = [x, y], this.x = ref1[0], this.y = ref1[1];
        }
        return this.maxDensity = log(max.apply(Math, (function() {
          var l, len, ref2, results;
          ref2 = this.density;
          results = [];
          for (l = 0, len = ref2.length; l < len; l++) {
            row = ref2[l];
            results.push(max.apply(Math, row));
          }
          return results;
        }).call(this)));
      };
  
      LtAttractor.prototype.reseed = function() {
        this.clear();
        this.seed();
        return this.plot(3);
      };
  
      LtAttractor.prototype.softLight = function(a, b) {
        return ((a * b) >> 7) + ((a * a) >> 8) - ((a * a * b) >> 15);
      };
  
      LtAttractor.prototype.plot = function(samples) {
        var color, current, data, dens, i, idx, j, k, l, light, ref, ref1;
        this.populate(samples);
        data = this.image.data;
        for (i = k = 0, ref = N; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
          for (j = l = 0, ref1 = N; 0 <= ref1 ? l < ref1 : l > ref1; j = 0 <= ref1 ? ++l : --l) {
            dens = this.density[i][j];
            idx = (i * N + j) * 4;
            data[idx + 7] =  255;
            data[idx] = 26;
            if (dens <= 0) {
              continue;
            }
            light = log(dens) / this.maxDensity * 255;
            current = 255;
            color = this.softLight(light, current);


            //data[idx + 4] = 15;
            data[idx + 5] = color;
            data[idx + 6] = color;
            data[idx + 7] = 255;
          }
        }
        return context.putImageData(this.image, 0, 0);
      };
  
      return LtAttractor;
  
    })();
  
    new Sketch();
  
  }).call(this);
  