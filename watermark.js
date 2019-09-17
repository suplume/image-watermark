(function(window, document, undefined) {
  const canvas = document.getElementById('preview');
  const ctx = canvas.getContext('2d');
  const originalFile = document.getElementById('originalFile');
  const wmFile = document.getElementById('wmFile');
  const wmSize = document.getElementById('wmSize');
  const wmPosition = document.getElementById('wmPosition');
  const wmDegree = document.getElementById('wmDegree');
  const wmOpacity = document.getElementById('wmOpacity');
  const wmGamma = document.getElementById('wmGamma');
  const wmDownloadButton = document.getElementById('wmDownloadButton');
  let originWidth, originHeight, wmWidth, wmHeight, originImg, wmImg, wmRatio;
  let name;
  wmSize.addEventListener('change', function(e){e.target.parentNode.querySelector('label span').innerText = e.target.value;watermark()});
  wmMargin.addEventListener('change', function(e){e.target.parentNode.querySelector('label span').innerText = e.target.value;watermark()});
  wmOpacity.addEventListener('change', function(e){e.target.parentNode.querySelector('label span').innerText = e.target.value;watermark()});
  wmGamma.addEventListener('change', function(e){e.target.parentNode.querySelector('label span').innerText = e.target.value;watermark()});
  originalFile.addEventListener('change', function(e) {
    let file = e.target.files[0];
    e.target.parentNode.querySelector('label').innerText = file.name;
    name = file.name.replace(/^(.*)\..+$/, '$1');
    if(!file.type.match('image.*')) {
      errorBox.style.display = 'block';
      errorMessage.innerText = '対応していないファイル形式です';
      return false;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      let img = new Image();
      img.src = e.target.result;
      img.onload = function() {
        originImg = img;
        originWidth = wmMargin.max = wmSize.max = canvas.width = img.width;
        originHeight = canvas.height = img.height;
      };
    };
    reader.readAsDataURL(file);
  }, {passive: false});
  const watermark = img => {
    ctx.clearRect(0, 0, originWidth, originHeight);
    ctx.drawImage(originImg, 0, 0, originWidth, originHeight);
    let tempCanvas = document.createElement('canvas');
    let tempCtx = tempCanvas.getContext('2d');
    wmWidth = wmSize.value - 0;
    wmHeight = wmSize.value * wmRatio;
    tempCanvas.width = originWidth;
    tempCanvas.height = originHeight;
    tempCtx.globalAlpha = wmOpacity.value / 100;
    for(let r = -(originWidth % (wmSize.value - 0)); r < originWidth; r += (wmSize.value - 0) + (wmMargin.value - 0)) {
      for(let c = -(originHeight % (wmSize.value * wmRatio)); c < originHeight; c += (wmSize.value * wmRatio) + (wmMargin.value - 0)) {
        tempCtx.drawImage(wmImg, r, c, wmSize.value - 0, wmSize.value * wmRatio);
      }
    }
    let imgData = tempCtx.getImageData(0, 0, originWidth, originHeight);
    let data = imgData.data;
    const correctify = val => 255 * Math.pow(val / 255, 1 / wmGamma.value);
    for(let i = 0, len=data.length; i < len; i+=4) {
      data[i] = correctify(data[i]);
      data[i+1] = correctify(data[i+1]);
      data[i+2] = correctify(data[i+2]);
    }
    imgData.data.set(data);
    tempCtx.clearRect(0, 0, wmSize.value - 0, wmSize.value * wmRatio);
    tempCtx.putImageData(imgData, 0, 0);
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(tempCanvas, 0, 0);
  };
  wmFile.addEventListener('change', function(e) {
    let file = e.target.files[0];
    e.target.parentNode.querySelector('label').innerText = file.name;
    if(!file.type.match('image.*')) {
      errorBox.style.display = 'block';
      errorMessage.innerText = '対応していないファイル形式です';
      return false;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      let img = new Image();
      img.src = e.target.result;
      img.onload = function() {
        wmImg = img;
        wmSize.value = img.width;
        wmRatio = img.height / img.width;
        wmDownloadButton.style.display = "inline";
        watermark();
      };
    };
    reader.readAsDataURL(file);
  }, {passive: false});

  /** dataURIからBlobに変換して返す */
  function dataURItoBlob(dataURI) {
    const b64 = atob(dataURI.split(',')[1])
    const u8 = Uint8Array.from(b64.split(""), e => e.charCodeAt())
    return new Blob([u8], {type: "image/png"})
  }

  /** 暗号化画像保存ボタン */
  wmDownloadButton.addEventListener('click', function() {
    const dataURI = canvas.toDataURL();
    const blob = dataURItoBlob(dataURI);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = 'watermark_' + name;
    a.href = url;
    a.click();
    setTimeout(function() {
      URL.revokeObjectURL(url);
    }, Math.max(3000, 1000 * dataURI.length / 1024 * 1024));
  });

}(window, document));
