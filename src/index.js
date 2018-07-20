const formValidation = () => {
  const inputs = document.querySelectorAll('input, textarea');

  inputs.forEach((input) => {
    input.addEventListener('invalid', () => {
      input.classList.add('c-form__input--error');
    });

    input.addEventListener('click', () => {
      input.classList.remove('c-form__input--error');
    });
  });
};

const myLazyLoad = new LazyLoad({
  elements_selector: '.js-lazyload',
});

formValidation();
