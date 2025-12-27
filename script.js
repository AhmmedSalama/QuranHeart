fetch('./heart.svg')
  .then(res => res.text())
  .then(svg => {
    const container = document.getElementById('svg-container');
    container.innerHTML = svg;

    const groups = container.querySelectorAll('.section-group');

    // تحميل الحالة المخزنة عند فتح الصفحة
    loadActiveSections();

    groups.forEach(group => {
      group.addEventListener('click', () => {
        const paths = group.querySelectorAll('.section');
        const isActive = paths[0].classList.contains('active');

        paths.forEach(p => {
          p.classList.toggle('active', !isActive);
        });

        saveActiveSections(); // حفظ الحالة بعد كل تغيير
      });
    });

    // دوال LocalStorage
    function saveActiveSections() {
      const activeIds = [];
      container.querySelectorAll('.section.active').forEach(p => {
        if (p.id) activeIds.push(p.id);
      });
      localStorage.setItem('activeSections', JSON.stringify(activeIds));
    }

    function loadActiveSections() {
      const activeIds = JSON.parse(localStorage.getItem('activeSections')) || [];
      activeIds.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.classList.add('active');
      });
    }

    // Download functionality
    const downloadDesktop = document.getElementById('download-desktop');
    const downloadMobile = document.getElementById('download-mobile');
    const downloadCustom = document.getElementById('download-custom');
    const modal = document.getElementById('custom-modal');
    const modalCancel = document.getElementById('modal-cancel');
    const modalDownload = document.getElementById('modal-download');
    const customWidth = document.getElementById('custom-width');
    const customHeight = document.getElementById('custom-height');

    customWidth.value = window.screen.width;
    customHeight.value = window.screen.height;

    function downloadSVG(width, height) {
      const svgElement = container.querySelector('svg');
      if (!svgElement) return;

      const clonedSVG = svgElement.cloneNode(true);
      const bbox = svgElement.getBBox();
      const svgWidth = bbox.width;
      const svgHeight = bbox.height;
      const svgAspectRatio = svgWidth / svgHeight;
      const targetAspectRatio = width / height;
      let scaledWidth, scaledHeight;

      if (svgAspectRatio > targetAspectRatio) {
        scaledWidth = width * 0.8;
        scaledHeight = scaledWidth / svgAspectRatio;
      } else {
        scaledHeight = height * 0.8;
        scaledWidth = scaledHeight * svgAspectRatio;
      }

      const x = (width - scaledWidth) / 2;
      const y = (height - scaledHeight) / 2;

      clonedSVG.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
      clonedSVG.setAttribute('width', scaledWidth);
      clonedSVG.setAttribute('height', scaledHeight);

      const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      styleElement.textContent = `
        .section { fill: #ffffff; transition: fill 0.25s ease; }
        .section.active { fill: #E5BC69; }
        .section-text { fill: #000000; font-size: 14px; font-weight: bold; pointer-events: none; user-select: none; transition: fill 0.25s ease; }
        .section.active + .section-text { fill: #ffffff; }
      `;
      clonedSVG.insertBefore(styleElement, clonedSVG.firstChild);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = '#222831';
      ctx.fillRect(0, 0, width, height);

      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(clonedSVG);

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = function () {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        canvas.toBlob(function (blob) {
          const link = document.createElement('a');
          link.download = `quran-heart-${width}x${height}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
        }, 'image/png', 1.0);

        URL.revokeObjectURL(url);
      };

      img.src = url;
    }

    downloadDesktop.addEventListener('click', () => downloadSVG(1920, 1080));
    downloadMobile.addEventListener('click', () => downloadSVG(1080, 1920));
    downloadCustom.addEventListener('click', () => modal.classList.add('active'));
    modalCancel.addEventListener('click', () => modal.classList.remove('active'));

    modalDownload.addEventListener('click', () => {
      const width = parseInt(customWidth.value);
      const height = parseInt(customHeight.value);
      if (width >= 100 && width <= 10000 && height >= 100 && height <= 10000) {
        downloadSVG(width, height);
        modal.classList.remove('active');
      } else {
        alert('Please enter valid dimensions between 100 and 10000 pixels.');
      }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  });
