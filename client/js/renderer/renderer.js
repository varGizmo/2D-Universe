/* global _, m4, log, Detect */

const DarkMask = illuminated.DarkMask;
const Lamp = illuminated.Lamp;
const Lighting = illuminated.Lighting;
const Vec2 = illuminated.Vec2;

define([
  "jquery",
  "./camera",
  "./tile",
  "../entity/character/player/player",
  "../entity/character/character",
  "../entity/objects/item"
], function($, Camera, Tile, Player, Character, Item) {
  return Class.extend({
    init: function(
      background,
      entities,
      foreground,
      overlay,
      textCanvas,
      cursor,
      game
    ) {
      const self = this;

      self.canvas = document.getElementById("canvas");
      self.background = background;
      self.entities = entities;
      self.foreground = foreground;
      self.overlay = overlay;
      self.textCanvas = textCanvas;
      self.cursor = cursor;

      self.context = self.entities.getContext("2d");
      self.backContext = self.background.getContext("2d");
      self.foreContext = self.foreground.getContext("2d");
      self.overlayContext = self.overlay.getContext("2d");
      self.textContext = self.textCanvas.getContext("2d");
      self.cursorContext = self.cursor.getContext("2d");

      self.contexts = [self.context, self.backContext, self.foreContext];
      self.canvases = [
        self.background,
        self.entities,
        self.foreground,
        self.overlay,
        self.textCanvas,
        self.cursor
      ];

      self.allContexts = [
        self.context,
        self.backContext,
        self.foreContext,
        self.overlayContext,
        self.textContext,
        self.cursorContext
      ];

      self.context.imageSmoothingEnabled = false;
      self.backContext.imageSmoothingEnabled = false;
      self.foreContext.imageSmoothingEnabled = false;
      self.overlayContext.imageSmoothingEnabled = false;
      self.textContext.imageSmoothingEnabled = false;
      self.cursorContext.imageSmoothingEnabled = false;

      self.lightings = [];
      self.textures = {};

      self.game = game;
      self.camera = null;
      self.entities = null;
      self.input = null;

      self.checkDevice();

      self.scale = 1;
      self.tileSize = 16;
      self.fontSize = 10;

      self.screenWidth = 0;
      self.screenHeight = 0;

      self.time = new Date();

      self.fps = 0;
      self.frameCount = 0;
      self.renderedFrame = [0, 0];
      self.lastTarget = [0, 0];

      self.animatedTiles = [];
      self.drawnTiles = [];

      self.resizeTimeout = null;
      self.autoCentre = false;

      self.drawTarget = false;
      self.selectedCellVisible = false;

      self.stopRendering = false;
      self.animateTiles = true;
      self.debugging = false;
      self.brightness = 100;
      self.drawNames = true;
      self.drawLevels = true;
      self.forceRendering = false;

      self.load();
    },

    stop: function() {
      const self = this;

      self.camera = null;
      self.input = null;
      self.stopRendering = true;

      self.forEachContext(function(context) {
        context.fillStyle = "#12100D";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
      });
    },

    load: function() {
      const self = this;

      self.scale = self.getScale();
      self.drawingScale = self.getDrawingScale();
      self.superScaling = self.getSuperScaling();

      self.loadLights();
      self.handleScaling();
    },

    removeSmoothing: function() {
      const self = this;

      self.forAllContexts(function(context) {
        context.imageSmoothingQuality = "low";
        context.imageSmoothingEnabled = false;
        context.webkitImageSmoothingEnabled = false;
        context.mozImageSmoothingEnabled = false;
        context.msImageSmoothingEnabled = false;
        context.oImageSmoothingEnabled = false;
      });
    },

    loadSizes: function() {
      const self = this;

      if (!self.camera) return;

      self.lightTileSize = self.tileSize * self.superScaling;

      self.screenWidth = self.camera.gridWidth * self.tileSize;
      self.screenHeight = self.camera.gridHeight * self.tileSize;

      const width = self.screenWidth * self.superScaling;
      const height = self.screenHeight * self.superScaling;

      self.forEachCanvas(function(canvas) {
        canvas.width = width;
        canvas.height = height;
      });
    },

    loadCamera: function() {
      const self = this;
      const storage = self.game.storage;

      self.camera = new Camera(this);

      self.loadSizes();

      if (
        storage.data.new &&
        (self.firefox ||
          parseFloat(Detect.androidVersion()) < 6.0 ||
          parseFloat(Detect.iOSVersion() < 9.0) ||
          Detect.isIpad())
      ) {
        self.camera.centered = false;

        storage.data.settings.centerCamera = false;
        storage.save();
      }
    },

    loadLights: function() {
      const self = this;

      self.darkMask = new DarkMask({
        lights: [],
        color: "rgba(0, 0, 0, 0.84)"
      });

      self.darkMask.compute(self.overlay.width, self.overlay.height);
    },

    resize: function() {
      const self = this;

      self.stopRendering = true;

      self.clearAll();

      self.checkDevice();

      if (!self.resizeTimeout)
      { self.resizeTimeout = setTimeout(function() {
        self.scale = self.getScale();
        self.drawingScale = self.getDrawingScale();
        self.clearScreen(self.cursorContext);

        if (self.camera) self.camera.update();

        self.loadSizes();

        if (self.entities) self.entities.update();

        if (self.camera) self.camera.centreOn(self.game.player);

        if (self.game.interface) self.game.interface.resize();

        self.stopRendering = false;
        self.resizeTimeout = null;

        self.handleScaling();
        self.updateAnimatedTiles();
      }, 500); }
    },

    render: function() {
      const self = this;

      if (self.stopRendering) return;

      self.clear();

      self.clearText();

      self.saveAll();

      self.removeSmoothing();

      /**
       * Rendering related draws
       */

      self.draw();

      self.drawOverlays();

      self.drawTargetCell();

      self.drawSelectedCell();

      self.drawEntities();

      self.drawInfos();

      self.drawDebugging();

      self.drawCursor();

      self.calculateFPS();

      self.restoreAll();
    },

    /**
     * Context Drawing
     */

    draw: function() {
      const self = this;

      self.updateDrawingView();

      self.forEachVisibleTile(function(id, index) {
        const isHighTile = self.map.isHighTile(id);
        const isLightTile = self.map.isLightTile(id);
        const context = isLightTile
          ? self.overlayContext
          : isHighTile
            ? self.foreContext
            : self.backContext;

        if (!self.map.isAnimatedTile(id) || !self.animateTiles)
        { self.drawTile(context, id, self.map.width, index); }
      });

      if (self.animateTiles)
      { self.forEachAnimatedTile(function(tile) {
        self.drawTile(self.backContext, tile.id, self.map.width, tile.index);
        tile.loaded = true;
      }); }
    },

    drawOverlays: function() {
      const self = this;
      const overlay = self.game.overlays.getFog();

      if (overlay) {
        self.overlayContext.save();

        if (overlay !== "empty") {
          self.overlayContext.fillStyle = self.overlayContext.createPattern(
            overlay,
            "repeat"
          );
          self.overlayContext.fillRect(
            0,
            0,
            self.screenWidth * self.superScaling,
            self.screenHeight * self.superScaling
          );
          self.overlayContext.fill();
        }

        self.overlayContext.globalCompositeOperation = "lighter";

        self.forEachLighting(function(lighting) {
          if (self.inRadius(lighting)) self.drawLighting(lighting);
        });

        self.overlayContext.globalCompositeOperation = "source-over";
        self.darkMask.render(self.overlayContext);

        self.overlayContext.restore();
      }
    },

    drawInfos: function() {
      const self = this;

      if (self.game.info.getCount() === 0) return;

      self.game.info.forEachInfo(function(info) {
        const factor = self.mobile ? 2 : 1;

        self.textContext.save();
        self.textContext.font = "20px AdvoCut";
        self.setCameraView(self.textContext);
        self.textContext.globalAlpha = info.opacity;
        self.drawText(
          "" + info.text,
          Math.floor((info.x + 8) * factor),
          Math.floor(info.y * factor),
          true,
          info.fill,
          info.stroke
        );
        self.textContext.restore();
      });
    },

    drawDebugging: function() {
      const self = this;

      if (!self.debugging) return;

      self.drawFPS();

      if (!self.mobile) {
        self.drawPosition();
        self.drawPathing();
      }
    },

    drawEntities: function() {
      const self = this;

      self.forEachVisibleEntity(function(entity) {
        if (entity.spriteLoaded) self.drawEntity(entity);
      });
    },

    drawEntity: function(entity) {
      const self = this;
      const sprite = entity.sprite;
      const animation = entity.currentAnimation;
      const data = entity.renderingData;

      if (!sprite || !animation || !entity.isVisible()) return;

      const frame = animation.currentFrame;
      const x = frame.x * self.superScaling;
      const y = frame.y * self.superScaling;
      const dx = entity.x * self.superScaling;
      const dy = entity.y * self.superScaling;
      const flipX = dx + self.tileSize * self.superScaling;
      const flipY = dy + data.height;

      self.context.save();
      self.setCameraView(self.context);

      if (entity.id !== self.game.player.id)
      { self.context.globalCompositeOperation = "destination-over"; }

      if (data.scale !== self.scale || data.sprite !== sprite) {
        data.scale = self.scale;
        data.sprite = sprite;

        data.width = sprite.width * self.superScaling;
        data.height = sprite.height * self.superScaling;
        data.ox = sprite.offsetX * self.superScaling;
        data.oy = sprite.offsetY * self.superScaling;

        if (entity.angled) data.angle = (entity.angle * Math.PI) / 180;

        if (entity.hasShadow()) {
          data.shadowWidth = self.shadowSprite.width * self.superScaling;
          data.shadowHeight = self.shadowSprite.height * self.superScaling;

          data.shadowOffsetY = entity.shadowOffsetY * self.superScaling;
        }
      }

      if (entity.fading) self.context.globalAlpha = entity.fadingAlpha;

      if (entity.spriteFlipX) {
        self.context.translate(flipX, dy);
        self.context.scale(-1, 1);
      } else if (entity.spriteFlipY) {
        self.context.translate(dx, flipY);
        self.context.scale(1, -1);
      } else self.context.translate(dx, dy);

      if (entity.angled) self.context.rotate(data.angle);

      if (entity.hasShadow()) {
        self.context.globalCompositeOperation = "source-over";

        self.context.drawImage(
          self.shadowSprite.image,
          0,
          0,
          data.shadowWidth,
          data.shadowHeight,
          0,
          data.shadowOffsetY,
          data.shadowWidth,
          data.shadowHeight
        );
      }

      self.drawEntityBack(entity);

      self.context.drawImage(
        sprite.image,
        x,
        y,
        data.width,
        data.height,
        data.ox,
        data.oy,
        data.width,
        data.height
      );

      if (
        entity instanceof Character &&
        !entity.dead &&
        !entity.teleporting &&
        entity.hasWeapon()
      ) {
        const weapon = self.entities.getSprite(entity.weapon.getString());

        if (weapon) {
          if (!weapon.loaded) weapon.load();

          const weaponAnimationData = weapon.animationData[animation.name];
          const index =
              frame.index < weaponAnimationData.length
                ? frame.index
                : frame.index % weaponAnimationData.length;
          const weaponX = weapon.width * index * self.superScaling;
          const weaponY = weapon.height * animation.row * self.superScaling;
          const weaponWidth = weapon.width * self.superScaling;
          const weaponHeight = weapon.height * self.superScaling;

          self.context.drawImage(
            weapon.image,
            weaponX,
            weaponY,
            weaponWidth,
            weaponHeight,
            weapon.offsetX * self.superScaling,
            weapon.offsetY * self.superScaling,
            weaponWidth,
            weaponHeight
          );
        }
      }

      if (entity instanceof Item) {
        const sparksAnimation = self.entities.sprites.sparksAnimation;
        const sparksFrame = sparksAnimation.currentFrame;

        if (data.scale !== self.scale) {
          data.sparksX =
            self.sparksSprite.width * sparksFrame.index * self.superScaling;
          data.sparksY =
            self.sparksSprite.height * sparksAnimation.row * self.superScaling;

          data.sparksWidth = self.sparksSprite.width * self.superScaling;
          data.sparksHeight = self.sparksSprite.height * self.superScaling;
        }

        self.context.drawImage(
          self.sparksSprite.image,
          data.sparksX,
          data.sparksY,
          data.sparksWidth,
          data.sparksHeight,
          0,
          0,
          data.sparksWidth,
          data.sparksHeight
        );
      }

      self.drawEntityFore(entity);

      self.context.restore();

      self.drawHealth(entity);

      if (!self.game.overlays.getFog()) self.drawName(entity);
    },

    drawEntityBack: function(entity) {
      const self = this;

      /**
       * Function used to draw special effects prior
       * to rendering the entity.
       */
    },

    drawEntityFore: function(entity) {
      const self = this;

      /**
       * Function used to draw special effects after
       * having rendererd the entity
       */

      if (
        entity.terror ||
        entity.stunned ||
        entity.critical ||
        entity.explosion
      ) {
        const sprite = self.entities.getSprite(entity.getActiveEffect());

        if (!sprite.loaded) sprite.load();

        if (sprite) {
          const animation = entity.getEffectAnimation();
          const index = animation.currentFrame.index;
          const x = sprite.width * index * self.superScaling;
          const y = sprite.height * animation.row * self.superScaling;
          const width = sprite.width * self.superScaling;
          const height = sprite.height * self.superScaling;
          const offsetX = sprite.offsetX * self.superScaling;
          const offsetY = sprite.offsetY * self.superScaling;

          self.context.drawImage(
            sprite.image,
            x,
            y,
            width,
            height,
            offsetX,
            offsetY,
            width,
            height
          );
        }
      }
    },

    drawHealth: function(entity) {
      const self = this;

      if (!entity.hitPoints || entity.hitPoints < 0 || !entity.healthBarVisible)
      { return; }

      const barLength = 16;
      const healthX = entity.x * self.superScaling - barLength / 2 + 8;
      const healthY = (entity.y - 9) * self.superScaling;
      const healthWidth = Math.round(
        (entity.hitPoints / entity.maxHitPoints) *
            barLength *
            self.superScaling
      );
      const healthHeight = 2 * self.superScaling;

      self.context.save();
      self.setCameraView(self.context);
      self.context.strokeStyle = "#00000";
      self.context.lineWidth = 1;
      self.context.strokeRect(
        healthX,
        healthY,
        barLength * self.superScaling,
        healthHeight
      );
      self.context.fillStyle = "#FD0000";
      self.context.fillRect(healthX, healthY, healthWidth, healthHeight);
      self.context.restore();
    },

    drawName: function(entity) {
      const self = this;

      if (entity.hidden || (!self.drawNames && !self.drawLevels)) return;

      let colour = entity.wanted ? "red" : "white";
      const factor = self.mobile ? 2 : 1;

      if (entity.rights > 1) colour = "#ba1414";
      else if (entity.rights > 0) colour = "#a59a9a";

      if (entity.id === self.game.player.id) colour = "#fcda5c";

      self.textContext.save();
      self.setCameraView(self.textContext);
      self.textContext.font = "11px AdvoCut";

      if (entity.drawNames()) {
        if (!entity.hasCounter) {
          if (
            self.drawNames &&
            (entity.type === "mob" || entity.type === "player")
          )
          { self.drawText(
            entity.type === "player" ? entity.username : entity.name,
            (entity.x + 8) * factor,
            (entity.y - (self.drawLevels ? 20 : 10)) * factor,
            true,
            colour,
            "#000"
          ); }

          if (
            self.drawLevels &&
            (entity.type === "mob" || entity.type === "player")
          )
          { self.drawText(
            "Level " + entity.level,
            (entity.x + 8) * factor,
            (entity.y - (entity.type === "player" ? 12 : 10)) * factor,
            true,
            colour,
            "#000"
          ); }

          if (entity.type === "item" && entity.count > 1)
          { self.drawText(
            entity.count,
            (entity.x + 8) * factor,
            (entity.y - 10) * factor,
            true,
            colour
          ); }
        } else {
          if (self.game.time - entity.countdownTime > 1000) {
            entity.countdownTime = self.game.time;
            entity.counter--;
          }

          if (entity.counter <= 0) entity.hasCounter = false;

          self.drawText(
            entity.counter,
            (entity.x + 8) * factor,
            (entity.y - 10) * factor,
            true,
            colour
          );
        }
      }

      self.textContext.restore();
    },

    drawLighting: function(lighting) {
      const self = this;

      if (lighting.relative) {
        const lightX =
            (lighting.light.origX - self.camera.x / 16) * self.lightTileSize;
        const lightY =
            (lighting.light.origY - self.camera.y / 16) * self.lightTileSize;

        lighting.light.position = new Vec2(lightX, lightY);
        lighting.compute(self.overlay.width, self.overlay.height);
        self.darkMask.compute(self.overlay.width, self.overlay.height);
      } else if (!lighting.computed) {
        lighting.compute(self.overlay.width, self.overlay.height);
        lighting.computed = true;
      }

      lighting.render(self.overlayContext);
    },

    drawCursor: function() {
      const self = this;

      if (
        self.tablet ||
        self.mobile ||
        self.hasRenderedMouse() ||
        self.input.cursorMoved
      )
      { return; }

      const cursor = self.input.cursor;
      const scaling = 14 * self.superScaling;

      self.clearScreen(self.cursorContext);
      self.cursorContext.save();

      if (cursor && self.scale > 1) {
        if (!cursor.loaded) cursor.load();

        if (cursor.loaded)
        { self.cursorContext.drawImage(
          cursor.image,
          0,
          0,
          scaling,
          scaling,
          self.input.mouse.x,
          self.input.mouse.y,
          scaling,
          scaling
        ); }
      }

      self.cursorContext.restore();

      self.saveMouse();
    },

    calculateFPS: function() {
      const self = this;

      if (!self.debugging) return;

      const currentTime = new Date();
      const timeDiff = currentTime - self.time;

      if (timeDiff >= 1000) {
        self.realFPS = self.frameCount;
        self.frameCount = 0;
        self.time = currentTime;
        self.fps = self.realFPS;
      }

      self.frameCount++;
    },

    drawFPS: function() {
      this.drawText("FPS: " + this.realFPS, 10, 11, false, "white");
    },

    drawPosition: function() {
      const self = this;
      const player = self.game.player;

      self.drawText(
        "x: " + player.gridX + " y: " + player.gridY,
        10,
        31,
        false,
        "white"
      );
    },

    drawPathing: function() {
      const self = this;
      const pathingGrid = self.entities.grids.pathingGrid;

      if (!pathingGrid) return;

      self.camera.forEachVisiblePosition(function(x, y) {
        if (x < 0 || y < 0 || x > self.map.width - 1 || y > self.map.height - 1)
        { return; }

        if (pathingGrid[y][x] !== 0)
        { self.drawCellHighlight(x, y, "rgba(50, 50, 255, 0.5)"); }
      });
    },

    drawSelectedCell: function() {
      const self = this;

      if (!self.input.selectedCellVisible || self.input.keyMovement) return;

      const posX = self.input.selectedX;
      const posY = self.input.selectedY;

      if (self.mobile)
      { self.drawCellHighlight(posX, posY, self.input.mobileTargetColour); }
      else {
        const tD = self.input.getTargetData();

        if (tD) {
          self.context.save();
          self.setCameraView(self.context);

          self.context.drawImage(
            tD.sprite.image,
            tD.x,
            tD.y,
            tD.width,
            tD.height,
            tD.dx,
            tD.dy,
            tD.dw,
            tD.dh
          );

          self.context.restore();
        }
      }
    },

    /**
     * Primitive drawing functions
     */

    drawTile: function(context, tileId, gridWidth, cellId) {
      const self = this;

      if (tileId < 0) return;

      const tileset = self.map.getTilesetFromId(tileId);

      if (!tileset) return;

      tileId -= tileset.firstGID - 1;

      const setWidth = tileset.width / self.tileSize / tileset.scale;

      self.drawScaledImage(
        context,
        tileset,
        self.getX(tileId + 1, setWidth) * self.tileSize,
        Math.floor(tileId / setWidth) * self.tileSize,
        self.tileSize,
        self.tileSize,
        self.getX(cellId + 1, gridWidth) * self.tileSize,
        Math.floor(cellId / gridWidth) * self.tileSize
      );
    },

    drawScaledImage: function(context, image, x, y, width, height, dx, dy) {
      const self = this;
      const tilesetScale = image.scale;
      const scale = self.superScaling;

      if (!context) return;

      context.drawImage(
        image,
        x * tilesetScale, // Source X
        y * tilesetScale, // Source Y
        width * tilesetScale, // Source Width
        height * tilesetScale, // Source Height
        dx * scale, // Destination X
        dy * scale, // Destination Y
        width * scale, // Destination Width
        height * scale
      ); // Destination Height
    },

    drawText: function(text, x, y, centered, colour, strokeColour) {
      const self = this;
      let strokeSize = 1;
      const context = self.textContext;

      if (self.scale > 2) strokeSize = 3;

      if (text && x && y) {
        context.save();

        if (centered) context.textAlign = "center";

        context.strokeStyle = strokeColour || "#373737";
        context.lineWidth = strokeSize;
        context.strokeText(text, x * self.superScaling, y * self.superScaling);
        context.fillStyle = colour || "white";
        context.fillText(text, x * self.superScaling, y * self.superScaling);

        context.restore();
      }
    },

    updateAnimatedTiles: function() {
      const self = this;

      if (!self.animateTiles) return;

      const newTiles = [];

      self.forEachVisibleTile(function(id, index) {
        /**
         * We don't want to reinitialize animated tiles that already exist
         * and are within the visible camera proportions. This way we can parse
         * it every time the tile moves slightly.
         */

        if (!self.map.isAnimatedTile(id)) return;

        /**
         * Push the pre-existing tiles.
         */

        const tileIndex = self.animatedTiles.indexOf(id);

        if (tileIndex > -1) {
          newTiles.push(self.animatedTiles[tileIndex]);
          return;
        }

        const tile = new Tile(id, index, self.map);
        const position = self.map.indexToGridPosition(tile.index);

        tile.setPosition(position);

        newTiles.push(tile);
      }, 2);

      self.animatedTiles = newTiles;
    },

    drawCellRect: function(x, y, colour) {
      const self = this;
      const multiplier = self.tileSize * self.superScaling;

      self.context.save();
      self.setCameraView(self.context);

      self.context.lineWidth = 2 * self.superScaling;

      self.context.translate(x + 2, y + 2);

      self.context.strokeStyle = colour;
      self.context.strokeRect(0, 0, multiplier - 4, multiplier - 4);

      self.context.restore();
    },

    drawCellHighlight: function(x, y, colour) {
      const self = this;

      self.drawCellRect(
        x * self.superScaling * self.tileSize,
        y * self.superScaling * self.tileSize,
        colour
      );
    },

    drawTargetCell: function() {
      const self = this;

      if (
        self.mobile ||
        self.tablet ||
        !self.input.targetVisible ||
        !self.input ||
        !self.camera ||
        !self.map ||
        self.input.keyMovement
      )
      { return; }

      const location = self.input.getCoords();

      if (
        !(
          location.x === self.input.selectedX &&
          location.y === self.input.selectedY
        )
      ) {
        const isColliding = self.map.isColliding(location.x, location.y);

        self.drawCellHighlight(
          location.x,
          location.y,
          isColliding ? "rgba(230, 0, 0, 0.7)" : self.input.targetColour
        );
      }
    },

    /**
     * Primordial Rendering functions
     */

    forEachVisibleIndex: function(callback, offset) {
      const self = this;

      self.camera.forEachVisiblePosition(function(x, y) {
        if (!self.map.isOutOfBounds(x, y))
        { callback(self.map.gridPositionToIndex(x, y) - 1); }
      }, offset);
    },

    forEachVisibleTile: function(callback, offset) {
      const self = this;

      if (!self.map || !self.map.mapLoaded) return;

      self.forEachVisibleIndex(function(index) {
        const indexData = self.map.data[index];

        if (Array.isArray(indexData))
        { _.each(indexData, function(id) {
          callback(id - 1, index);
        }); }
        else if (!isNaN(self.map.data[index] - 1))
        { callback(self.map.data[index] - 1, index); }
      }, offset);
    },

    forEachAnimatedTile: function(callback) {
      _.each(this.animatedTiles, function(tile) {
        callback(tile);
      });
    },

    forEachVisibleEntity: function(callback) {
      const self = this;

      if (!self.entities || !self.camera) return;

      const grids = self.entities.grids;

      self.camera.forEachVisiblePosition(function(x, y) {
        if (!self.map.isOutOfBounds(x, y) && grids.renderingGrid[y][x])
        { _.each(grids.renderingGrid[y][x], function(entity) {
          callback(entity);
        }); }
      });
    },

    isVisiblePosition: function(x, y) {
      return (
        y >= this.camera.gridY &&
        y < this.camera.gridY + this.camera.gridHeight &&
        x >= this.camera.gridX &&
        x < this.camera.gridX + this.camera.gridWidth
      );
    },

    getScale: function() {
      return this.game.getScaleFactor();
    },

    getDrawingScale: function() {
      const self = this;
      let scale = self.getScale();

      if (self.mobile) scale = 2;

      return scale;
    },

    getUpscale: function() {
      const self = this;
      let scale = self.getScale();

      if (scale > 2) scale = 2;

      return scale;
    },

    getSuperScaling: function() {
      return 2;
    },

    clearContext: function() {
      this.context.clearRect(
        0,
        0,
        this.screenWidth * this.scale,
        this.screenHeight * this.scale
      );
    },

    clearText: function() {
      this.textContext.clearRect(
        0,
        0,
        this.textCanvas.width,
        this.textCanvas.height
      );
      this.overlayContext.clearRect(
        0,
        0,
        this.overlay.width,
        this.overlay.height
      );
    },

    restore: function() {
      this.forEachContext(function(context) {
        context.restore();
      });
    },

    clearAll: function() {
      this.forEachContext(function(context) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      });
    },

    clear: function() {
      this.forEachContext(function(context) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      });
    },

    handleScaling: function() {
      const self = this;

      self.canvas.style.transformOrigin = "0 0";
      self.canvas.style.transform =
        self.drawingScale === 3 ? "scale(1.5)" : "scale(1)";
    },

    saveAll: function() {
      this.forEachContext(function(context) {
        context.save();
      });
    },

    restoreAll: function() {
      this.forEachContext(function(context) {
        context.restore();
      });
    },

    isIntersecting: function(rectOne, rectTwo) {
      return (
        rectTwo.left > rectOne.right ||
        rectTwo.right < rectOne.left ||
        rectTwo.top > rectOne.bottom ||
        rectTwo.bottom < rectOne.top
      );
    },

    focus: function() {
      this.forEachContext(function(context) {
        context.focus();
      });
    },

    transition: function(duration, forward, callback) {
      const self = this;
      const textCanvas = $("#textCanvas");
      const hasThreshold = function() {
        return forward ? self.brightness > 99 : self.brightness < 1;
      };

      self.transitioning = true;

      self.transitionInterval = setInterval(function() {
        self.brightness += forward ? 6 : -6;

        textCanvas.css(
          "background",
          "rgba(0,0,0," + (1 - self.brightness / 100) + ")"
        );

        if (hasThreshold()) {
          clearInterval(self.transitionInterval);
          self.transitionInterval = null;

          self.transitioning = false;

          callback();
        }
      }, duration);
    },

    /**
     * Rendering Functions
     */

    updateView: function() {
      const self = this;

      self.forEachContext(function(context) {
        self.setCameraView(context);
      });
    },

    updateDrawingView: function() {
      const self = this;

      self.forEachDrawingContext(function(context) {
        self.setCameraView(context);
      });
    },

    setCameraView: function(context) {
      const self = this;

      if (!self.camera || self.stopRendering) return;

      context.translate(
        -self.camera.x * self.superScaling,
        -self.camera.y * self.superScaling
      );
    },

    clearScreen: function(context) {
      context.clearRect(
        0,
        0,
        this.context.canvas.width,
        this.context.canvas.height
      );
    },

    hasRenderedMouse: function() {
      return (
        this.input.lastMousePosition.x === this.input.mouse.x &&
        this.input.lastMousePosition.y === this.input.mouse.y
      );
    },

    saveMouse: function() {
      const self = this;

      self.input.lastMousePosition.x = self.input.mouse.x;
      self.input.lastMousePosition.y = self.input.mouse.y;
    },

    adjustBrightness: function(level) {
      const self = this;

      if (level < 0 || level > 100) return;

      $("#textCanvas").css(
        "background",
        "rgba(0, 0, 0, " + (0.5 - level / 200) + ")"
      );
    },

    loadStaticSprites: function() {
      const self = this;

      self.shadowSprite = self.entities.getSprite("shadow16");

      if (!self.shadowSprite.loaded) self.shadowSprite.load();

      self.sparksSprite = self.entities.getSprite("sparks");

      if (!self.sparksSprite.loaded) self.sparksSprite.load();
    },

    hasDrawnTile: function(id) {
      return this.drawnTiles.indexOf(id) > -1;
    },

    /**
     * Miscellaneous functions
     */

    forAllContexts: function(callback) {
      _.each(this.allContexts, function(context) {
        callback(context);
      });
    },

    forEachContext: function(callback) {
      _.each(this.contexts, function(context) {
        callback(context);
      });
    },

    forEachDrawingContext: function(callback) {
      _.each(this.contexts, function(context) {
        if (context.canvas.id !== "entities") callback(context);
      });
    },

    forEachCanvas: function(callback) {
      _.each(this.canvases, function(canvas) {
        callback(canvas);
      });
    },

    forEachLighting: function(callback) {
      _.each(this.lightings, function(lighting) {
        callback(lighting);
      });
    },

    getX: function(index, width) {
      if (index === 0) return 0;

      return index % width === 0 ? width - 1 : (index % width) - 1;
    },

    checkDevice: function() {
      const self = this;

      self.mobile = self.game.app.isMobile();
      self.tablet = self.game.app.isTablet();
      self.firefox = Detect.isFirefox();
    },

    verifyCentration: function() {
      this.forceRendering =
        (this.mobile || this.tablet) && this.camera.centered;
    },

    isPortableDevice: function() {
      return this.mobile || this.tablet;
    },

    updateDarkMask: function(color) {
      const self = this;

      self.darkMask.color = color;
      self.darkMask.compute(self.overlay.width, self.overlay.height);
    },

    addLight: function(x, y, distance, diffuse, color, relative) {
      const self = this;
      const light = new Lamp(self.getLightData(x, y, distance, diffuse, color));
      const lighting = new Lighting({
        light: light,
        objects: [],
        diffuse: light.diffuse
      });

      light.origX = light.position.x;
      light.origY = light.position.y;

      light.diff = Math.round(light.distance / 16);

      if (self.hasLighting(lighting)) return;

      if (relative) lighting.relative = relative;

      self.lightings.push(lighting);
      self.darkMask.lights.push(light);

      self.drawLighting(lighting);
      self.darkMask.compute(self.overlay.width, self.overlay.height);
    },

    removeAllLights: function() {
      const self = this;

      self.lightings = [];
      self.darkMask.lights = [];

      self.darkMask.compute(self.overlay.width, self.overlay.height);
    },

    removeNonRelativeLights: function() {
      const self = this;

      _.each(self.lightings, function(lighting) {
        if (!lighting.light.relative) {
          self.lightings.splice(i, 1);
          self.darkMask.lights.splice(i, 1);
        }
      });

      self.darkMask.compute(self.overlay.width, self.overlay.height);
    },

    getLightData: function(x, y, distance, diffuse, color) {
      return {
        position: new Vec2(x, y),
        distance: distance,
        diffuse: diffuse,
        color: color,
        radius: 0,
        samples: 2,
        roughness: 0,
        angle: 0
      };
    },

    hasLighting: function(lighting) {
      const self = this;

      for (let i = 0; i < self.lightings.length; i++) {
        const light = self.lightings[i].light;

        if (
          lighting.light.origX === light.origX &&
          lighting.light.origY === light.origY &&
          lighting.light.distance === light.distance
        )
        { return true; }
      }

      return false;
    },

    inRadius: function(lighting) {
      const self = this;
      const position = {
        x: lighting.light.origX,
        y: lighting.light.origY,
        diff: lighting.light.diff
      };

      return (
        position.x > self.camera.gridX - position.diff &&
        position.x <
          self.camera.gridX + self.camera.gridWidth + position.diff &&
        position.y > self.camera.gridY - position.diff &&
        position.y < self.camera.gridY + self.camera.gridHeight + position.diff
      );
    },

    getMiddle: function() {
      return {
        x: this.overlay.width / 2,
        y: this.overlay.height / 2
      };
    },

    /**
     * Setters
     */

    setTileset: function(tileset) {
      this.tileset = tileset;
    },

    setMap: function(map) {
      this.map = map;
    },

    setEntities: function(entities) {
      this.entities = entities;
    },

    setInput: function(input) {
      this.input = input;
    },

    /**
     * Getters
     */

    getTargetBounds: function(x, y) {
      const self = this;
      const bounds = {};
      const tx = x || self.input.selectedX;
      const ty = y || self.input.selectedY;

      bounds.x = (tx * self.tileSize - self.camera.x) * self.superScaling;
      bounds.y = (ty * self.tileSize - self.camera.y) * self.superScaling;
      bounds.width = self.tileSize * self.superScaling;
      bounds.height = self.tileSize * self.superScaling;
      bounds.left = bounds.x;
      bounds.right = bounds.x + bounds.width;
      bounds.top = bounds.y;
      bounds.bottom = bounds.y + bounds.height;

      return bounds;
    },

    getTileset: function() {
      return this.tileset;
    }
  });
});
