import {branch, renderNothing} from 'recompose';

export default conditionFn => branch(conditionFn, renderNothing);
