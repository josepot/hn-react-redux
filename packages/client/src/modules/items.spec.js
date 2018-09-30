import {assoc, assocPath} from 'ramda';
import items, {
  itemReceived,
  itemsReceived,
  requestItem,
  requestItems,
  selectedIdSelector,
  itemSelector,
} from './items';

describe('modules/items', () => {
  describe('reducers', () => {
    describe('idsList', () => {
      const reducer = items.__get__('idsList');

      test('default value is an empty Array', () => {
        expect(reducer(undefined, {})).toEqual([]);
      });

      test('ITEMS_RECEIVED: it concats new ids in the correct order', () => {
        const intialState = [2, 3, 4];
        const action = itemsReceived([{id: 7}, {id: 1}, {id: 5}]);
        const result = reducer(intialState, action);
        expect(result).toEqual([2, 3, 4, 7, 1, 5]);
      });
    });

    describe('isListLoading', () => {
      const reducer = items.__get__('isListLoading');

      test('default value is false', () => {
        expect(reducer(undefined, {})).toBe(false);
      });

      test('ITEMS_REQUESTED: it switches to true', () => {
        const action = requestItems();
        const result = reducer(false, action);
        expect(result).toBe(true);
      });

      test('ITEMS_RECEIVED: it switches to false', () => {
        const action = itemsReceived([]);
        expect(reducer(true, action)).toBe(false);
        expect(reducer(false, action)).toBe(false);
      });
    });

    describe('itemsDict', () => {
      const reducer = items.__get__('itemsDict');
      const newItems = [
        {id: 1, title: 'title1'},
        {id: 2, title: 'title2'},
        {id: 3, title: 'title3'},
        {id: 4, title: 'title4'},
      ];

      test('default value is an empty object', () => {
        expect(reducer(undefined, {})).toEqual({});
      });

      test('ITEMS_RECEIVED: it adds the new items to the dictionary', () => {
        const action = itemsReceived(newItems);
        const result = reducer({}, action);
        const expectedResult = {
          1: newItems[0],
          2: newItems[1],
          3: newItems[2],
          4: newItems[3],
        };
        expect(result).toEqual(expectedResult);
      });

      test('ITEMS_RECEIVED: it respects the existing items', () => {
        const action = itemsReceived(newItems);
        const initialState = {
          2: {id: 2, title: 'title2', author: 'author2', price: 10},
          4: {id: 4, title: 'title4', author: 'author4', price: 10},
        };
        const result = reducer(initialState, action);
        const expectedResult = {
          1: newItems[0],
          2: initialState[2],
          3: newItems[2],
          4: initialState[4],
        };
        expect(result).toEqual(expectedResult);
      });

      test('ITEM_RECEIVED: it updates the existing item if exists', () => {
        const initialState = reducer({}, itemsReceived(newItems));
        const completeItem = {
          id: 2,
          title: 'title2',
          author: 'author2',
          price: 10,
        };
        const action = itemReceived(completeItem);
        const result = reducer(initialState, action);
        const expectedResult = {
          1: newItems[0],
          2: completeItem,
          3: newItems[2],
          4: newItems[3],
        };
        expect(result).toEqual(expectedResult);
      });
    });

    describe('loadingItems', () => {
      const reducer = items.__get__('loadingItems');

      test('default value is an empty object', () => {
        expect(reducer(undefined, {})).toEqual({});
      });

      test('it tracks the items that are being loaded', () => {
        let state = {};
        state = reducer(state, requestItem(1));
        expect(state).toEqual({1: true});
        state = reducer(state, requestItem(5));
        expect(state).toEqual({1: true, 5: true});
      });

      test('it untracks them once they are loaded', () => {
        let state = {1: true, 5: true};
        state = reducer(state, itemReceived({id: 5}));
        expect(state).toEqual({1: true});
        state = reducer(state, itemReceived({id: 1}));
        expect(state).toEqual({});
      });
    });
  });

  describe('selectors', () => {
    const state = {
      items: {
        idsList: [1, 2, 3, 4],
        isListLoading: true,
        itemsDict: {
          1: {id: 1, title: 'title1'},
          2: {id: 2, title: 'title2', author: 'author2', price: 10},
          3: {id: 3, title: 'title3'},
          4: {id: 4, title: 'title4'},
        },
        loadingItems: {
          1: true,
          4: true,
        },
      },
      router: {
        location: {
          pathname: '/list/4',
          search: '',
          hash: '',
          key: '3nufew',
        },
        action: 'PUSH',
      },
    };

    describe('selectedIdSelector', () => {
      it('returns the selected id', () => {
        expect(selectedIdSelector(state)).toBe(4);

        const rootPathState = assocPath(
          ['router', 'location', 'pathname'],
          '/list',
          state
        );
        expect(selectedIdSelector(rootPathState)).toBe(null);
      });
    });

    describe('itemSelector', () => {
      it('returns the computed item data and memoizes it', () => {
        const item4Data = itemSelector(state, {id: 4});
        expect(item4Data).toEqual({
          id: 4,
          title: 'title4',
          isLoading: true,
          isSelected: true,
        });

        const item2Data = itemSelector(state, {id: 2});
        expect(item2Data).toEqual({
          id: 2,
          title: 'title2',
          author: 'author2',
          price: 10,
          isLoading: false,
          isSelected: false,
        });

        const item4DataAgain = itemSelector(state, {id: 4});
        expect(item4DataAgain).toBe(item4Data);

        const newState = assoc(
          'items',
          items(
            state.items,
            itemReceived({
              id: 4,
              title: 'title4',
              author: 'author4',
              price: 20,
            })
          ),
          state
        );

        const newItem4 = itemSelector(newState, {id: 4});
        expect(newItem4).toEqual({
          id: 4,
          title: 'title4',
          author: 'author4',
          price: 20,
          isLoading: false,
          isSelected: true,
        });

        const item2DataAgain = itemSelector(newState, {id: 2});
        expect(item2DataAgain).toBe(item2Data);
      });
    });
  });
});
