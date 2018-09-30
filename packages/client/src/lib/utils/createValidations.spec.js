import createValidations from './createValidations';

const isNotEmpty = x => !!x;
const isValidPrice = x => typeof x === 'number' && x > 0;

const title = `Title can't be blank`;
const author = `Please enter the author's name`;
const price = 'Please enter a valid price';

describe('createValidations', () => {
  it('returns a valid Formik validate function', () => {
    const validate = createValidations({
      title: [isNotEmpty, title],
      author: [isNotEmpty, author],
      price: [isValidPrice, price],
    });

    let result = validate({
      title: 'Foo',
      author: undefined,
      price: -5,
    });

    expect(result).toEqual({author, price});

    result = validate({
      title: '',
      author: 'Foo',
      price: 5,
    });

    expect(result).toEqual({title});
  });
});
