Detect = {};

Detect.isIpad = function() {
  return /ipad/i.test(navigator.userAgent.toLowerCase());
};

Detect.isAndroid = function() {
  return /Android/i.test(navigator.userAgent);
};

Detect.isWindows = function() {
  return Detect.userAgentContains("Windows");
};

Detect.isChromeOnWindows = function() {
  return (
    Detect.userAgentContains("Chrome") && Detect.userAgentContains("Windows")
  );
};

Detect.isCanaryOnWindows = function() {
  return (
    Detect.userAgentContains("Chrome/52") && Detect.userAgentContains("Windows")
  );
};

Detect.isEdgeOnWindows = function() {
  return (
    Detect.userAgentContains("Edge") && Detect.userAgentContains("Windows")
  );
};

Detect.isFirefox = function() {
  return Detect.userAgentContains("Firefox");
};

Detect.isSafari = function() {
  return (
    Detect.userAgentContains("Safari") && !Detect.userAgentContains("Chrome")
  );
};

Detect.isOpera = function() {
  return Detect.userAgentContains("Opera");
};

Detect.isFirefoxAndroid = function() {
  return (
    Detect.userAgentContains("Android") && Detect.userAgentContains("Firefox")
  );
};

Detect.userAgentContains = function(string) {
  return navigator.userAgent.indexOf(string) !== -1;
};

Detect.isTablet = function(screenWidth) {
  const userAgent = navigator.userAgent.toLowerCase();
  const isAppleTablet = /ipad/i.test(userAgent);
  const isAndroidTablet = /android/i.test(userAgent);

  return (isAppleTablet || isAndroidTablet) && screenWidth >= 640;
};

Detect.iOSVersion = function() {
  if (window.MSStream) {
    // There is some iOS in Windows Phone...
    // https://msdn.microsoft.com/en-us/library/hh869301(v=vs.85).aspx
    return "";
  }
  const match = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
  let version;

  if (match !== undefined && match !== null) {
    version = [
      parseInt(match[1], 10),
      parseInt(match[2], 10),
      parseInt(match[3] || 0, 10)
    ];
    return parseFloat(version.join("."));
  }

  return "";
};

Detect.androidVersion = function() {
  const userAgent = navigator.userAgent.split("Android");
  let version;

  if (userAgent.length > 1) version = userAgent[1].split(";")[0];

  return version;
};

Detect.supportsWebGL = function() {
  return !!document.createElement("canvas").getContext("webgl");
};

Detect.isAppleDevice = function() {
  const devices = [
    "iPad Simulator",
    "iPhone Simulator",
    "iPod Simulator",
    "iPad",
    "iPhone",
    "iPod"
  ];

  if (navigator.platform) {
    while (devices.length) {
      if ((navigator.platform = devices.pop())) return true;
    }
  }

  return false;
};
