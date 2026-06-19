(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-main-nav]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  const filterBox = document.querySelector('[data-filter-box]');

  if (filterBox) {
    const input = filterBox.querySelector('[data-filter-input]');
    const region = filterBox.querySelector('[data-filter-region]');
    const type = filterBox.querySelector('[data-filter-type]');
    const category = filterBox.querySelector('[data-filter-category]');
    const cards = Array.from(document.querySelectorAll('[data-title]'));
    const empty = document.querySelector('[data-empty-state]');

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function applyFilter() {
      const keyword = valueOf(input);
      const regionValue = valueOf(region);
      const typeValue = valueOf(type);
      const categoryValue = valueOf(category);
      let visible = 0;

      cards.forEach(function (card) {
        const text = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.category
        ].join(' ').toLowerCase();

        const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        const matchRegion = !regionValue || (card.dataset.region || '').toLowerCase() === regionValue;
        const matchType = !typeValue || (card.dataset.type || '').toLowerCase() === typeValue;
        const matchCategory = !categoryValue || (card.dataset.category || '').toLowerCase() === categoryValue;
        const matched = matchKeyword && matchRegion && matchType && matchCategory;

        card.style.display = matched ? '' : 'none';

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [input, region, type, category].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
      }
    });
  }
})();
