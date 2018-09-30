import {complement} from 'ramda';
import {compose} from 'recompose';
import {connect} from 'react-redux-lean';
import {isListLoadingSelector as isLoading} from 'modules/items';
import {Loader} from 'components';

export default compose(
  connect(
    {hidden: complement(isLoading)},
    {}
  )
)(Loader);
