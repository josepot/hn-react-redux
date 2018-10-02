import {all, fork} from 'redux-saga/effects';
import {saga as items} from './items';
import {saga as router} from './router';

export default function*() {
  yield all([items, router].map(fork));
}
