
angular.module("youtube-embed", ["ng"]).service("youtubeEmbedUtils", ["$window", "$rootScope", function(e, t) {
  function r(e, t) {
    return e.indexOf(t) > -1
  }
  var a = {},
    n = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gi,
    i = /t=(\d+)[ms]?(\d+)?s?/;
  return a.getIdFromURL = function(e) {
    var t = e.replace(n, "$1");
    if (r(t, ";")) {
      var a = t.split(";");
      if (r(a[1], "%")) {
        var i = decodeURIComponent(t.split(";")[1]);
        t = ("http://youtube.com" + i).replace(n, "$1")
      } else t = a[0]
    } else r(t, "#") && (t = t.split("#")[0]);
    return t
  }, a.getTimeFromURL = function(e) {
    e = e || "";
    var t = e.match(i);
    if (!t) return 0;
    var a = t[0],
      n = t[1],
      o = t[2];
    return "undefined" != typeof o ? (o = parseInt(o, 10), n = parseInt(n, 10)) : r(a, "m") ? (n = parseInt(n, 10), o = 0) : (o = parseInt(n, 10), n = 0), o + 60 * n
  },
    function() {
      var e = document.createElement("script");
      e.src = "https://www.youtube.com/iframe_api";
      var t = document.getElementsByTagName("script")[0];
      t.parentNode.insertBefore(e, t)
    }(), a.ready = !1, e.onYouTubeIframeAPIReady = function() {
    t.$apply(function() {
      a.ready = !0
    })
  }, a
}]).directive("youtubeVideo", ["youtubeEmbedUtils", function(e) {
  var t = 1,
    r = {
      "-1": "unstarted",
      0: "ended",
      1: "playing",
      2: "paused",
      3: "buffering",
      5: "queued"
    },
    a = "youtube.player.";
  return {
    restrict: "EA",
    scope: {
      videoId: "=?",
      videoUrl: "=?",
      player: "=?",
      playerVars: "=?",
      playerHeight: "=?",
      playerWidth: "=?"
    },
    link: function(n, i, o) {
      function u() {
        var e = Array.prototype.slice.call(arguments);
        n.$apply(function() {
          n.$emit.apply(n, e)
        })
      }

      function d(e) {
        var t = r[e.data];
        "undefined" != typeof t && u(a + t, n.player, e), n.$apply(function() {
          n.player.currentState = t
        })
      }

      function l(e) {
        u(a + "ready", n.player, e)
      }

      function p() {
        var e = angular.copy(n.playerVars);
        e.start = e.start || n.urlStartTime;
        var t = new YT.Player(c, {
          height: n.playerHeight,
          width: n.playerWidth,
          videoId: n.videoId,
          playerVars: e,
          events: {
            onReady: l,
            onStateChange: d
          }
        });
        return t.id = c, t
      }

      function y() {
        (n.videoId || n.playerVars.list) && (n.player && n.player.d && "function" == typeof n.player.destroy && n.player.destroy(), n.player = p())
      }
      n.utils = e;
      var c = o.playerId || i[0].id || "unique-youtube-embed-id-" + t++;
      i[0].id = c, n.playerHeight = n.playerHeight || 390, n.playerWidth = n.playerWidth || 640, n.playerVars = n.playerVars || {};
      var s = n.$watch(function() {
        return n.utils.ready && ("undefined" != typeof n.videoUrl || "undefined" != typeof n.videoId || "undefined" != typeof n.playerVars.list)
      }, function(e) {
        e && (s(), "undefined" != typeof n.videoUrl ? n.$watch("videoUrl", function(e) {
          n.videoId = n.utils.getIdFromURL(e), n.urlStartTime = n.utils.getTimeFromURL(e), y()
        }) : "undefined" != typeof n.videoId ? n.$watch("videoId", function() {
          n.urlStartTime = null, y()
        }) : n.$watch("playerVars.list", function() {
          n.urlStartTime = null, y()
        }))
      });
      n.$watchCollection(["playerHeight", "playerWidth"], function() {
        n.player && n.player.setSize(n.playerWidth, n.playerHeight)
      }), n.$on("$destroy", function() {
        n.player && n.player.destroy()
      })
    }
  }
}]);